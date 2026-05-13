import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";
import rubyWasmUrl from "@ruby/3.4-wasm-wasi/dist/ruby+stdlib.wasm?url";
import type { RunRequest, WorkerMessage } from "./protocol";
import type { TestCaseInternal, TestResult } from "../types";

type RubyVM = Awaited<ReturnType<typeof DefaultRubyVM>>["vm"];

let vmInstance: RubyVM | null = null;
let initPromise: Promise<RubyVM> | null = null;

const post = (msg: WorkerMessage) => self.postMessage(msg);

async function ensureRubyVM(): Promise<RubyVM> {
  if (vmInstance) return vmInstance;

  if (!initPromise) {
    post({ type: "LOADING", progress: 0 });
    initPromise = (async () => {
      // Fetch the WASM file with streaming progress so we can report download %
      const response = await fetch(rubyWasmUrl);
      const contentLength = parseInt(response.headers.get("content-length") ?? "0", 10);
      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength > 0) {
          // Map download progress to 5–75% of the overall loading bar
          const pct = Math.round(5 + (received / contentLength) * 70);
          post({ type: "LOADING", progress: pct });
        }
      }

      // Concatenate chunks into a single buffer
      const wasmBytes = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) {
        wasmBytes.set(chunk, offset);
        offset += chunk.length;
      }

      post({ type: "LOADING", progress: 80 });
      const module = await WebAssembly.compile(wasmBytes);

      post({ type: "LOADING", progress: 90 });
      // consolePrint: false — we capture $stdout ourselves via StringIO in Ruby
      const { vm } = await DefaultRubyVM(module, { consolePrint: false });

      post({ type: "LOADING", progress: 100 });
      return vm;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }

  vmInstance = await initPromise;
  return vmInstance;
}

// Static runner script — request-specific data is passed via JS globals to avoid
// string-escaping issues with arbitrary user code and test case values.
const RUNNER_SCRIPT = `
require 'json'
require 'stringio'

_user_code   = JS.global[:__rubyUserCode].to_s
_tcs_json    = JS.global[:__rubyTestCasesJson].to_s

# Redirect stdout so we capture the user's top-level puts/print calls
_capture = StringIO.new
$stdout   = _capture

_user_error = nil
begin
  eval(_user_code)
rescue SyntaxError => _e
  _user_error = "SyntaxError: #{_e.message}"
rescue => _e
  _user_error = "#{_e.class}: #{_e.message}"
end

_output_lines = _capture.string.split("\\n").reject(&:empty?)
# Restore stdout — test-case invocations run silently (mirrors JS/Python workers)
$stdout = STDOUT

if _user_error
  { error: _user_error, output: _output_lines }.to_json
else
  _tcs     = JSON.parse(_tcs_json)
  _results = []

  _tcs.each do |tc|
    t0 = Time.now
    begin
      got     = solve(*tc['args'])
      elapsed = (Time.now - t0) * 1000
      ok      = got == tc['expected']
      err     = ok ? nil : "Expected #{tc['expected'].inspect}, got #{got.inspect}"
    rescue => e
      elapsed = (Time.now - t0) * 1000
      ok      = false
      err     = "#{e.class}: #{e.message}"
    end

    _results << { id: tc['id'], name: tc['name'], passed: ok, error: err, runtimeMs: elapsed }
  end

  { results: _results, output: _output_lines }.to_json
end
`;

self.onmessage = async (e: MessageEvent<RunRequest>) => {
  const { type, requestId, userCode, problemId } = e.data;
  if (type !== "RUN") return;

  let vm: RubyVM;
  try {
    vm = await ensureRubyVM();
  } catch (err) {
    post({
      type: "ERROR",
      requestId,
      error: `Failed to load Ruby runtime: ${err instanceof Error ? err.message : String(err)}`,
    });
    return;
  }

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

  // Pass data to Ruby via JS globals — avoids string-escaping user code into a Ruby literal
  Object.assign(self, {
    __rubyUserCode: userCode,
    __rubyTestCasesJson: JSON.stringify(
      testCases.map((tc) => ({ id: tc.id, name: tc.name, args: tc.args, expected: tc.expected })),
    ),
  });

  try {
    const rbResult = await vm.evalAsync(RUNNER_SCRIPT);
    const raw = rbResult.toJS() as string;

    const parsed = JSON.parse(raw) as
      | { error: string; output: string[] }
      | { results: Array<{ id: string; name: string; passed: boolean; error: string | null; runtimeMs: number }>; output: string[] };

    // Always emit captured stdout lines first
    for (const line of parsed.output ?? []) {
      post({ type: "OUTPUT", requestId, line });
    }

    if ("error" in parsed) {
      post({ type: "ERROR", requestId, error: parsed.error });
      return;
    }

    const results: TestResult[] = parsed.results.map((r) => ({
      id: r.id,
      name: r.name,
      passed: r.passed,
      error: r.error ?? undefined,
      runtimeMs: r.runtimeMs,
    }));

    post({ type: "RESULT", requestId, results });
  } catch (err) {
    post({
      type: "ERROR",
      requestId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

post({ type: "READY" });
