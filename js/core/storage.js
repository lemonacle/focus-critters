const STORAGE_KEY = "focusCrittersEmojiTestV2";

export const defaultState = {
  resources: {
    nectar: 0,
    materials: 0
  },

  // critterId -> quantity
  stable: {},

  activeCompanionId: null,

  progression: {
    expansionLevel: 0,
    expansionPoints: 0
  },

  stats: {
    exploreRuns: 0,
    extractRuns: 0,
    expandRuns: 0,
    restRuns: 0
  },

  timer: {
    actionDuration: 1500,
    restDuration: 300,
    cycleTarget: 1,
    cyclesRemaining: 1,
    selectedAction: "explore"
  },

  ui: {
    roundSettingsCollapsed: true
  },

  log: []
};

function deepMerge(target, source) {
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    return source;
  }

  const output = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  }

  return output;
}

function cloneDefaultState() {
  return structuredClone(defaultState);
}

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return cloneDefaultState();
  }

  try {
    const parsed = JSON.parse(saved);
    return deepMerge(cloneDefaultState(), parsed);
  } catch (error) {
    console.error("Failed to parse save data:", error);
    return cloneDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return cloneDefaultState();
}

export function exportSave() {
  return JSON.stringify(loadState());
}

export function importSave(saveString) {
  try {
    const parsed = JSON.parse(saveString);
    const merged = deepMerge(cloneDefaultState(), parsed);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error("Invalid save data:", error);
    return null;
  }
}