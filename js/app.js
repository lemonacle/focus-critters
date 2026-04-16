import { loadState, saveState } from "./core/storage.js";
import {
  startTimer,
  pauseTimer,
  resetCurrentTimer,
  resetToAction,
  skipPhase,
  configureTimer,
  getTimerState,
  formatTime
} from "./core/timer.js";
import { critters } from "./data/critters.js";
import { renderCollection } from "./ui/collection.js";
import { renderLog } from "./ui/runlog.js";
import { showTab } from "./ui/screens.js";

const state = loadState();

const EXPLORE_COST = 10;
const EXTRACT_BASE = 10;
const EXPAND_POINTS_PER_RUN = 1;
const EXPANSION_POINTS_PER_LEVEL = 5;
const BASE_FIND_CHANCE = 0.35;
const BASE_MATERIAL_CHANCE = 0.45;

let timerPanelVisible = false;

function updateRoundSettingsUI() {
  const bodyEl = document.getElementById("roundSettingsBody");
  const toggleBtn = document.getElementById("toggleRoundSettingsBtn");

  if (!bodyEl || !toggleBtn) return;

  const collapsed = !!state.ui.roundSettingsCollapsed;

  bodyEl.classList.toggle("is-collapsed", collapsed);
  toggleBtn.textContent = collapsed ? "Show" : "Hide";
  toggleBtn.setAttribute("aria-expanded", String(!collapsed));
}

function toggleRoundSettings() {
  state.ui.roundSettingsCollapsed = !state.ui.roundSettingsCollapsed;
  saveState(state);
  updateRoundSettingsUI();
}

function setNotice(text) {
  const noticeEl = document.getElementById("notice");
  if (noticeEl) {
    noticeEl.textContent = text;
  }
}

function addLog(text) {
  state.log.unshift({
    text,
    time: new Date().toLocaleString()
  });

  state.log = state.log.slice(0, 30);
  saveState(state);
  renderLog(state);
}

function getUniqueCritterCount() {
  return Object.values(state.stable).filter((qty) => qty > 0).length;
}

function getCritterById(id) {
  return critters.find((critter) => critter.id === id) || null;
}

function getActiveCompanion() {
  if (state.activeCompanionId === null || state.activeCompanionId === undefined) {
    return null;
  }

  return getCritterById(state.activeCompanionId);
}

function getTotalExtractBonus() {
  let bonus = 0;

  for (const [id, qty] of Object.entries(state.stable)) {
    const critter = getCritterById(Number(id));
    if (!critter || !qty) continue;

    bonus += (critter.passives?.extractBonus || 0) * qty;
  }

  return bonus;
}

function getExploreFindChance() {
  const expansionBonus = state.progression.expansionLevel * 0.03;
  return Math.min(0.9, BASE_FIND_CHANCE + expansionBonus);
}

function getWeightedExplorePool() {
  const companion = getActiveCompanion();

  return critters.map((critter) => {
    let weight = 1;

    if (companion && critter.group === companion.group) {
      weight += companion.passives?.exploreGroupBonus || 0;
      weight += 1;
    }

    weight += state.progression.expansionLevel * 0.02;

    return {
      id: critter.id,
      weight
    };
  });
}

function pickWeightedCritterId() {
  const pool = getWeightedExplorePool();
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    return critters[0]?.id ?? null;
  }

  let roll = Math.random() * totalWeight;

  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.id;
    }
  }

  return pool[pool.length - 1]?.id ?? null;
}

function addCritterToStable(critterId, qty = 1) {
  const key = String(critterId);
  state.stable[key] = (state.stable[key] || 0) + qty;

  if (state.activeCompanionId === null) {
    state.activeCompanionId = critterId;
  }
}

function updateActionVisibility() {
  const actionPicker = document.getElementById("actionPicker");
  const timerPanel = document.getElementById("timerPanel");

  if (!actionPicker || !timerPanel) return;

  actionPicker.classList.toggle("is-hidden", timerPanelVisible);
  timerPanel.classList.toggle("is-hidden", !timerPanelVisible);
}

function getActionLabel(action) {
  if (action === "explore") return "Explore Run";
  if (action === "extract") return "Extract Run";
  if (action === "expand") return "Expand Run";
  return "Action Run";
}

