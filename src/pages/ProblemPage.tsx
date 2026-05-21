import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams, useBlocker } from "react-router-dom";
import { FiArrowLeft, FiPlay, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { TutorialModal } from "../components/modals/TutorialModal";
import { StatsModal } from "../components/modals/StatsModal";
import { SettingsModal } from "../components/modals/SettingsModal";
import { Modal } from "../components/ui/Modal";
import { ProblemPanel } from "../components/problem/ProblemPanel";
import { CodeEditor } from "../components/problem/CodeEditor";
import { TestResultPanel } from "../components/problem/TestResultPanel";
import { Button } from "../components/ui/Button";
import { useProblems } from "../hooks/useProblems";
import { usePrefs } from "../hooks/usePrefs";
import { useCodeRunner } from "../hooks/useCodeRunner";
import type { Language, Difficulty } from "../types";

const LANG_ABBR: Record<Language, string> = {
  javascript: ".js",
  python: ".py",
  ruby: ".rb",
};

const LANG_COLOR: Record<Language, string> = {
  javascript: "text-lang-js",
  python: "text-lang-py",
  ruby: "text-lang-rb",
};

export default function ProblemPage() {
  const { date, lang, difficulty } = useParams<{
    date: string;
    lang: string;
    difficulty: string;
  }>();

  const safeDate = date ?? new Date().toISOString().slice(0, 10);
  const safeLang = (lang ?? "javascript") as Language;
  const safeDiff = (difficulty ?? "beginner") as Difficulty;

  const problemsState = useProblems(safeDate);
  const [prefs, updatePrefs] = usePrefs();

  const problem =
    problemsState.status === "ok"
      ? problemsState.data.problems.find(
          (p) => p.language === safeLang && p.difficulty === safeDiff
        ) ?? null
      : null;

  const [code, setCode] = useState<string>("");
  const [prevProblemId, setPrevProblemId] = useState<string | undefined>(problem?.id);
  if (problem?.id !== prevProblemId) {
    setPrevProblemId(problem?.id);
    if (problem) setCode(problem.starterCode);
  }

  const navigate = useNavigate();

  const [problemOpen, setProblemOpen] = useState(true);
  const [testsOpen, setTestsOpen] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [statsMode, setStatsMode] = useState<null | "nav" | "resolved">(null);
  const [showSettings, setShowSettings] = useState(false);

  const runner = useCodeRunner(
    safeLang,
    problem?.id ?? "",
    safeDate,
    problem?.testCases.length ?? 0,
  );

  const [prevSolvedAtRun, setPrevSolvedAtRun] = useState(runner.solvedAtRun);
  if (runner.solvedAtRun !== prevSolvedAtRun) {
    setPrevSolvedAtRun(runner.solvedAtRun);
    if (runner.solvedAtRun !== null) setStatsMode("resolved");
  }

  // Reset runner when problem changes
  useEffect(() => {
    if (problem) runner.reset();
    // runner.reset is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);


  const handleRun = useCallback(() => {
    if (problem) runner.run(code);
  }, [problem, runner, code]);

  // Cmd+Enter / Ctrl+Enter keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRun]);

  // Warn before leaving with unsaved work
  const hasUnsavedCode =
    problem !== null && code !== problem.starterCode && runner.solvedAtRun === null;

  // Browser-level: tab close, address-bar navigation, browser back
  useEffect(() => {
    if (!hasUnsavedCode) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedCode]);

  // In-app navigation via React Router
  const blocker = useBlocker(hasUnsavedCode);

  const centerContent = (
    <div className="flex items-center gap-2">
      <Link
        to={`/${safeDate}`}
        className="text-text-secondary hover:text-text-primary transition-colors p-1"
        aria-label="Back to home"
      >
        <FiArrowLeft size={15} />
      </Link>
      {problem && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`font-mono font-semibold ${LANG_COLOR[safeLang]}`}>
            {LANG_ABBR[safeLang]}
          </span>
          <span className="text-text-secondary uppercase tracking-wide">
            {safeDiff}
          </span>
          <span className="text-text-secondary">·</span>
          <span className="text-text-primary truncate max-w-48">{problem.title}</span>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <Header
        date={safeDate}
        centerContent={centerContent}
        onTutorialClick={() => setShowTutorial(true)}
        onStatsClick={() => setStatsMode("nav")}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {problemsState.status === "loading" && (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
            Loading…
          </div>
        )}
        {problemsState.status === "not-found" && (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
            No challenge for this day.{" "}
            <Link to={`/${safeDate}`} className="text-accent ml-1 hover:underline">
              Go back
            </Link>
          </div>
        )}
        {problemsState.status === "error" && (
          <div className="flex-1 flex items-center justify-center text-error text-sm">
            {problemsState.message}
          </div>
        )}
        {problemsState.status === "ok" && problem && (
          <>
            <ProblemPanel
              problem={problem}
              language={safeLang}
              difficulty={safeDiff}
              isOpen={problemOpen}
              onClose={() => setProblemOpen(false)}
              onOpen={() => setProblemOpen(true)}
            />
            <CodeEditor
              language={safeLang}
              filename={`solve${LANG_ABBR[safeLang]}`}
              value={code}
              onChange={setCode}
              fontSize={prefs.editorFontSize}
            />
            <TestResultPanel
              testCases={problem.testCases}
              results={runner.results}
              runCount={runner.runCount}
              solvedAtRun={runner.solvedAtRun}
              outputLines={runner.outputLines}
              isOpen={testsOpen}
              expertMode={prefs.expertMode}
              loadingProgress={runner.loadingProgress}
              onClose={() => setTestsOpen(false)}
              onOpen={() => setTestsOpen(true)}
            />
          </>
        )}
        {problemsState.status === "ok" && !problem && (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
            Problem not found.{" "}
            <Link to={`/${safeDate}`} className="text-accent ml-1 hover:underline">
              Go back
            </Link>
          </div>
        )}
      </div>

      {problemsState.status === "ok" && problem && (
        <div className="border-t border-border px-4 py-2 flex items-center justify-between bg-surface shrink-0">
          <span className="text-xs text-text-secondary">
            Run
            {runner.runCount > 0 ? ` · attempt ${runner.runCount}` : " · first attempt"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setCode(problem.starterCode);
                runner.reset();
              }}
            >
              <FiRefreshCw size={13} />
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleRun}
              disabled={runner.isRunning}
            >
              <FiPlay size={13} />
              {runner.isRunning ? "Running…" : "Run"}
              {!runner.isRunning && (
                <kbd className="opacity-60 text-sm font-mono ml-0.5">⌘↵</kbd>
              )}
            </Button>
          </div>
        </div>
      )}

      {showTutorial && (
        <TutorialModal
          onClose={() => {
            updatePrefs({ seenTutorial: true });
            setShowTutorial(false);
          }}
        />
      )}
      {statsMode !== null && (
        <StatsModal
          onClose={() => setStatsMode(null)}
          onGoHome={statsMode === "resolved" ? () => navigate(`/${safeDate}`) : undefined}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {blocker.state === "blocked" && (
        <Modal
          title="Leave without saving?"
          subtitle="Your code changes will be lost."
          icon={<FiAlertTriangle size={14} />}
          onClose={() => blocker.reset()}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => blocker.reset()}>
                Stay
              </Button>
              <Button variant="primary" size="md" onClick={() => blocker.proceed()}>
                Leave
              </Button>
            </div>
          }
        >
          <p className="text-text-secondary text-sm">
            You haven't finished this problem. If you leave now, your progress won't be saved.
          </p>
        </Modal>
      )}
    </Layout>
  );
}
