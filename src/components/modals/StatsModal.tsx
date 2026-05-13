import { useEffect, useState } from "react";
import { FiBarChart2 } from "react-icons/fi";
import { Modal } from "../ui/Modal";
import { useLocalStats } from "../../hooks/useLocalStats";
import type { Language } from "../../types";

interface StatsModalProps {
  onClose: () => void;
}

function useCountdown() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const next = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
      );
      const ms = next.getTime() - now.getTime();
      const h = String(Math.floor(ms / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((ms % 60_000) / 1_000)).padStart(2, "0");
      setLabel(`${h}:${m}:${s}`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return label;
}

const LANG_LABELS: Record<Language, string> = {
  javascript: "JavaScript",
  python: "Python",
  ruby: "Ruby",
};

const LANG_DOT: Record<Language, string> = {
  javascript: "bg-lang-js",
  python: "bg-lang-py",
  ruby: "bg-lang-rb",
};

export function StatsModal({ onClose }: StatsModalProps) {
  const stats = useLocalStats();
  const countdown = useCountdown();

  const winPct =
    stats.totalPlayed === 0
      ? 0
      : Math.round((stats.totalSolved / stats.totalPlayed) * 100);

  // Attempts distribution: bucket into 1, 2, 3, 4, 5+
  const buckets: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5+": 0 };
  for (const r of stats.history) {
    if (!r.solved) continue;
    const key = r.attempts >= 5 ? "5+" : String(r.attempts);
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  const maxBucket = Math.max(...Object.values(buckets), 1);

  // By-language solved counts
  const langCounts: Record<Language, number> = {
    javascript: 0,
    python: 0,
    ruby: 0,
  };
  for (const r of stats.history) {
    if (!r.solved) continue;
    // Problem ID format: YYYY-MM-DD_language_difficulty
    const parts = r.problemId.split("_");
    const lang = parts[1] as Language;
    if (lang in langCounts) langCounts[lang]++;
  }

  const statTiles = [
    { label: "PLAYED", value: stats.totalPlayed },
    { label: "WIN %", value: winPct },
    { label: "CURRENT", value: stats.currentStreak },
    { label: "MAX", value: stats.maxStreak },
  ];

  return (
    <Modal
      title="Statistics"
      subtitle="Your all-time stats"
      icon={<FiBarChart2 size={14} />}
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-2">
          {statTiles.map(({ label, value }) => (
            <div
              key={label}
              className="bg-bg border border-border rounded-lg px-2 py-3 text-center"
            >
              <div className="text-2xl font-bold text-text-primary tabular-nums">
                {value}
              </div>
              <div className="text-text-secondary text-xs mt-0.5 tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Attempts distribution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Attempts Distribution
            </span>
            <span className="text-xs text-text-secondary">runs before solve</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(buckets).map(([key, count]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-text-secondary text-right shrink-0">{key}</span>
                <div className="flex-1 h-5 bg-bg rounded overflow-hidden relative">
                  <div
                    className="h-full bg-accent rounded transition-all duration-500"
                    style={{ width: `${(count / maxBucket) * 100}%` }}
                  />
                  {count > 0 && (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white text-xs font-medium tabular-nums">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By language */}
        <div>
          <div className="mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
              By Language
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["javascript", "python", "ruby"] as Language[]).map((lang) => (
              <div
                key={lang}
                className="bg-bg border border-border rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${LANG_DOT[lang]}`} />
                  <span className="text-xs text-text-secondary">{LANG_LABELS[lang]}</span>
                </div>
                <div className="text-xl font-bold text-text-primary tabular-nums">
                  {langCounts[lang]}
                </div>
                <div className="text-xs text-text-secondary">solved</div>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="bg-bg border border-border rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-text-primary">Next puzzle</div>
            <div className="text-xs text-text-secondary mt-0.5">resets at 00:00 UTC</div>
          </div>
          <div className="text-2xl font-mono font-bold text-accent tabular-nums">
            {countdown}
          </div>
        </div>
      </div>
    </Modal>
  );
}
