import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiHelpCircle, FiSun, FiMoon, FiSettings } from "react-icons/fi";
import { usePrefs } from "../../hooks/usePrefs";
import { getPuzzleNumber } from "../../config";

interface HeaderProps {
  date: string;
  centerContent?: ReactNode;
  onTutorialClick: () => void;
  onStatsClick?: () => void;
  onSettingsClick?: () => void;
}

export function Header({ date, centerContent, onTutorialClick, onStatsClick, onSettingsClick }: HeaderProps) {
  const [prefs, updatePrefs] = usePrefs();

  const isDark =
    prefs.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : prefs.theme === "dark";

  function toggleTheme() {
    updatePrefs({ theme: isDark ? "light" : "dark" });
  }

  const puzzleNumber = getPuzzleNumber(date);

  return (
    <header className="bg-surface border-b border-border px-4 h-12 flex items-center shrink-0">
      <div className="flex-1 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <img src="/brand.png" alt="" className="h-6 object-cover" />
          <span className="font-serif font-bold text-text-primary text-lg tracking-tight italic">Devdle</span>
        </Link>
        <span className="text-text-secondary text-xs bg-surface border border-border rounded px-1.5 py-0.5">#{puzzleNumber}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {centerContent}
      </div>
      <div className="flex-1 flex items-center justify-end gap-0.5">
        {onStatsClick && (
          <button
            onClick={onStatsClick}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md cursor-pointer"
            aria-label="Stats"
          >
            <FiUser size={15} />
          </button>
        )}
        <button
          onClick={onTutorialClick}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md cursor-pointer"
          aria-label="How it works"
        >
          <FiHelpCircle size={15} />
        </button>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md cursor-pointer"
            aria-label="Settings"
          >
            <FiSettings size={15} />
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md cursor-pointer"
          aria-label="Toggle theme"
        >
          {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>
      </div>
    </header>
  );
}
