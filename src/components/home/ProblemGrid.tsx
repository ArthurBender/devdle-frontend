import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { Badge } from "../ui/Badge";
import type { DailyProblemSet, Language, Difficulty, LocalStats } from "../../types";

const LANGUAGES: Language[] = ["javascript", "python", "ruby"];

const LANG_META: Record<Language, { label: string; abbr: string; ext: string; colorClass: string; extClass: string }> = {
  javascript: { label: "JavaScript", abbr: "JS", ext: ".js", colorClass: "bg-lang-js text-white", extClass: "text-lang-js" },
  python: { label: "Python", abbr: "PY", ext: ".py", colorClass: "bg-lang-py text-white", extClass: "text-lang-py" },
  ruby: { label: "Ruby", abbr: "RB", ext: ".rb", colorClass: "bg-lang-rb text-white", extClass: "text-lang-rb" },
};

const LANG_BORDER_COLOR: Record<Language, string> = {
  javascript: "var(--color-lang-js)",
  python: "var(--color-lang-py)",
  ruby: "var(--color-lang-rb)",
};

const LANG_HEADER_GRADIENT: Record<Language, string> = {
  javascript: "linear-gradient(to right, rgba(245, 158, 11, 0.15), transparent)",
  python: "linear-gradient(to right, rgba(59, 130, 246, 0.15), transparent)",
  ruby: "linear-gradient(to right, rgba(239, 68, 68, 0.15), transparent)",
};

const DIFFICULTIES: Difficulty[] = ["beginner", "advanced"];

type CardStatus = "untried" | "in-progress" | "solved";

function getCardStatus(stats: LocalStats, problemId: string): { status: CardStatus; runs?: number } {
  const records = stats.history.filter((a) => a.problemId === problemId);
  if (records.length === 0) return { status: "untried" };
  const solved = records.find((a) => a.solved);
  if (solved) return { status: "solved", runs: solved.attempts };
  const maxAttempts = Math.max(...records.map((a) => a.attempts));
  return { status: "in-progress", runs: maxAttempts };
}

interface ProblemGridProps {
  date: string;
  problemSet: DailyProblemSet;
  stats: LocalStats;
}

export function ProblemGrid({ date, problemSet, stats }: ProblemGridProps) {
  const totalSolvedToday = problemSet.problems.filter(
    (p) => getCardStatus(stats, p.id).status === "solved"
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-secondary uppercase tracking-wide font-medium">
          Today's Set
        </span>
        <span className="text-xs text-text-secondary">{totalSolvedToday}/6 solved</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => {
          const meta = LANG_META[lang];
          return (
            <div
              key={lang}
              className="bg-surface border border-border rounded-lg overflow-hidden"
              style={{ borderLeftColor: LANG_BORDER_COLOR[lang], borderLeftWidth: "3px" }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5 border-b border-border"
                style={{ backgroundImage: LANG_HEADER_GRADIENT[lang] }}
              >
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${meta.colorClass}`}>
                  {meta.abbr}
                </span>
                <span className="text-sm font-semibold text-text-primary">{meta.label}</span>
                <span className={`ml-auto text-xs font-mono font-semibold ${meta.extClass}`}>{meta.ext}</span>
              </div>
              {DIFFICULTIES.map((diff) => {
                const problem = problemSet.problems.find(
                  (p) => p.language === lang && p.difficulty === diff
                );
                if (!problem) {
                  return (
                    <div
                      key={diff}
                      className="px-3 py-4 border-b border-border last:border-b-0 text-text-secondary text-xs italic"
                    >
                      No problem available
                    </div>
                  );
                }
                const { status, runs } = getCardStatus(stats, problem.id);
                return (
                  <Link
                    key={diff}
                    to={`/${date}/${lang}/${diff}`}
                    className="block px-4 py-5 border-b border-border last:border-b-0 hover:bg-border/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-secondary uppercase tracking-wide">
                        {diff === "beginner" ? "Beginner" : "Advanced"}
                      </span>
                      <Badge
                        variant={
                          status === "solved"
                            ? "success"
                            : status === "in-progress"
                            ? "warning"
                            : "neutral"
                        }
                        dot
                      >
                        {status === "solved"
                          ? "Solved"
                          : status === "in-progress"
                          ? "In progress"
                          : "Not started"}
                      </Badge>
                    </div>
                    <div className="text-sm text-text-primary font-medium leading-snug mb-3">
                      {problem.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">
                        {status === "solved"
                          ? `solved in ${runs}`
                          : status === "in-progress"
                          ? `${runs} runs`
                          : "untried"}
                      </span>
                      <FiChevronRight
                        size={13}
                        className="text-text-secondary group-hover:text-text-primary transition-colors"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
