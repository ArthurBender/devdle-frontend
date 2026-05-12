import type { LocalStats } from "../types";

const KEY = "devdle_stats";

export const EMPTY_STATS: LocalStats = {
  version: 1,
  currentStreak: 0,
  maxStreak: 0,
  totalSolved: 0,
  totalPlayed: 0,
  history: [],
};

export function loadStats(): LocalStats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STATS, history: [] };
    return { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<LocalStats>) };
  } catch {
    return { ...EMPTY_STATS, history: [] };
  }
}

export function saveStats(stats: LocalStats): void {
  localStorage.setItem(KEY, JSON.stringify(stats));
}
