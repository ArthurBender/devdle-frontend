import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface OutputPanelProps {
  lines: string[];
}

export function OutputPanel({ lines }: OutputPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [hadLines, setHadLines] = useState(false);
  const hasLines = lines.length > 0;

  if (hasLines && !hadLines) {
    setExpanded(true);
    setHadLines(true);
  } else if (!hasLines && hadLines) {
    setHadLines(false);
  }

  return (
    <div className="border-t border-border shrink-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        {expanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
        <span className="font-medium uppercase tracking-wide">Output</span>
        <span className="ml-1 text-text-secondary/60">stdout</span>
      </button>
      {expanded && (
        <div className="bg-bg border-t border-border px-3 py-2 max-h-32 overflow-y-auto font-mono text-xs">
          {lines.length === 0 ? (
            <span className="text-text-secondary italic">No output yet.</span>
          ) : (
            lines.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("Error") || line.includes("error")
                    ? "text-error"
                    : "text-text-secondary"
                }
              >
                {line}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
