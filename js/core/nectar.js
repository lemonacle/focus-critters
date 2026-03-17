import { CRITTER_COST } from "../data/critters.js";

export function completeFocusRun(state, addLog) {
  state.nectar += 10;
  state.focusRuns += 1;

  if (addLog) {
    addLog("Completed a focus run and earned 10 Nectar.");
  }
}

export function completeRestRun(state, addLog) {
  state.restRuns += 1;

  if (addLog) {
    addLog("Completed a rest cycle.");
  }
}

export function canAffordCritter(state) {
  return state.nectar >= CRITTER_COST;
}

export function alreadyOwnsCritter(state, critterName) {
  return state.owned.includes(critterName);
}

export function buyCritter(state, critterName, addLog) {
  if (alreadyOwnsCritter(state, critterName)) {
    return {
      success: false,
      reason: "already-owned"
    };
  }

  if (!canAffordCritter(state)) {
    return {
      success: false,
      reason: "not-enough-nectar"
    };
  }

  state.nectar -= CRITTER_COST;
  state.owned.push(critterName);

  if (addLog) {
    addLog(`Bought ${critterName} for ${CRITTER_COST} Nectar.`);
  }

  return {
    success: true,
    reason: null
  };
}