import type { Language, TestResult } from "../types";
import type { RunRequest, WorkerMessage } from "./protocol";

const workers = new Map<Language, Worker>();
const inactivityTimers = new Map<Language, ReturnType<typeof setTimeout>>();

const INACTIVITY_TIMEOUT_MS = 30_000;
// These runtimes are heavy; terminate after inactivity to reclaim WASM memory
const HEAVY_LANGS: Language[] = ["python", "ruby"];

function scheduleInactivity(lang: Language) {
  const existing = inactivityTimers.get(lang);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    workers.get(lang)?.terminate();
    workers.delete(lang);
    inactivityTimers.delete(lang);
  }, INACTIVITY_TIMEOUT_MS);

  inactivityTimers.set(lang, timer);
}

function getWorker(lang: Language): Worker {
  const existing = workers.get(lang);
  if (existing) return existing;

  let worker: Worker;
  if (lang === "javascript") {
    worker = new Worker(new URL("./js.worker.ts", import.meta.url), { type: "module" });
  } else if (lang === "python") {
    worker = new Worker(new URL("./python.worker.ts", import.meta.url), { type: "module" });
  } else if (lang === "ruby") {
    worker = new Worker(new URL("./ruby.worker.ts", import.meta.url), { type: "module" });
  } else {
    throw new Error(`Runner for ${lang} is not yet available`);
  }

  workers.set(lang, worker);
  return worker;
}

export interface RunResult {
  results: TestResult[];
}

const TIMEOUT_MS = 10_000;

export function runCode(
  lang: Language,
  userCode: string,
  problemId: string,
  onOutput: (line: string) => void,
  onProgress?: (progress: number) => void,
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = getWorker(lang);
    } catch (err) {
      reject(err);
      return;
    }

    const requestId = crypto.randomUUID();

    // Cancel any pending inactivity termination — a new run is starting
    const existingTimer = inactivityTimers.get(lang);
    if (existingTimer) clearTimeout(existingTimer);
    inactivityTimers.delete(lang);

    // Python/Ruby can take longer to initialise their WASM runtimes
    const timeoutMs = HEAVY_LANGS.includes(lang) ? 120_000 : TIMEOUT_MS;

    const timer = setTimeout(() => {
      worker.removeEventListener("message", handler);
      worker.terminate();
      workers.delete(lang);
      reject(new Error("Execution timed out"));
    }, timeoutMs);

    function handler(e: MessageEvent<WorkerMessage>) {
      const msg = e.data;

      // LOADING has no requestId — it's a worker-level progress event
      if (msg.type === "LOADING") {
        onProgress?.(msg.progress);
        return;
      }

      // Ignore READY and messages for other in-flight requests
      if (!("requestId" in msg) || msg.requestId !== requestId) return;

      if (msg.type === "OUTPUT") {
        onOutput(msg.line);
        return;
      }

      clearTimeout(timer);
      worker.removeEventListener("message", handler);

      if (HEAVY_LANGS.includes(lang)) {
        scheduleInactivity(lang);
      }

      if (msg.type === "RESULT") {
        resolve({ results: msg.results });
      } else if (msg.type === "ERROR") {
        reject(new Error(msg.error));
      }
    }

    worker.addEventListener("message", handler);
    const req: RunRequest = { type: "RUN", requestId, userCode, problemId };
    worker.postMessage(req);
  });
}
