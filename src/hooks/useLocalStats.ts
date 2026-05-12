import { useSyncExternalStore } from "react";
import { loadStats, EMPTY_STATS } from "../store/localStorage";
import type { LocalStats } from "../types";

let snapshot: LocalStats = loadStats();
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): LocalStats {
  return snapshot;
}

export function notifyStatsListeners(): void {
  snapshot = loadStats();
  for (const l of listeners) l();
}

export function useLocalStats(): LocalStats {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({
    ...EMPTY_STATS,
    history: [],
  }));
}
