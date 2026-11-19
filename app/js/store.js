// store.js — localStorage progress for the companion: the earned set, per-trophy
// counters for trophies with a target, and settings (spoiler shield). Export/import
// moves the whole state as one JSON document. Nothing ever leaves the browser.

const KEY = 'leonida-platinum-companion-v1';

export function emptyState() {
  return { earned: [], counters: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      spoiler: !!parsed.spoiler,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportState(state) {
  return JSON.stringify({ app: 'leonida-platinum-companion', version: 1, ...state }, null, 2);
}

export function importState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.earned)) throw new Error('That file does not look like companion progress.');
  return {
    earned: parsed.earned.filter((n) => typeof n === 'number'),
    counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
    spoiler: !!parsed.spoiler,
  };
}
