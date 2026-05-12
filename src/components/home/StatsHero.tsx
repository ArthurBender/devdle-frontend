import { useState } from "react";
import { FiZap, FiCalendar, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useLocalStats } from "../../hooks/useLocalStats";
import { CalendarHeatmap } from "./CalendarHeatmap";

interface StatsHeroProps {
  date: string;
  totalProblems: number;
}

export function StatsHero({ date, totalProblems }: StatsHeroProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const stats = useLocalStats();

  const todaySolved = stats.history.filter((a) => a.date === date && a.solved).length;

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <FiZap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-widest leading-none mb-1.5">
              Current Streak
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-text-primary leading-none">
                {stats.currentStreak}
              </span>
              <span className="text-sm text-text-secondary">days</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className="text-text-secondary hover:text-text-primary text-xs flex items-center gap-1.5 transition-colors border border-border rounded-md px-2.5 py-1.5"
        >
          <FiCalendar size={11} />
          {showCalendar ? "Hide calendar" : "Show calendar"}
          {showCalendar ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
        </button>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        <div className="pr-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary leading-tight">
            {todaySolved}/{totalProblems}
          </span>
          <span className="text-xs text-text-secondary uppercase tracking-wide">Today</span>
        </div>
        <div className="px-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary leading-tight">{stats.maxStreak}</span>
          <span className="text-xs text-text-secondary uppercase tracking-wide">Best Streak</span>
        </div>
        <div className="pl-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary leading-tight">{stats.totalSolved}</span>
          <span className="text-xs text-text-secondary uppercase tracking-wide">Solved</span>
        </div>
      </div>

      {showCalendar && (
        <div className="mt-4 pt-4 border-t border-border">
          <CalendarHeatmap />
        </div>
      )}
    </div>
  );
}
