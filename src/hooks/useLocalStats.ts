import { useSyncExternalStore } from "react";
import { loadStats, subscribeStats, EMPTY_STATS } from "../store/localStorage";
import type { LocalStats } from "../types";

let snapshot: LocalStats = loadStats();

// Stable module-level functions so useSyncExternalStore doesn't re-subscribe on every render.
// subscribe refreshes the snapshot on each (re)mount so a returning component never reads stale data.
function subscribe(cb: () => void): () => void {
  snapshot = loadStats();
  return subscribeStats(() => {
    snapshot = loadStats();
    cb();
  });
}

function getSnapshot(): LocalStats {
  return snapshot;
}

export function useLocalStats(): LocalStats {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({ ...EMPTY_STATS, history: [] }));
}
