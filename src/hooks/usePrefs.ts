import { useSyncExternalStore, useCallback } from "react";
import { loadPrefs, savePrefs } from "../store/prefs";
import type { UserPrefs } from "../types";

let snapshot: UserPrefs = loadPrefs();
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): UserPrefs {
  return snapshot;
}

export function usePrefs(): [UserPrefs, (patch: Partial<UserPrefs>) => void] {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, loadPrefs);

  const update = useCallback((patch: Partial<UserPrefs>) => {
    snapshot = { ...snapshot, ...patch };
    savePrefs(snapshot);
    for (const l of listeners) l();
  }, []);

  return [prefs, update];
}
