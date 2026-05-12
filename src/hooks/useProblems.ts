import { useState, useEffect } from "react";
import { fetchProblems } from "../api/client";
import type { DailyProblemSet } from "../types";

export type ProblemsState =
  | { status: "loading" }
  | { status: "ok"; data: DailyProblemSet }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function useProblems(date: string): ProblemsState {
  const [state, setState] = useState<ProblemsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchProblems(date)
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch((err: unknown) => {
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
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  return state;
}
