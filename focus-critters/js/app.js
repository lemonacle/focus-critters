import { loadState, saveState } from "./core/storage.js";
import {
  startTimer,
  pauseTimer,
  resetCurrentTimer,
  resetToFocus,
  skipPhase,
  configureTimer,
  getTimerState,
  formatTime
} from "./core/timer.js";
import { completeFocusRun, completeRestRun, buyCritter } from "./core/nectar.js";
import { renderShop } from "./ui/shop.js";
import { renderCollection } from "./ui/collection.js";
import { renderLog } from "./ui/runlog.js";
import { showTab } from "./ui/screens.js";
import { playFocusAlarm, playRestAlarm, unlockAudio } from "./core/sound.js";

const state = loadState();

function updateRoundSettingsUI() {
  const bodyEl = document.getElementById("roundSettingsBody");
  const toggleBtn = document.getElementById("toggleRoundSettingsBtn");

  if (!bodyEl || !toggleBtn) return;

  const collapsed = !!state.roundSettingsCollapsed;

  bodyEl.classList.toggle("is-collapsed", collapsed);
  toggleBtn.textContent = collapsed ? "Show" : "Hide";
  toggleBtn.setAttribute("aria-expanded", String(!collapsed));
}

function toggleRoundSettings() {
  state.roundSettingsCollapsed = !state.roundSettingsCollapsed;
  saveState(state);
  updateRoundSettingsUI();
}

function setNotice(text) {
  const noticeEl = document.getElementById("notice");
  if (noticeEl) {
    noticeEl.textContent = text;
  }
}

function addLog(stateToUpdate, text) {
  stateToUpdate.log.unshift({
    text,
    time: new Date().toLocaleString()
  });

  stateToUpdate.log = stateToUpdate.log.slice(0, 30);
  saveState(stateToUpdate);
  renderLog(stateToUpdate);
}

function updateTimerUI() {
  const timerState = getTimerState();

  const timerEl = document.getElementById("timer");
  const modeLabelEl = document.getElementById("modeLabel");
  const progressBarEl = document.getElementById("progressBar");
  const focusValueEl = document.getElementById("focusDurationValue");
  const restValueEl = document.getElementById("restDurationValue");
  const cycleTargetEl = document.getElementById("cycleTargetValue");
  const cycleRemainingEl = document.getElementById("cycleRemainingValue");

  if (timerEl) {
    timerEl.textContent = formatTime(timerState.timeLeft);
  }

  if (modeLabelEl) {
    modeLabelEl.textContent = timerState.mode === "focus" ? "Focus Session" : "Rest Session";
  }

  if (progressBarEl) {
    const pct = timerState.totalTime > 0
      ? (timerState.timeLeft / timerState.totalTime) * 100
      : 0;

    progressBarEl.style.width = `${pct}%`;
  }

  if (focusValueEl) {
    focusValueEl.textContent = formatTime(state.focusDuration);
  }

  if (restValueEl) {
    restValueEl.textContent = formatTime(state.restDuration);
  }

  if (cycleTargetEl) {
    cycleTargetEl.textContent = state.cycleTarget;
  }

  if (cycleRemainingEl) {
    cycleRemainingEl.textContent = state.cyclesRemaining;
  }
}

function updateStatsUI(stateToUpdate) {
  const nectarStatEl = document.getElementById("nectarStat");
  const runsStatEl = document.getElementById("runsStat");
  const ownedStatEl = document.getElementById("ownedStat");
  const restStatEl = document.getElementById("restStat");

  if (nectarStatEl) {
    nectarStatEl.textContent = stateToUpdate.nectar;
  }

  if (runsStatEl) {
    runsStatEl.textContent = stateToUpdate.focusRuns;
  }

  if (ownedStatEl) {
    ownedStatEl.textContent = `${stateToUpdate.owned.length}/100`;
  }

  if (restStatEl) {
    restStatEl.textContent = stateToUpdate.restRuns;
  }
}

function renderAll(state) {
  updateTimerUI();
  updateStatsUI(state);
  updateRoundSettingsUI();
  renderShop(state, handleBuyCritter);
  renderCollection(state);
  renderLog(state);
}

function syncTimerPreferences(options = {}) {
  configureTimer({
    focusSeconds: state.focusDuration,
    restSeconds: state.restDuration,
    ...options
  });
}

function isTimerRunning() {
  return getTimerState().running;
}

function resetRoundToPreference() {
  state.cyclesRemaining = state.cycleTarget;
  saveState(state);
}

function handleTimerComplete(completedMode) {
  if (completedMode === "focus") {
    playFocusAlarm();

    completeFocusRun(state, (text) => addLog(state, text));
    saveState(state);
    updateStatsUI(state);
    renderShop(state, handleBuyCritter);
    updateTimerUI();
    setNotice("Focus complete. +10 Nectar. Rest started.");
    return {
      stop: false,
      nextMode: "rest"
    };
  }

  playRestAlarm();

  completeRestRun(state, (text) => addLog(state, text));
  state.cyclesRemaining = Math.max(0, state.cyclesRemaining - 1);
  saveState(state);
  updateStatsUI(state);
  updateTimerUI();

  if (state.cyclesRemaining <= 0) {
    resetRoundToPreference();
    updateTimerUI();
    setNotice("Round complete. Timers restored and ready to start again.");
    return {
      stop: true,
      nextMode: "focus"
    };
  }

  setNotice(`Rest complete. ${state.cyclesRemaining} cycle(s) remaining.`);
  return {
    stop: false,
    nextMode: "focus"
  };
}

