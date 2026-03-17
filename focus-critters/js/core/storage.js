const STORAGE_KEY = "focusCrittersEmojiTestV1";

export const defaultState = {
  nectar: 0,
  focusRuns: 0,
  restRuns: 0,
  owned: [],
  log: [],
  focusDuration: 1500,
  restDuration: 300,
  cycleTarget: 1,
  cyclesRemaining: 1,
  roundSettingsCollapsed: true
};

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultState),
      ...parsed
    };
  } catch (error) {
    console.error("Failed to parse save data:", error);
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(defaultState);
}

export function exportSave() {
  return JSON.stringify(loadState());
}

export function importSave(saveString) {
  try {
    const parsed = JSON.parse(saveString);
    const merged = {
      ...structuredClone(defaultState),
      ...parsed
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error("Invalid save data:", error);
    return null;
  }
}