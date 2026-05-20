import type { RunRequest, WorkerMessage } from "./protocol";
import type { TestCaseInternal, TestResult } from "../types";
import { fetchTestCases } from "../api/client";

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj).sort();
  const bKeys = Object.keys(bObj).sort();
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => bKeys.includes(k) && deepEqual(aObj[k], bObj[k]));
}

function fmt(v: unknown): string {
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}

self.onmessage = async (e: MessageEvent<RunRequest>) => {
  const { type, requestId, userCode, problemId } = e.data;
  if (type !== "RUN") return;

  const post = (msg: WorkerMessage) => self.postMessage(msg);

  // Fetch internal test cases
  let testCases: TestCaseInternal[];
  try {
    const body = await fetchTestCases(problemId);
    testCases = body.testCasesInternal;
  } catch (err) {
    post({
      type: "ERROR",
      requestId,
      error: `Could not load test cases: ${err instanceof Error ? err.message : String(err)}`,
    });
    return;
  }

  // Capture is set during script execution to collect top-level console calls,
  // then cleared before test cases run (test invocations are silent).
  let currentCapture: ((...args: unknown[]) => void) | null = null;

  const consoleProxy = {
    log: (...args: unknown[]) => currentCapture?.(...args),
    error: (...args: unknown[]) => currentCapture?.(...args),
    warn: (...args: unknown[]) => currentCapture?.(...args),
    info: (...args: unknown[]) => currentCapture?.(...args),
  };

  // Capture any console calls that happen at the top level of the user's script
  // (outside solve) — this is the single "script run" output shown in the panel.
  currentCapture = (...args: unknown[]) => {
    post({ type: "OUTPUT", requestId, line: args.map(fmt).join(" ") });
  };

  let solveFn: (...args: unknown[]) => unknown;
  try {
    solveFn = new Function("console", `"use strict";\n${userCode}\nreturn solve;`)(
      consoleProxy,
    ) as (...args: unknown[]) => unknown;
  } catch (err) {
    currentCapture = null;
    post({
      type: "ERROR",
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  // Stop capturing — test-case invocations of solve run silently.
  currentCapture = null;

  const results: TestResult[] = [];

  for (const tc of testCases) {
    const start = performance.now();
    let passed = false;
    let errorMsg: string | undefined;

    try {
      const actual = solveFn(...tc.args);
      passed = deepEqual(actual, tc.expected);
      if (!passed) {
        errorMsg = `Expected ${fmt(tc.expected)}, got ${fmt(actual)}`;
      }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
    }

    const runtimeMs = performance.now() - start;
    results.push({ id: tc.id, name: tc.name, passed, error: errorMsg, runtimeMs });
  }

  post({ type: "RESULT", requestId, results });
};

self.postMessage({ type: "READY" } as WorkerMessage);