function updateTimerUI() {
  const timerState = getTimerState();

  const timerEl = document.getElementById("timer");
  const modeLabelEl = document.getElementById("modeLabel");
  const progressBarEl = document.getElementById("progressBar");
  const actionValueEl = document.getElementById("focusDurationValue");
  const restValueEl = document.getElementById("restDurationValue");
  const cycleTargetEl = document.getElementById("cycleTargetValue");
  const cycleRemainingEl = document.getElementById("cycleRemainingValue");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const skipBtn = document.getElementById("skipBtn");

  if (timerEl) {
    timerEl.textContent = formatTime(timerState.timeLeft);
  }

  if (modeLabelEl) {
    modeLabelEl.textContent =
      timerState.phase === "rest"
        ? "Rest"
        : getActionLabel(timerState.selectedAction || state.timer.selectedAction);
  }

  if (progressBarEl) {
    const pct = timerState.totalTime > 0
      ? (timerState.timeLeft / timerState.totalTime) * 100
      : 0;

    progressBarEl.style.width = `${pct}%`;
  }

  if (actionValueEl) {
    actionValueEl.textContent = formatTime(state.timer.actionDuration);
  }

  if (restValueEl) {
    restValueEl.textContent = formatTime(state.timer.restDuration);
  }

  if (cycleTargetEl) {
    cycleTargetEl.textContent = state.timer.cycleTarget;
  }

  if (cycleRemainingEl) {
    cycleRemainingEl.textContent = state.timer.cyclesRemaining;
  }

  if (pauseBtn) {
    pauseBtn.textContent = timerState.running ? "Pause" : "Resume";
  }

  if (pauseBtn) {
    pauseBtn.disabled = !timerPanelVisible;
  }

  if (resetBtn) {
    resetBtn.disabled = !timerPanelVisible;
  }

  if (skipBtn) {
    skipBtn.disabled = !timerPanelVisible;
  }

  updateActionVisibility();
}

function updateStatsUI() {
  const nectarStatEl = document.getElementById("nectarStat");
  const materialsStatEl = document.getElementById("materialsStat");
  const ownedStatEl = document.getElementById("ownedStat");
  const restStatEl = document.getElementById("restStat");

  if (nectarStatEl) {
    nectarStatEl.textContent = state.resources.nectar;
  }

  if (materialsStatEl) {
    materialsStatEl.textContent = state.resources.materials;
  }

  if (ownedStatEl) {
    ownedStatEl.textContent = getUniqueCritterCount();
  }

  if (restStatEl) {
    restStatEl.textContent = state.stats.restRuns;
  }
}

function renderAll() {
  updateTimerUI();
  updateStatsUI();
  updateRoundSettingsUI();
  renderCollection(state);
  renderLog(state);
}

function syncTimerPreferences(options = {}) {
  configureTimer({
    actionSeconds: state.timer.actionDuration,
    restSeconds: state.timer.restDuration,
    ...options
  });
}

function isTimerRunning() {
  return getTimerState().running;
}

function completeExploreRun() {
  if (state.resources.nectar < EXPLORE_COST) {
    state.timer.selectedAction = null;
    timerPanelVisible = false;
    saveState(state);
    updateActionVisibility();
    updateTimerUI();
    setNotice(`Not enough Nectar. Explore requires ${EXPLORE_COST}.`);

    return {
      stop: true,
      nextPhase: "action",
      nextSelectedAction: null
    };
  }

  state.resources.nectar -= EXPLORE_COST;
  state.stats.exploreRuns += 1;

  let foundCritter = null;
  let foundMaterials = 0;

  if (Math.random() < getExploreFindChance()) {
    const critterId = pickWeightedCritterId();

    if (critterId !== null) {
      addCritterToStable(critterId, 1);
      foundCritter = getCritterById(critterId);
    }
  }

  if (Math.random() < BASE_MATERIAL_CHANCE) {
    foundMaterials = 1 + Math.floor(state.progression.expansionLevel / 3);
    state.resources.materials += foundMaterials;
  }

  const logParts = [`Completed an Explore run and spent ${EXPLORE_COST} Nectar.`];

  if (foundCritter) {
    logParts.push(`Found ${foundCritter.name}.`);
  }

  if (foundMaterials > 0) {
    logParts.push(`Found ${foundMaterials} Materials.`);
  }

  addLog(logParts.join(" "));
  saveState(state);
  updateStatsUI();
  renderCollection(state);
  updateTimerUI();

  const noticeParts = ["Explore complete."];

  if (foundCritter) {
    noticeParts.push(`${foundCritter.name} joined your stable.`);
  }

  if (foundMaterials > 0) {
    noticeParts.push(`+${foundMaterials} Materials.`);
  }

  noticeParts.push("Rest started.");
  setNotice(noticeParts.join(" "));

  return {
    stop: false,
    nextPhase: "rest",
    nextSelectedAction: null
  };
}

