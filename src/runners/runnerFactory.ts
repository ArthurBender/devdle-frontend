import type { Language, TestResult } from "../types";
import type { RunRequest, WorkerMessage } from "./protocol";

const workers = new Map<Language, Worker>();

function getWorker(lang: Language): Worker {
  const existing = workers.get(lang);
  if (existing) return existing;

  let worker: Worker;
  if (lang === "javascript") {
    worker = new Worker(new URL("./js.worker.ts", import.meta.url), { type: "module" });
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

    const timer = setTimeout(() => {
      worker.removeEventListener("message", handler);
      worker.terminate();
      workers.delete(lang);
      reject(new Error("Execution timed out (10s)"));
    }, TIMEOUT_MS);

    function handler(e: MessageEvent<WorkerMessage>) {
      const msg = e.data;
      // Ignore READY / LOADING / messages for other requests
      if (!("requestId" in msg) || msg.requestId !== requestId) return;

      if (msg.type === "OUTPUT") {
        onOutput(msg.line);
        return;
      }

      clearTimeout(timer);
      worker.removeEventListener("message", handler);

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
