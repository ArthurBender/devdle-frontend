import { useState, useEffect } from "react";
import { fetchProblems } from "../api/client";
import type { DailyProblemSet } from "../types";

export type ProblemsState =
  | { status: "loading" }
  | { status: "generating" }
  | { status: "ok"; data: DailyProblemSet }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function useProblems(date: string): ProblemsState {
  const [state, setState] = useState<ProblemsState>({ status: "loading" });
  const [prevDate, setPrevDate] = useState(date);

  if (date !== prevDate) {
    setPrevDate(date);
    setState({ status: "loading" });
  }

  useEffect(() => {
    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      try {
        const result = await fetchProblems(date);
        if (cancelled) return;
        if ("generating" in result) {
          setState({ status: "generating" });
          retryTimeout = setTimeout(load, 3000);
        } else {
          setState({ status: "ok", data: result });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { status?: number }).status;
        if (status === 404) {
          setState({ status: "not-found" });
        } else {
          setState({
            status: "error",
            message: (err as Error).message ?? "Unknown error",
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [date]);

  return state;
}