function completeExtractRun() {
  state.stats.extractRuns += 1;

  const expansionBonus = state.progression.expansionLevel * 2;
  const critterBonus = getTotalExtractBonus();
  const nectarGained = EXTRACT_BASE + expansionBonus + critterBonus;

  state.resources.nectar += nectarGained;

  addLog(`Completed an Extract run and gained ${nectarGained} Nectar.`);
  saveState(state);
  updateStatsUI();
  updateTimerUI();
  setNotice(`Extract complete. +${nectarGained} Nectar. Rest started.`);

  return {
    stop: false,
    nextPhase: "rest",
    nextSelectedAction: null
  };
}

function completeExpandRun() {
  state.stats.expandRuns += 1;
  state.progression.expansionPoints += EXPAND_POINTS_PER_RUN;

  let leveledUp = false;

  while (state.progression.expansionPoints >= EXPANSION_POINTS_PER_LEVEL) {
    state.progression.expansionPoints -= EXPANSION_POINTS_PER_LEVEL;
    state.progression.expansionLevel += 1;
    leveledUp = true;
  }

  addLog(
    leveledUp
      ? `Completed an Expand run and reached Expansion Level ${state.progression.expansionLevel}.`
      : `Completed an Expand run and gained ${EXPAND_POINTS_PER_RUN} Expansion Point.`
  );

  saveState(state);
  updateStatsUI();
  updateTimerUI();

  if (leveledUp) {
    setNotice(`Expand complete. Expansion Level ${state.progression.expansionLevel}. Rest started.`);
  } else {
    setNotice(`Expand complete. +${EXPAND_POINTS_PER_RUN} Expansion Point. Rest started.`);
  }

  return {
    stop: false,
    nextPhase: "rest",
    nextSelectedAction: null
  };
}

function completeRestRun() {
  state.stats.restRuns += 1;
  state.timer.cyclesRemaining = Math.max(0, state.timer.cyclesRemaining - 1);

  addLog("Completed a rest cycle.");
  saveState(state);
  updateStatsUI();
  updateTimerUI();

  if (state.timer.cyclesRemaining <= 0) {
    state.timer.cyclesRemaining = state.timer.cycleTarget;
    state.timer.selectedAction = null;
    timerPanelVisible = false;
    saveState(state);
    updateActionVisibility();
    updateTimerUI();
    setNotice("Round complete. Choose your next action.");

    return {
      stop: true,
      nextPhase: "action",
      nextSelectedAction: null
    };
  }

  state.timer.selectedAction = null;
  timerPanelVisible = false;
  saveState(state);
  updateActionVisibility();
  updateTimerUI();
  setNotice(`Rest complete. ${state.timer.cyclesRemaining} cycle(s) remaining. Choose your next action.`);

  return {
    stop: true,
    nextPhase: "action",
    nextSelectedAction: null
  };
}

function handleTimerComplete(completedPhase) {
  if (completedPhase === "action") {
    const action = state.timer.selectedAction;

    if (action === "explore") {
      return completeExploreRun();
    }

    if (action === "extract") {
      return completeExtractRun();
    }

    if (action === "expand") {
      return completeExpandRun();
    }

    timerPanelVisible = false;
    updateActionVisibility();
    setNotice("No action selected.");

    return {
      stop: true,
      nextPhase: "action",
      nextSelectedAction: null
    };
  }

  return completeRestRun();
}

function startSelectedAction(action) {
  if (isTimerRunning()) {
    setNotice("Pause or reset the current timer before starting a new action.");
    return;
  }

  if (action === "explore" && state.resources.nectar < EXPLORE_COST) {
    setNotice(`Not enough Nectar. Explore requires ${EXPLORE_COST}.`);
    return;
  }

  state.timer.selectedAction = action;
  timerPanelVisible = true;

  syncTimerPreferences({
    phase: "action",
    selectedAction: action,
    resetCurrentPhase: true
  });

  saveState(state);
  updateTimerUI();
  setNotice(`${getActionLabel(action)} started.`);

  startTimer(
    () => {
      updateTimerUI();
    },
    (completedPhase) => {
      return handleTimerComplete(completedPhase);
    }
  );
}

