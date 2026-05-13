import { useSyncExternalStore } from "react";
import { loadStats, subscribeStats, EMPTY_STATS } from "../store/localStorage";
import type { LocalStats } from "../types";

let snapshot: LocalStats = loadStats();

export function useLocalStats(): LocalStats {
  return useSyncExternalStore(
    (cb) => {
      return subscribeStats(() => {
        snapshot = loadStats();
        cb();
      });
    },
    () => snapshot,
    () => ({ ...EMPTY_STATS, history: [] }),
  );
}
