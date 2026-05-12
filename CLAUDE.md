# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reference Documents

- **Full product plan, all phases, TypeScript interfaces, and implementation notes:** `../.claude/PLAN.md`
- **UI design reference (layout, colors, component details — read this first):** `.claude/DESIGNS.md`
- **UI design PNG mockups (source of truth, consult when DESIGNS.md is insufficient):** `.claude/designs/`

Always consult `.claude/DESIGNS.md` before implementing new screens or features. Only open PNGs if you need detail not covered there.

---

## Commands

```bash
# Frontend (this repo)
npm run dev       # Vite dev server with HMR at localhost:5173
npm run build     # Type-check (tsc -b) then bundle for production
npm run lint      # ESLint
npm run preview   # Serve the production build locally

# Backend (../devdle-backend)
npm run dev       # tsx watch — restarts on file save
```

No test runner is configured yet on either side.

---

## What Devdle Is

A Wordle-inspired daily coding challenge. Every 24 hours, **6 problems** are generated via the Gemini 2.5 Flash API: one beginner + one advanced for each of **JavaScript, Python, and Ruby**. Users solve them in an in-browser editor with fully in-browser code execution — no server-side runner. Stats persist in localStorage.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Routing | React Router v7 (`"/:date"` → HomePage, `"/:date/:lang/:difficulty"` → ProblemPage) |
| Styling | Tailwind CSS — **custom tokens only** (see rule below) |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| JS execution | Web Worker + `Function` constructor |
| Python execution | Pyodide (~10 MB WASM, eager-load on first Python selection) |
| Ruby execution | `@ruby/wasm-wasi` (~50 MB, lazy-load with progress bar on first Run click) |
| Icons | `react-icons` (Feather subset via `react-icons/fi`) |
| Activity heatmap | `react-calendar-heatmap` |
| Backend | Express + TypeScript + MongoDB + Gemini (`../devdle-backend`) |

---

## Tailwind Color Rule

**Never use Tailwind's built-in color palette directly** (no `bg-blue-500`, `text-gray-300`, etc.). All colors must come from custom design tokens backed by CSS variables so the palette can be updated in one place.

**Setup pattern (Tailwind v4 + `@tailwindcss/vite` — no `tailwind.config.ts`):**

`src/index.css`:
```css
@import "tailwindcss";

:root {
  --color-bg: #ffffff;
  /* light values ... */
}

[data-theme="dark"] {
  --color-bg: #09090b;
  /* dark overrides ... */
}

/* Wire CSS vars into Tailwind utilities */
@theme inline {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-border: var(--color-border);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-accent: var(--color-accent);
  --color-success: var(--color-success);
  --color-error: var(--color-error);
  --color-warning: var(--color-warning);
}
```

Usage in components: `bg-bg`, `text-text-primary`, `border-border`, `bg-accent`, etc.

Note: VS Code may warn about `@theme` — this is a false positive. `.vscode/settings.json` sets `"css.lint.unknownAtRules": "ignore"` to suppress it.

---

## API Base URL

`src/api/client.ts` prepends `VITE_API_BASE_URL` (from `.env`) to all fetch calls. Leave it unset for same-origin deployments — Vite's dev proxy and production co-location both work with relative `/api` paths.

If frontend and backend are ever on separate domains (e.g. Vercel + Railway), set `VITE_API_BASE_URL=https://api.example.com` **and** add CORS middleware to the backend for `/api/problems/*` and `/api/health`. The `/api/internal/*` endpoint must **never** get CORS headers — browser blocks cross-origin requests there by design.

---

## vite.config.ts — Required Settings

These headers and options are mandatory for the WASM runtimes to function:

```ts
server: {
  proxy: { '/api': 'http://localhost:3001' },
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',   // required for SharedArrayBuffer (Pyodide)
    'Cross-Origin-Embedder-Policy': 'require-corp', // required for SharedArrayBuffer (Pyodide)
  },
},
worker: { format: 'es' },
optimizeDeps: { exclude: ['pyodide'] },
```

The same COOP/COEP headers must be set in the production web server config.

---

## Key Architecture Decisions

### Routes
```
/                         → HomePage (redirects to today's date)
/:date                    → HomePage (problem grid for that UTC date)
/:date/:lang/:difficulty  → ProblemPage (editor + test results)
```

### Runner Architecture

All user code runs in **Web Workers** (one singleton per language, created on first use).

Worker message protocol (defined in `src/runners/protocol.ts`):
```
Main → Worker:  { type: "RUN"; requestId; userCode; problemId }
Worker → Main:  { type: "READY" | "LOADING"; progress? }
                { type: "OUTPUT"; requestId; line }   ← stdout for OutputPanel
                { type: "RESULT"; requestId; results: TestResult[] }
                { type: "ERROR"; requestId; error }
```

Python and Ruby workers are terminated after 30s of inactivity (WASM memory reclaim). They recreate on next use. Workers fetch internal test cases themselves from `/api/internal/testcases/:problemId` — this endpoint intentionally has no CORS headers, so it's only reachable from same-origin workers.

### localStorage Keys
- `"devdle_stats"` — `LocalStats` (streak, history, totals)
- `"devdle_prefs"` — `UserPrefs` (theme, editorFontSize, expertMode, seenTutorial)

### Test Case Split
- **Public** (`TestCasePublic: { id, name }`) — sent to the client, shown to users.
- **Internal** (`TestCaseInternal: { id, name, args, expected }`) — stored in MongoDB, fetched by workers at run time, never in the public API response.

### Problem IDs
Format: `YYYY-MM-DD_language_difficulty` — e.g. `2026-05-12_javascript_beginner`. Used as localStorage keys and in the internal test case endpoint.

---

## Important Development Notes

- **UTC everywhere:** Use `new Date().toISOString().slice(0, 10)` — never local date methods. Avoids timezone mismatches between users and server.
- **`APP_START_DATE`:** Read from `VITE_APP_START_DATE` in `.env` (Vite bakes it into the bundle at build time). Fallback hardcoded in `src/config.ts`. DateNav disables "previous" at this date. Puzzle number `#N` = days since this date + 1. Update `.env` and rebuild before deploying.
- **All generated problems use `solve` as the entry-point function name** across all three languages. Workers call `solve(...args)` directly.
- **Theme:** Applied via `data-theme` attribute on `<html>`. `"system"` preference listens for `prefers-color-scheme` changes.
- **Expert mode:** When `UserPrefs.expertMode` is true, `TestResultPanel` shows only "X/Y passed" — no individual test names.
- **Monaco language IDs:** `"javascript"`, `"python"`, `"ruby"` (all have built-in syntax highlighting).

---

## Icons

Use `react-icons` for all icons — never write inline SVG components. See `.claude/DESIGNS.md` for which icons map to which UI elements.

---

## TypeScript Strictness

`tsconfig.app.json` enforces `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly`. Avoid `enum` and `namespace` — use `const` objects or union types instead.