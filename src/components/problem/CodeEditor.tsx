import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { Language } from "../../types";

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

const MONACO_LANG: Record<Language, string> = {
  javascript: "javascript",
  python: "python",
  ruby: "ruby",
};

const LANG_DOT_CLASS: Record<Language, string> = {
  javascript: "bg-lang-js",
  python: "bg-lang-py",
  ruby: "bg-lang-rb",
};

interface CodeEditorProps {
  language: Language;
  filename: string;
  value: string;
  onChange: (value: string) => void;
  fontSize: number;
}

export function CodeEditor({ language, filename, value, onChange, fontSize }: CodeEditorProps) {
  const isDark = useIsDarkTheme();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${LANG_DOT_CLASS[language]}`} />
          <span className="text-xs text-text-primary font-mono">{filename}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-text-secondary">
          <span>UTF-8</span>
          <span>·</span>
          <span>LF</span>
          <span>·</span>
          <span className="font-mono">solve()</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          language={MONACO_LANG[language]}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          theme={isDark ? "vs-dark" : "vs"}
          options={{
            fontSize,
            minimap: { enabled: false },
            lineNumbers: "on",
            tabSize: 2,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: "all",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          }}
        />
      </div>
    </div>
  );
}
