import { useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlay, FiRefreshCw } from "react-icons/fi";
import { Layout } from "../components/layout/Layout";
import { Header } from "../components/layout/Header";
import { TutorialModal } from "../components/modals/TutorialModal";
import { ProblemPanel } from "../components/problem/ProblemPanel";
import { CodeEditor } from "../components/problem/CodeEditor";
import { TestResultPanel } from "../components/problem/TestResultPanel";
import { Button } from "../components/ui/Button";
import { useProblems } from "../hooks/useProblems";
import { usePrefs } from "../hooks/usePrefs";
import type { Language, Difficulty, TestResult } from "../types";

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
  const [results, setResults] = useState<TestResult[]>([]);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [runCount, setRunCount] = useState(0);
  const [problemOpen, setProblemOpen] = useState(true);
  const [testsOpen, setTestsOpen] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Reset code when problem loads
  const [lastProblemId, setLastProblemId] = useState<string | null>(null);
  if (problem && problem.id !== lastProblemId) {
    setLastProblemId(problem.id);
    setCode(problem.starterCode);
    setResults([]);
    setOutputLines([]);
    setRunCount(0);
  }

  const handleRun = useCallback(() => {
    // Phase 4: wire to useCodeRunner
    setRunCount((n) => n + 1);
  }, []);

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
              results={results}
              runCount={runCount}
              outputLines={outputLines}
              isOpen={testsOpen}
              expertMode={prefs.expertMode}
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
            {runCount > 0 ? ` · attempt ${runCount}` : " · first attempt"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setCode(problem.starterCode);
                setResults([]);
                setOutputLines([]);
                setRunCount(0);
              }}
            >
              <FiRefreshCw size={13} />
              Reset
            </Button>
            <Button variant="primary" size="md" onClick={handleRun}>
              <FiPlay size={13} />
              Run
              <kbd className="opacity-60 text-sm font-mono ml-0.5">⌘↵</kbd>
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
    </Layout>
  );
}
