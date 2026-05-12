export type Language = "javascript" | "python" | "ruby";
export type Difficulty = "beginner" | "advanced";

export interface TestCasePublic {
  id: string;
  name: string;
}

export interface TestCaseInternal {
  id: string;
  name: string;
  args: unknown[];
  expected: unknown;
}

export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  runtimeMs: number;
  output?: string[];
}

export interface Problem {
  id: string;
  language: Language;
  difficulty: Difficulty;
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCasePublic[];
}

export interface DailyProblemSet {
  date: string;
  problems: Problem[];
  generatedAt: string;
}

export interface AttemptRecord {
  date: string;
  problemId: string;
  solved: boolean;
  attempts: number;
  solvedAtMs: number | null;
}

export interface LocalStats {
  version: 1;
  currentStreak: number;
  maxStreak: number;
  totalSolved: number;
  totalPlayed: number;
  history: AttemptRecord[];
}

export interface UserPrefs {
  theme: "dark" | "light" | "system";
  editorFontSize: 12 | 13 | 14 | 16;
  expertMode: boolean;
  seenTutorial: boolean;
}
