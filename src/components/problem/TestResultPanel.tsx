import { FiChevronRight, FiCheck, FiX, FiCheckCircle } from "react-icons/fi";
import { OutputPanel } from "./OutputPanel";
import type { TestCasePublic, TestResult } from "../../types";

interface TestResultPanelProps {
  testCases: TestCasePublic[];
  results: TestResult[];
  runCount: number;
  solvedAtRun: number | null;
  outputLines: string[];
  isOpen: boolean;
  expertMode: boolean;
  loadingProgress: number | null;
  onClose: () => void;
  onOpen: () => void;
}

export function TestResultPanel({
  testCases,
  results,
  runCount,
  solvedAtRun,
  outputLines,
  isOpen,
  expertMode,
  loadingProgress,
  onClose,
  onOpen,
}: TestResultPanelProps) {
  const solvedRunCount = solvedAtRun ?? runCount;
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;
  const pendingCount = testCases.length - results.length;
  const allPassed = results.length > 0 && results.length === testCases.length && passCount === testCases.length;
  const totalMs = results.reduce((sum, r) => sum + r.runtimeMs, 0);

  if (!isOpen) {
    const summary =
      results.length > 0 ? `${passCount}/${testCases.length}` : testCases.length.toString();
    return (
      <div
        className="w-8 bg-surface border-l border-border flex flex-col items-center py-4 cursor-pointer hover:bg-border/30 transition-colors shrink-0"
        onClick={onOpen}
        title="Open tests panel"
      >
        <span
          className="text-text-secondary text-xs font-medium tracking-widest uppercase mb-2"
          style={{ writingMode: "vertical-rl" }}
        >
          Tests
        </span>
        <span
          className="text-text-secondary text-xs font-mono mt-auto"
          style={{ writingMode: "vertical-rl" }}
        >
          {summary}
        </span>
      </div>
    );
  }

  return (
    <div className="w-64 bg-surface border-l border-border flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Tests{results.length > 0 ? ` ${passCount} / ${testCases.length}` : ""}
        </span>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close tests panel"
        >
          <FiChevronRight size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingProgress !== null && (
          <div className="px-3 py-2.5 border-b border-border">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
              <span>Loading runtime…</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}
        {allPassed ? (
          <div className="px-3 py-4 flex flex-col items-center gap-2 text-center">
            <FiCheckCircle size={24} className="text-success" />
            <div className="text-success text-sm font-medium">All tests passed</div>
            <div className="text-text-secondary text-xs">solved in {solvedRunCount} {solvedRunCount === 1 ? "run" : "runs"}</div>
          </div>
        ) : (
          <>
            {runCount > 0 && results.length > 0 && (
              <div className="px-3 py-2 border-b border-border shrink-0">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-text-secondary font-medium">Run #{runCount}</span>
                  <span className="text-text-secondary">{totalMs.toFixed(1)} ms</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {passCount > 0 && (
                    <span className="flex items-center gap-1 text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                      {passCount} pass
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1 text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full border border-text-secondary inline-block" />
                      {pendingCount} pending
                    </span>
                  )}
                  {failCount > 0 && (
                    <span className="flex items-center gap-1 text-error">
                      <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" />
                      {failCount} fail
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="py-1">
              {expertMode && results.length > 0 ? (
                <div className="px-3 py-2 text-sm text-text-primary font-medium">
                  {passCount} / {testCases.length} passed
                </div>
              ) : (
                testCases.map((tc) => {
                  const result = results.find((r) => r.id === tc.id);
                  const isPassed = result?.passed;
                  const isPending = !result;
                  return (
                    <div key={tc.id}>
                      <div
                        className={`flex items-center justify-between text-xs py-1.5 px-3 gap-2 ${
                          isPending
                            ? "text-text-secondary"
                            : isPassed
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isPending ? (
                            <span className="w-3 h-3 rounded-full border border-current opacity-40 shrink-0" />
                          ) : isPassed ? (
                            <FiCheck size={12} className="shrink-0" />
                          ) : (
                            <FiX size={12} className="shrink-0" />
                          )}
                          <span className="truncate">{tc.name}</span>
                        </div>
                        {result && (
                          <span className="text-text-secondary shrink-0 tabular-nums">
                            {result.runtimeMs.toFixed(1)} ms
                          </span>
                        )}
                        {isPending && (
                          <span className="text-text-secondary shrink-0">—</span>
                        )}
                      </div>
                      {result && !result.passed && result.error && (
                        <div className="px-3 pb-1.5 pl-8 text-xs text-error/80 font-mono leading-relaxed">
                          {result.error}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <OutputPanel lines={outputLines} />
    </div>
  );
}
