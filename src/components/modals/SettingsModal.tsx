import { useRef, useState } from "react";
import { FiSettings, FiDownload, FiUpload, FiTrash2 } from "react-icons/fi";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { usePrefs } from "../../hooks/usePrefs";
import { loadStats, saveStats } from "../../store/localStorage";
import type { UserPrefs, LocalStats } from "../../types";

interface SettingsModalProps {
  onClose: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [prefs, updatePrefs] = usePrefs();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes: Array<{ value: UserPrefs["theme"]; label: string }> = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const fontSizes: Array<UserPrefs["editorFontSize"]> = [12, 13, 14, 16, 18];

  function handleBackup() {
    const stats = loadStats();
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devdle-stats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    setRestoreError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<LocalStats>;
        if (parsed.version !== 1 || !Array.isArray(parsed.history)) {
          setRestoreError("Invalid backup file.");
          return;
        }
        saveStats(parsed as LocalStats);
      } catch {
        setRestoreError("Could not parse backup file.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    saveStats({
      version: 1,
      currentStreak: 0,
      maxStreak: 0,
      totalSolved: 0,
      totalPlayed: 0,
      history: [],
    });
    setResetConfirm(false);
  }

  return (
    <Modal
      title="Settings"
      subtitle="// preferences · stored locally"
      icon={<FiSettings size={14} />}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-text-secondary">
            v1.0.0 · build {new Date().toISOString().slice(2, 10).replace(/-/g, ".")}
          </span>
          <Button variant="secondary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Appearance */}
        <div>
          <SectionLabel>Appearance</SectionLabel>
          <div className="divide-y divide-border">
            <SettingRow
              label="Theme"
              description="Follows system preference by default."
              control={
                <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                  {themes.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updatePrefs({ theme: value })}
                      className={`px-3 py-1.5 transition-colors ${
                        prefs.theme === value
                          ? "bg-accent text-white font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
            />
            <SettingRow
              label="Editor font size"
              description="Affects the code editor only."
              control={
                <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => updatePrefs({ editorFontSize: size })}
                      className={`px-2.5 py-1.5 transition-colors ${
                        prefs.editorFontSize === size
                          ? "bg-accent text-white font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <SectionLabel>Difficulty</SectionLabel>
          <div className="divide-y divide-border">
            <SettingRow
              label="Expert mode"
              description="Hides individual test names. Shows only the pass/fail count."
              control={
                <Toggle
                  checked={prefs.expertMode}
                  onChange={(v) => updatePrefs({ expertMode: v })}
                />
              }
            />
          </div>
        </div>

        {/* Data */}
        <div>
          <SectionLabel>Data</SectionLabel>
          <div className="divide-y divide-border">
            <SettingRow
              label="Backup stats"
              description="Download your streaks and history as JSON."
              control={
                <Button variant="secondary" size="sm" onClick={handleBackup}>
                  <FiDownload size={12} />
                  Export
                </Button>
              }
            />
            <SettingRow
              label="Restore"
              description="Load a previous backup. Overwrites current local data."
              control={
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestore}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUpload size={12} />
                    Import
                  </Button>
                </>
              }
            />
            {restoreError && (
              <p className="text-xs text-error pt-1">{restoreError}</p>
            )}
            <SettingRow
              label="Reset all stats"
              description="Clears streak, history, and attempts. Cannot be undone."
              control={
                <button
                  onClick={handleReset}
                  className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer px-3 py-1 text-xs rounded-md ${
                    resetConfirm
                      ? "bg-error text-white hover:bg-error/90 border border-error"
                      : "text-error hover:bg-error/10 border border-error"
                  }`}
                >
                  <FiTrash2 size={12} />
                  {resetConfirm ? "Confirm reset" : "Reset"}
                </button>
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
