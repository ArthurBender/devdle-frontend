import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { DateNav } from "../components/home/DateNav";
import { StatsHero } from "../components/home/StatsHero";
import { ProblemGrid } from "../components/home/ProblemGrid";
import { TutorialModal } from "../components/modals/TutorialModal";
import { StatsModal } from "../components/modals/StatsModal";
import { SettingsModal } from "../components/modals/SettingsModal";
import { useProblems } from "../hooks/useProblems";
import { useLocalStats } from "../hooks/useLocalStats";
import { usePrefs } from "../hooks/usePrefs";

function NextPuzzleCountdown() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const next = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
      );
      const ms = next.getTime() - now.getTime();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      setLabel(`${h}h ${m}m`);
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return <span>{label}</span>;
}

export default function HomePage() {
  const { date } = useParams<{ date: string }>();
  const safeDate = date ?? new Date().toISOString().slice(0, 10);

  const problemsState = useProblems(safeDate);
  const stats = useLocalStats();
  const [prefs, updatePrefs] = usePrefs();

  const [showTutorial, setShowTutorial] = useState(() => !prefs.seenTutorial);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function closeTutorial() {
    updatePrefs({ seenTutorial: true });
    setShowTutorial(false);
  }

  return (
    <Layout>
      <Header
        date={safeDate}
        centerContent={<DateNav date={safeDate} />}
        onTutorialClick={() => setShowTutorial(true)}
        onStatsClick={() => setShowStats(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="text-center">
          <span className="text-text-primary font-bold text-xl">Prove your programmer skills</span>
          <span className="text-text-secondary text-xl"> — one puzzle at a time.</span>
        </div>

        <StatsHero totalProblems={6} />

        {problemsState.status === "loading" && (
          <div className="text-text-secondary text-sm text-center py-12">
            Loading today's problems…
          </div>
        )}
        {problemsState.status === "generating" && (
          <div className="text-text-secondary text-sm text-center py-12">
            Problems are being generated — check back in a moment…
          </div>
        )}
        {problemsState.status === "not-found" && (
          <div className="text-text-secondary text-sm text-center py-12">
            No challenge for this day.
          </div>
        )}
        {problemsState.status === "error" && (
          <div className="text-error text-sm text-center py-12">
            Failed to load problems: {problemsState.message}
          </div>
        )}
        {problemsState.status === "ok" && (
          <ProblemGrid
            date={safeDate}
            problemSet={problemsState.data}
            stats={stats}
          />
        )}
      </main>

      <footer className="border-t border-border px-6 py-3 flex items-center justify-between shrink-0">
        <span className="text-xs text-text-secondary">
          © 2026 Devdle · daily puzzles for devs
        </span>
        <span className="text-xs text-text-secondary">
          Next puzzle in <span className="font-bold text-text-primary"><NextPuzzleCountdown /></span>
        </span>
      </footer>

      {showTutorial && <TutorialModal onClose={closeTutorial} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </Layout>
  );
}
