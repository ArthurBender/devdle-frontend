import Markdown from "react-markdown";
import { FiChevronLeft } from "react-icons/fi";
import type { Problem, Language, Difficulty } from "../../types";

const LANG_EXT: Record<Language, string> = {
  javascript: ".js",
  python: ".py",
  ruby: ".rb",
};

const LANG_TEXT_CLASS: Record<Language, string> = {
  javascript: "text-lang-js",
  python: "text-lang-py",
  ruby: "text-lang-rb",
};

const LANG_BG_CLASS: Record<Language, string> = {
  javascript: "bg-lang-js",
  python: "bg-lang-py",
  ruby: "bg-lang-rb",
};

interface ProblemPanelProps {
  problem: Problem;
  language: Language;
  difficulty: Difficulty;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function ProblemPanel({ problem, language, difficulty, isOpen, onClose, onOpen }: ProblemPanelProps) {
  if (!isOpen) {
    return (
      <div
        className="w-8 bg-surface border-r border-border flex flex-col items-center py-4 cursor-pointer hover:bg-border/30 transition-colors shrink-0"
        onClick={onOpen}
        title="Open problem panel"
      >
        <span
          className="text-text-secondary text-xs font-medium tracking-widest uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Problem
        </span>
        <span className={`w-2 h-2 rounded-full ${LANG_BG_CLASS[language]} mt-auto mb-1`} />
      </div>
    );
  }

  return (
    <div className="w-72 bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Problem
        </span>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close problem panel"
        >
          <FiChevronLeft size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className={`text-xs font-mono font-semibold ${LANG_TEXT_CLASS[language]}`}>
            {LANG_EXT[language]}
          </span>
          <span className="text-xs uppercase text-text-secondary tracking-wide border border-border rounded px-1.5 py-0.5">
            {difficulty}
          </span>
        </div>
        <h2 className="text-text-primary font-semibold text-base mb-3">{problem.title}</h2>
        <div className="text-text-secondary text-xs leading-relaxed [&_code]:bg-border [&_code]:px-1 [&_code]:rounded [&_code]:text-text-primary [&_pre]:bg-bg [&_pre]:border [&_pre]:border-border [&_pre]:rounded [&_pre]:p-3 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h3]:text-text-primary [&_h3]:font-medium [&_h3]:mt-3 [&_h3]:mb-1 [&_strong]:text-text-primary [&_p]:mb-2">
          <Markdown>{problem.description}</Markdown>
        </div>
      </div>
    </div>
  );
}
