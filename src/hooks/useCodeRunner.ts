import { useState, useCallback, useRef } from "react";
import { runCode } from "../runners/runnerFactory";
import { recordAttempt } from "../store/localStorage";
import type { Language, TestResult } from "../types";

interface RunnerState {
  results: TestResult[];
  outputLines: string[];
  runCount: number;
  isRunning: boolean;
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
    isRunning: false,
  });

  const isRunningRef = useRef(false);
  const runCountRef = useRef(0);

  const reset = useCallback(() => {
    setState({ results: [], outputLines: [], runCount: 0, isRunning: false });
    runCountRef.current = 0;
    isRunningRef.current = false;
  }, []);

  const run = useCallback(
    async (userCode: string) => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      runCountRef.current++;
      const thisRun = runCountRef.current;

      setState((s) => ({ ...s, isRunning: true, outputLines: [], results: [] }));

      const liveLines: string[] = [];

      try {
        const { results } = await runCode(lang, userCode, problemId, (line) => {
          liveLines.push(line);
          setState((s) => ({ ...s, outputLines: [...liveLines] }));
        });

        isRunningRef.current = false;
        setState({ results, outputLines: liveLines, runCount: thisRun, isRunning: false });

        const allPassed = results.length === testCasesLength && results.every((r) => r.passed);
        recordAttempt(problemDate, problemId, allPassed, thisRun);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const errorLine = `Error: ${errMsg}`;
        isRunningRef.current = false;
        setState({
          results: [],
          outputLines: [...liveLines, errorLine],
          runCount: thisRun,
          isRunning: false,
        });
      }
    },
    [lang, problemId, problemDate, testCasesLength],
  );

  return { ...state, run, reset };
}
