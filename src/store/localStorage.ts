import type { LocalStats, AttemptRecord } from "../types";

const KEY = "devdle_stats";

export const EMPTY_STATS: LocalStats = {
  version: 1,
  currentStreak: 0,
  maxStreak: 0,
  totalSolved: 0,
  totalPlayed: 0,
  history: [],
};

// Subscription infrastructure (used by useLocalStats)
const listeners = new Set<() => void>();

export function subscribeStats(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifyStats(): void {
  for (const l of listeners) l();
}

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
  notifyStats();
}

function calcStreaks(history: AttemptRecord[]): { currentStreak: number; maxStreak: number } {
  const solvedDates = new Set(history.filter((a) => a.solved).map((a) => a.date));
  const sorted = [...solvedDates].sort();

  if (sorted.length === 0) return { currentStreak: 0, maxStreak: 0 };

  // Longest consecutive run of days
  let maxStreak = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = (Date.parse(sorted[i]) - Date.parse(sorted[i - 1])) / 86_400_000;
    streak = diffDays === 1 ? streak + 1 : 1;
    if (streak > maxStreak) maxStreak = streak;
  }

  // Walk backwards from today; if today not yet solved, start from yesterday
  const today = new Date().toISOString().slice(0, 10);
  let currentStreak = 0;
  const d = new Date(today + "T00:00:00.000Z");
  if (!solvedDates.has(today)) d.setUTCDate(d.getUTCDate() - 1);
  while (solvedDates.has(d.toISOString().slice(0, 10))) {
    currentStreak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }

  return { currentStreak, maxStreak };
}

export function recordAttempt(
  date: string,
  problemId: string,
  solved: boolean,
  attempts: number,
): void {
  const stats = loadStats();
  const existingIdx = stats.history.findIndex((a) => a.problemId === problemId);
  const alreadySolved = existingIdx >= 0 && stats.history[existingIdx].solved;

  // Never overwrite a solved record
  if (alreadySolved) return;

  const record: AttemptRecord = {
    date,
    problemId,
    solved,
    attempts,
    solvedAtMs: solved ? Date.now() : null,
  };

  if (existingIdx >= 0) {
    stats.history[existingIdx] = record;
  } else {
    stats.history.push(record);
    stats.totalPlayed++;
  }

  if (solved) stats.totalSolved++;

  const { currentStreak, maxStreak } = calcStreaks(stats.history);
  stats.currentStreak = currentStreak;
  stats.maxStreak = Math.max(maxStreak, stats.maxStreak);

  saveStats(stats);
}
