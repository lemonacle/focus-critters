export const DEFAULT_ACTION_SECONDS = 1500;
export const DEFAULT_REST_SECONDS = 300;
export const MIN_TIMER_SECONDS = 300;

let timer = null;
let phase = "action"; // "action" | "rest"
let selectedAction = null; // "explore" | "extract" | "expand" | null
let actionSeconds = DEFAULT_ACTION_SECONDS;
let restSeconds = DEFAULT_REST_SECONDS;
let totalTime = actionSeconds;
let timeLeft = actionSeconds;

function clampSeconds(seconds) {
  return Math.max(MIN_TIMER_SECONDS, Math.floor(seconds));
}

function getDurationForPhase(targetPhase) {
  return targetPhase === "action" ? actionSeconds : restSeconds;
}

function setPhase(targetPhase, nextSelectedAction = selectedAction) {
  phase = targetPhase;
  selectedAction = targetPhase === "action" ? nextSelectedAction : null;
  totalTime = getDurationForPhase(targetPhase);
  timeLeft = totalTime;
}

export function configureTimer(config = {}) {
  if (typeof config.actionSeconds === "number") {
    actionSeconds = clampSeconds(config.actionSeconds);
  }

  if (typeof config.restSeconds === "number") {
    restSeconds = clampSeconds(config.restSeconds);
  }

  if (config.phase === "action" || config.phase === "rest") {
    phase = config.phase;
  }

  if (
    config.selectedAction === "explore" ||
    config.selectedAction === "extract" ||
    config.selectedAction === "expand" ||
    config.selectedAction === null
  ) {
    selectedAction = phase === "action" ? config.selectedAction : null;
  }

  totalTime = getDurationForPhase(phase);

  if (typeof config.timeLeft === "number") {
    timeLeft = Math.min(clampSeconds(config.timeLeft), totalTime);
  } else if (config.resetCurrentPhase === true) {
    timeLeft = totalTime;
  }
}

export function getTimerState() {
  return {
    phase,
    selectedAction,
    totalTime,
    timeLeft,
    running: timer !== null,
    actionSeconds,
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

    const completedPhase = phase;
    const completedAction = selectedAction;

    const result = onPhaseComplete
      ? onPhaseComplete(completedPhase, getTimerState())
      : {};

    const nextPhase =
      result && (result.nextPhase === "action" || result.nextPhase === "rest")
        ? result.nextPhase
        : completedPhase === "action"
          ? "rest"
          : "action";

    const nextSelectedAction =
      result &&
      (result.nextSelectedAction === "explore" ||
        result.nextSelectedAction === "extract" ||
        result.nextSelectedAction === "expand" ||
        result.nextSelectedAction === null)
        ? result.nextSelectedAction
        : completedPhase === "rest"
          ? completedAction
          : completedAction;

    if (result && result.stop === true) {
      clearInterval(timer);
      timer = null;
      setPhase(nextPhase, nextSelectedAction);

      if (onTick) {
        onTick(getTimerState());
      }

      return;
    }

    setPhase(nextPhase, nextSelectedAction);

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
  totalTime = getDurationForPhase(phase);
  timeLeft = totalTime;
}

export function resetToAction(nextSelectedAction = null) {
  pauseTimer();
  setPhase("action", nextSelectedAction);
}

export function resetToRest() {
  pauseTimer();
  setPhase("rest", null);
}

export function skipPhase() {
  timeLeft = Math.min(5, totalTime);
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}