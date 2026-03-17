export const DEFAULT_FOCUS_SECONDS = 1500;
export const DEFAULT_REST_SECONDS = 300;
export const MIN_TIMER_SECONDS = 300;

let timer = null;
let mode = "focus";
let focusSeconds = DEFAULT_FOCUS_SECONDS;
let restSeconds = DEFAULT_REST_SECONDS;
let totalTime = focusSeconds;
let timeLeft = focusSeconds;

function clampSeconds(seconds) {
  return Math.max(MIN_TIMER_SECONDS, Math.floor(seconds));
}

function getDurationForMode(targetMode) {
  return targetMode === "focus" ? focusSeconds : restSeconds;
}

function setPhase(targetMode) {
  mode = targetMode;
  totalTime = getDurationForMode(targetMode);
  timeLeft = totalTime;
}

export function configureTimer(config = {}) {
  if (typeof config.focusSeconds === "number") {
    focusSeconds = clampSeconds(config.focusSeconds);
  }

  if (typeof config.restSeconds === "number") {
    restSeconds = clampSeconds(config.restSeconds);
  }

  if (config.mode === "focus" || config.mode === "rest") {
    mode = config.mode;
  }

  totalTime = getDurationForMode(mode);

  if (typeof config.timeLeft === "number") {
    timeLeft = Math.min(clampSeconds(config.timeLeft), totalTime);
  } else if (config.resetCurrentPhase === true) {
    timeLeft = totalTime;
  }
}

export function getTimerState() {
  return {
    mode,
    totalTime,
    timeLeft,
    running: timer !== null,
    focusSeconds,
    restSeconds
  };
}

export function startTimer(onTick, onPhaseComplete) {
  if (timer) return;

  timer = setInterval(() => {
    timeLeft -= 1;

    if (onTick) {
      onTick(getTimerState());
    }

    if (timeLeft > 0) {
      return;
    }

    const completedMode = mode;
    const result = onPhaseComplete ? onPhaseComplete(completedMode, getTimerState()) : {};
    const nextMode =
      result && (result.nextMode === "focus" || result.nextMode === "rest")
        ? result.nextMode
        : completedMode === "focus"
          ? "rest"
          : "focus";

    if (result && result.stop === true) {
      clearInterval(timer);
      timer = null;
      setPhase(nextMode);

      if (onTick) {
        onTick(getTimerState());
      }

      return;
    }

    setPhase(nextMode);

    if (onTick) {
      onTick(getTimerState());
    }
  }, 1000);
}

export function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export function resetCurrentTimer() {
  pauseTimer();
  totalTime = getDurationForMode(mode);
  timeLeft = totalTime;
}

export function resetToFocus() {
  pauseTimer();
  setPhase("focus");
}

export function skipPhase() {
  timeLeft = Math.min(5, totalTime);
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}