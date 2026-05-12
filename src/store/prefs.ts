import type { UserPrefs } from "../types";

const KEY = "devdle_prefs";

const defaults: UserPrefs = {
  theme: "system",
  editorFontSize: 14,
  expertMode: false,
  seenTutorial: false,
};

export function loadPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...(JSON.parse(raw) as Partial<UserPrefs>) };
  } catch {
    return { ...defaults };
  }
}

export function savePrefs(prefs: UserPrefs): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
