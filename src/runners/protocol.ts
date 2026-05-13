import type { TestResult } from "../types";

export interface RunRequest {
  type: "RUN";
  requestId: string;
  userCode: string;
  problemId: string;
}

export type WorkerMessage =
  | { type: "READY" }
  | { type: "LOADING"; progress: number }
  | { type: "OUTPUT"; requestId: string; line: string }
  | { type: "RESULT"; requestId: string; results: TestResult[] }
  | { type: "ERROR"; requestId: string; error: string };
