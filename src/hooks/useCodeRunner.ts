import { useState, useCallback, useRef } from "react";
import { runCode } from "../runners/runnerFactory";
import { recordAttempt } from "../store/localStorage";
import type { Language, TestResult } from "../types";

interface RunnerState {
  results: TestResult[];
  outputLines: string[];
  runCount: number;
  solvedAtRun: number | null;
  isRunning: boolean;
  loadingProgress: number | null; // null = not loading WASM; 0–100 = loading in progress
}

export function useCodeRunner(
  lang: Language,
  problemId: string,
  problemDate: string,
  testCasesLength: number,
) {
  const [state, setState] = useState<RunnerState>({
    results: [],
    outputLines: [],
    runCount: 0,
    solvedAtRun: null,
    isRunning: false,
    loadingProgress: null,
  });

  const isRunningRef = useRef(false);
  const runCountRef = useRef(0);

  const reset = useCallback(() => {
    setState({ results: [], outputLines: [], runCount: 0, solvedAtRun: null, isRunning: false, loadingProgress: null });
    runCountRef.current = 0;
    isRunningRef.current = false;
  }, []);

  const run = useCallback(
    async (userCode: string) => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      runCountRef.current++;
      const thisRun = runCountRef.current;

      setState((s) => ({ ...s, isRunning: true, outputLines: [], results: [], loadingProgress: null }));

      const liveLines: string[] = [];

      try {
        const { results } = await runCode(
          lang,
          userCode,
          problemId,
          (line) => {
            liveLines.push(line);
            setState((s) => ({ ...s, outputLines: [...liveLines] }));
          },
          (progress) => {
            // Once we hit 100, clear the bar — runtime is cached for subsequent runs
            setState((s) => ({ ...s, loadingProgress: progress >= 100 ? null : progress }));
          },
        );

        const allPassed = results.length === testCasesLength && results.every((r) => r.passed);
        recordAttempt(problemDate, problemId, allPassed, thisRun);

        isRunningRef.current = false;
        setState((prev) => ({
          results,
          outputLines: liveLines,
          runCount: thisRun,
          solvedAtRun: prev.solvedAtRun ?? (allPassed ? thisRun : null),
          isRunning: false,
          loadingProgress: null,
        }));
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const errorLine = `Error: ${errMsg}`;
        isRunningRef.current = false;
        setState((prev) => ({
          results: [],
          outputLines: [...liveLines, errorLine],
          runCount: thisRun,
          solvedAtRun: prev.solvedAtRun,
          isRunning: false,
          loadingProgress: null,
        }));
      }
    },
    [lang, problemId, problemDate, testCasesLength],
  );

  return { ...state, run, reset };
}
