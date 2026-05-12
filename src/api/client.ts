import type { DailyProblemSet, TestCaseInternal } from "../types";

// In dev, Vite proxies /api → localhost:3001 (no base URL needed).
// In prod split-origin deployments, set VITE_API_BASE_URL to the backend origin.
// Leave unset when frontend and backend are served from the same origin.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(text), { status: res.status });
  }
  return res.json() as Promise<T>;
}

export function fetchProblems(date: string): Promise<DailyProblemSet> {
  return apiFetch(`/api/problems/${date}`);
}

export function fetchTestCases(
  problemId: string
): Promise<{ testCasesInternal: TestCaseInternal[] }> {
  return apiFetch(`/api/internal/testcases/${problemId}`);
}