function handleBuyCritter(critterName) {
  const result = buyCritter(state, critterName, (text) => addLog(state, text));

  if (!result.success) {
    if (result.reason === "already-owned") {
      setNotice("You already own that critter.");
      return;
    }

    if (result.reason === "not-enough-nectar") {
      setNotice("Not enough Nectar.");
      return;
    }
  }

  saveState(state);
  updateStatsUI(state);
  renderShop(state, handleBuyCritter);
  renderCollection(state);
  setNotice(`${critterName} joined your collection.`);
}

async function handleStartTimer() {
  await unlockAudio();

  if (getTimerState().mode === "focus" && state.cyclesRemaining <= 0) {
    resetRoundToPreference();
  }

  setNotice(getTimerState().mode === "focus" ? "Focus started." : "Rest started.");

  startTimer(
    () => {
      updateTimerUI();
    },
    (completedMode) => {
      return handleTimerComplete(completedMode);
    }
  );
}

function handlePauseTimer() {
  pauseTimer();
  setNotice("Paused.");
}

function handleResetCurrentTimer() {
  resetCurrentTimer();
  updateTimerUI();
  setNotice("Timer reset.");
}

function handleSkipPhase() {
  skipPhase();
  updateTimerUI();
  setNotice("Current timer set to 5 seconds.");
}

function adjustFocusDuration(deltaSeconds) {
  if (isTimerRunning()) {
    setNotice("Pause the timer before changing focus duration.");
    return;
  }

  state.focusDuration = Math.max(300, state.focusDuration + deltaSeconds);
  saveState(state);

  syncTimerPreferences({ resetCurrentPhase: getTimerState().mode === "focus" });
  updateTimerUI();
  setNotice(`Focus duration set to ${formatTime(state.focusDuration)}.`);
}

function adjustRestDuration(deltaSeconds) {
  if (isTimerRunning()) {
    setNotice("Pause the timer before changing rest duration.");
    return;
  }

  state.restDuration = Math.max(300, state.restDuration + deltaSeconds);
  saveState(state);

  syncTimerPreferences({ resetCurrentPhase: getTimerState().mode === "rest" });
  updateTimerUI();
  setNotice(`Rest duration set to ${formatTime(state.restDuration)}.`);
}

function adjustCycleTarget(delta) {
  if (isTimerRunning()) {
    setNotice("Pause the timer before changing cycles.");
    return;
  }

  state.cycleTarget = Math.max(1, state.cycleTarget + delta);
  state.cyclesRemaining = state.cycleTarget;
  saveState(state);

  updateTimerUI();
  setNotice(`Cycle target set to ${state.cycleTarget}.`);
}

function bindEvents() {
  const startButton = document.getElementById("startBtn");
  const pauseButton = document.getElementById("pauseBtn");
  const resetButton = document.getElementById("resetBtn");
  const skipButton = document.getElementById("skipBtn");
  const toggleRoundSettingsBtn = document.getElementById("toggleRoundSettingsBtn");

  const focusMinusBtn = document.getElementById("focusMinusBtn");
  const focusPlusBtn = document.getElementById("focusPlusBtn");
  const restMinusBtn = document.getElementById("restMinusBtn");
  const restPlusBtn = document.getElementById("restPlusBtn");
  const cycleMinusBtn = document.getElementById("cycleMinusBtn");
  const cyclePlusBtn = document.getElementById("cyclePlusBtn");

  if (toggleRoundSettingsBtn) {
    toggleRoundSettingsBtn.addEventListener("click", toggleRoundSettings);
  }

  if (startButton) {
    startButton.addEventListener("click", handleStartTimer);
  }

  if (pauseButton) {
    pauseButton.addEventListener("click", handlePauseTimer);
  }

  if (resetButton) {
    resetButton.addEventListener("click", handleResetCurrentTimer);
  }

  if (skipButton) {
    skipButton.addEventListener("click", handleSkipPhase);
  }

  if (focusMinusBtn) {
    focusMinusBtn.addEventListener("click", () => adjustFocusDuration(-300));
  }

  if (focusPlusBtn) {
    focusPlusBtn.addEventListener("click", () => adjustFocusDuration(300));
  }

  if (restMinusBtn) {
    restMinusBtn.addEventListener("click", () => adjustRestDuration(-300));
  }

  if (restPlusBtn) {
    restPlusBtn.addEventListener("click", () => adjustRestDuration(300));
  }

  if (cycleMinusBtn) {
    cycleMinusBtn.addEventListener("click", () => adjustCycleTarget(-1));
  }

  if (cyclePlusBtn) {
    cyclePlusBtn.addEventListener("click", () => adjustCycleTarget(1));
  }

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;
      if (tabName) {
        showTab(tabName);
      }
    });
  });
}

function init() {
  syncTimerPreferences({ mode: "focus", resetCurrentPhase: true });
  resetToFocus();
  bindEvents();
  renderAll(state);
}

init();