function handlePauseResume() {
  const timerState = getTimerState();

  if (!timerPanelVisible) {
    return;
  }

  if (timerState.running) {
    pauseTimer();
    updateTimerUI();
    setNotice("Paused.");
    return;
  }

  setNotice(
    timerState.phase === "rest"
      ? "Rest resumed."
      : `${getActionLabel(state.timer.selectedAction)} resumed.`
  );

  startTimer(
    () => {
      updateTimerUI();
    },
    (completedPhase) => {
      return handleTimerComplete(completedPhase);
    }
  );

  updateTimerUI();
}

function handleResetCurrentTimer() {
  pauseTimer();
  resetCurrentTimer();
  resetToAction();

  state.timer.selectedAction = null;
  state.timer.cyclesRemaining = state.timer.cycleTarget;
  timerPanelVisible = false;

  saveState(state);
  updateTimerUI();
  setNotice("Run reset.");
}

function handleSkipPhase() {
  if (!timerPanelVisible) return;

  skipPhase();
  updateTimerUI();
  setNotice("Current timer set to 5 seconds.");
}

function adjustActionDuration(deltaSeconds) {
  if (isTimerRunning()) {
    setNotice("Pause the timer before changing action duration.");
    return;
  }

  state.timer.actionDuration = Math.max(300, state.timer.actionDuration + deltaSeconds);
  saveState(state);

  syncTimerPreferences({
    phase: getTimerState().phase,
    selectedAction: state.timer.selectedAction,
    resetCurrentPhase: getTimerState().phase === "action"
  });

  updateTimerUI();
  setNotice(`Action duration set to ${formatTime(state.timer.actionDuration)}.`);
}

function adjustRestDuration(deltaSeconds) {
  if (isTimerRunning()) {
    setNotice("Pause the timer before changing rest duration.");
    return;
  }

  state.timer.restDuration = Math.max(300, state.timer.restDuration + deltaSeconds);
  saveState(state);

  syncTimerPreferences({
    phase: getTimerState().phase,
    selectedAction: state.timer.selectedAction,
    resetCurrentPhase: getTimerState().phase === "rest"
  });

  updateTimerUI();
  setNotice(`Rest duration set to ${formatTime(state.timer.restDuration)}.`);
}

function adjustCycleTarget(delta) {
  if (isTimerRunning()) {
    setNotice("Pause the timer before changing cycles.");
    return;
  }

  state.timer.cycleTarget = Math.max(1, state.timer.cycleTarget + delta);
  state.timer.cyclesRemaining = state.timer.cycleTarget;
  saveState(state);

  updateTimerUI();
  setNotice(`Cycle target set to ${state.timer.cycleTarget}.`);
}

function bindEvents() {
  const exploreBtn = document.getElementById("exploreBtn");
  const extractBtn = document.getElementById("extractBtn");
  const expandBtn = document.getElementById("expandBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const skipBtn = document.getElementById("skipBtn");
  const toggleRoundSettingsBtn = document.getElementById("toggleRoundSettingsBtn");

  const actionMinusBtn = document.getElementById("focusMinusBtn");
  const actionPlusBtn = document.getElementById("focusPlusBtn");
  const restMinusBtn = document.getElementById("restMinusBtn");
  const restPlusBtn = document.getElementById("restPlusBtn");
  const cycleMinusBtn = document.getElementById("cycleMinusBtn");
  const cyclePlusBtn = document.getElementById("cyclePlusBtn");

  if (toggleRoundSettingsBtn) {
    toggleRoundSettingsBtn.addEventListener("click", toggleRoundSettings);
  }

  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => startSelectedAction("explore"));
  }

  if (extractBtn) {
    extractBtn.addEventListener("click", () => startSelectedAction("extract"));
  }

  if (expandBtn) {
    expandBtn.addEventListener("click", () => startSelectedAction("expand"));
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", handlePauseResume);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", handleResetCurrentTimer);
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", handleSkipPhase);
  }

  if (actionMinusBtn) {
    actionMinusBtn.addEventListener("click", () => adjustActionDuration(-300));
  }

  if (actionPlusBtn) {
    actionPlusBtn.addEventListener("click", () => adjustActionDuration(300));
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
  state.timer.selectedAction = null;
  timerPanelVisible = false;

  syncTimerPreferences({
    phase: "action",
    selectedAction: null,
    resetCurrentPhase: true
  });

  resetToAction();
  bindEvents();
  renderAll();
}

init();