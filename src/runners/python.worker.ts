import { loadPyodide } from "pyodide";
import type { RunRequest, WorkerMessage } from "./protocol";
import type { TestCaseInternal, TestResult } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null;
let initPromise: Promise<any> | null = null;

const post = (msg: WorkerMessage) => self.postMessage(msg);

async function ensurePyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;

  if (!initPromise) {
    post({ type: "LOADING", progress: 0 });
    initPromise = (async () => {
      // loadPyodide auto-detects its indexURL from import.meta.url,
      // which Vite resolves to node_modules/pyodide/ (no CDN needed)
      post({ type: "LOADING", progress: 20 });
      const py = await loadPyodide();
      post({ type: "LOADING", progress: 100 });
      return py;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }

  pyodideInstance = await initPromise;
  return pyodideInstance;
}

function fmtPyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/^PythonError:\s*/, "");
}

self.onmessage = async (e: MessageEvent<RunRequest>) => {
  const { type, requestId, userCode, problemId } = e.data;
  if (type !== "RUN") return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let py: any;
  try {
    py = await ensurePyodide();
  } catch (err) {
    post({ type: "ERROR", requestId, error: `Failed to load Python runtime: ${fmtPyError(err)}` });
    return;
  }

  // Fetch internal test cases
  let testCases: TestCaseInternal[];
  try {
    const res = await fetch(`/api/internal/testcases/${problemId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { testCasesInternal: TestCaseInternal[] };
    testCases = body.testCasesInternal;
  } catch (err) {
    post({
      type: "ERROR",
      requestId,
      error: `Could not load test cases: ${err instanceof Error ? err.message : String(err)}`,
    });
    return;
  }

  // Capture stdout during user code execution (top-level prints)
  py.setStdout({
    batched: (text: string) => {
      post({ type: "OUTPUT", requestId, line: text });
    },
  });

  // Run user code to define `solve`
  try {
    await py.runPythonAsync(userCode);
  } catch (err) {
    py.setStdout({ batched: () => {} });
    post({ type: "ERROR", requestId, error: fmtPyError(err) });
    return;
  }

  // Silence stdout for test case runs (same behaviour as JS worker)
  py.setStdout({ batched: () => {} });

  // Run all test cases in a single Python script to avoid JS↔Python type conversion overhead.
  // All args/expected are JSON-serializable (enforced by the problem generator).
  const testCasesJson = JSON.stringify(
    testCases.map((tc) => ({ id: tc.id, name: tc.name, args: tc.args, expected: tc.expected })),
  );

  const runnerScript = `
def _devdle_run():
    import json as _j, traceback as _tb, time as _t
    _cases = _j.loads(${JSON.stringify(testCasesJson)})
    _res = []
    for _c in _cases:
        _t0 = _t.monotonic()
        try:
            _got = solve(*_c['args'])
            _ms = (_t.monotonic() - _t0) * 1000
            _ok = _got == _c['expected']
            _msg = None if _ok else f"Expected {_c['expected']!r}, got {_got!r}"
        except Exception:
            _ms = (_t.monotonic() - _t0) * 1000
            _ok, _msg = False, _tb.format_exc().strip()
        _res.append({'id': _c['id'], 'name': _c['name'], 'passed': _ok, 'error': _msg, 'runtimeMs': _ms})
    return _j.dumps(_res)
_devdle_run()
`;

  try {
    const raw = (await py.runPythonAsync(runnerScript)) as string;
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      name: string;
      passed: boolean;
      error: string | null;
      runtimeMs: number;
    }>;

    const results: TestResult[] = parsed.map((r) => ({
      id: r.id,
      name: r.name,
      passed: r.passed,
      error: r.error ?? undefined,
      runtimeMs: r.runtimeMs,
    }));

    post({ type: "RESULT", requestId, results });
  } catch (err) {
    post({ type: "ERROR", requestId, error: fmtPyError(err) });
  }
};

post({ type: "READY" });
