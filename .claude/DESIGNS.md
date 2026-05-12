# Devdle UI Design Reference

Derived from the PNG mockups in `.claude/designs/`. Update this file instead of re-reading PNGs.

---

## Global Layout

- Dark theme by default (`data-theme="dark"` on `<html>`)
- Full-height app shell (`h-screen flex flex-col`)
- Background: `--color-bg` (#09090b)
- Surface cards: `--color-surface` (#18181b)
- Borders: `--color-border` (#27272a)

---

## Header (shared across all pages)

Single dark bar across the full width. Three zones:

```
[Devdle #N]    [← date nav →]    [stats icon] [tutorial icon] [theme icon]
```

- **Logo:** "Devdle" bold text left-aligned, `#N` puzzle number in `text-text-secondary` immediately after (e.g. `#216`)
- **Center — Home:** `←` arrow | calendar icon + `Mon · May 11, 2026` | `→` arrow (DateNav)
- **Center — Problem page:** `←` back arrow | `.js` language badge + `BEGINNER` label + problem title
- **Right icons:** 3 icon buttons — person (StatsModal), info `?` (TutorialModal), sun/moon (theme toggle)
- Puzzle number `#N` appears on both home and problem page headers

---

## Home Page (`home-empty.png`, `home-filled.png`, `home-expanded.png`)

### Tagline
Centered hero text below the header:
> **Prove your programmer skills** — one puzzle at a time.

Bold for the first part, regular weight for "— one puzzle at a time."

### StatsHero Card
Rounded dark surface card (`bg-surface border border-border rounded-xl`), full-width with padding.

**Top row:**
- Left: small indigo/accent gem icon + `CURRENT STREAK` small-caps label above a large bold number + `days` in muted text
- Right: `Show calendar ∨` / `Hide calendar ∧` toggle button (small, ghost style)

**Bottom stats row** (3 equal columns with subtle dividers):
- `0/6 TODAY` — bold number, muted label
- `24 BEST STREAK` — bold number, muted label
- `46 SOLVED` — bold number, muted label

### CalendarHeatmap
- Hidden by default; toggled with the "Show calendar" button in StatsHero
- GitHub-style contribution graph (react-calendar-heatmap)
- Shown inside or below StatsHero card when expanded
- Month labels in muted small text
- Square colors use accent color at 0%, 25%, 50%, 75%, 100% opacity for 0–4+ solved/day

### Problem Grid Section
- Section label: `TODAY'S SET` small-caps muted text (left) + `0/6 solved` muted small text (right)
- 3-column grid (JavaScript | Python | Ruby), each column is one card

**Language Column Card** (`bg-surface border border-border rounded-lg overflow-hidden`):
```
┌─────────────────────────────────┐
│ [.js badge] JavaScript     .js  │  ← language header row, same surface color but with lang badge
├─────────────────────────────────┤
│ BEGINNER          • Not started │  ← difficulty label (small-caps muted) + status badge
│                                 │
│ Problem title text              │  ← medium weight
│                                 │
│ untried                       > │  ← muted status text + chevron
├─────────────────────────────────┤
│ + ADVANCED        • Not started │
│                                 │
│ Problem title text              │
│                                 │
│ untried                       > │
└─────────────────────────────────┘
```

**Language badge** (small colored pill/circle in header):
- JS: amber (`--color-lang-js: #f59e0b`), abbrev "JS"
- Python: blue (`--color-lang-py: #3b82f6`), abbrev "PY"
- Ruby: red (`--color-lang-rb: #ef4444`), abbrev "RB"

**Status badges** (small pill with dot indicator):
- `• Not started` — neutral gray dot
- `• Solved` — green dot, text green
- `• In progress` — amber dot, text amber

**Bottom metadata in card** when solved/attempted:
- Solved: `solved in N` (small muted text)
- In progress: `N runs` (small muted text)
- Untried: `untried` (small muted text)

### Footer
Full-width bottom bar:
- Left: `© 2026 Devdle · daily puzzles for devs` (muted small text)
- Right: `Next puzzle in 13h 42m` — live countdown, updated every 60s (muted small text)

---

## Problem Page (`problem-page-panels-open.png`, `problem-page-panels-closed.png`, `problem-page-panels-success.png`, `problem-page-failing.png`)

### Layout (panels open)
```
┌──────────────────────────────────────────────────────────────────┐
│                           HEADER                                 │
├────────────────┬─────────────────────────────┬───────────────────┤
│ PROBLEM panel  │        Monaco Editor         │   TESTS panel     │
│ (~25% width)   │        (~55% width)          │   (~20% width)    │
│                │                              │                   │
│ [collapsible]  │  [file tab + status bar]     │  [collapsible]    │
│                │  Monaco content              │  Test results     │
│                │                              │  Output panel     │
├────────────────┴─────────────────────────────┴───────────────────┤
│  Run · first attempt · ln 8, col 18    [Reset]  [▶ Run  ⌘ ↵]   │
└──────────────────────────────────────────────────────────────────┘
```

### Layout (panels closed)
Both panels collapse to a thin vertical strip (~32px wide) with rotated text.
The Monaco editor expands to fill the freed space.

**Left strip (Problem panel closed):**
- Thin vertical bar (same `bg-surface` or slightly darker)
- Rotated text: `PROBLEM` (vertical, bottom-to-top)
- Language colored dot indicator at the bottom of the strip (amber/blue/red)
- Clicking opens the panel

**Right strip (Tests panel closed):**
- Thin vertical bar
- Rotated text: `TESTS`
- Test count `3/5` displayed vertically
- Clicking opens the panel

### Problem Panel (left, collapsible)
- Header row: `PROBLEM` label + close `›` arrow button (right-aligned)
- Content: react-markdown rendered problem description
  - Styled: headings, `inline code` with surface bg, bullet lists, example block
- Background: `bg-surface` or slightly darker, full height, scrollable

### Monaco Editor (center)
**File tab bar:**
- `● solve.js ●` — dots indicate unsaved/modified state
- Background: `bg-bg` (slightly darker than panels)

**Top-right status:**
- `UTF-8 · LF · solve()` — small muted text

**Editor options:**
- Theme: `vs-dark`
- Font size: from `UserPrefs.editorFontSize`
- No minimap
- Line numbers on
- Tab size: 2

### Tests Panel (right, collapsible)
**Header row:** `TESTS 3/5` label + close `‹` arrow button

**Per-run display:**
```
RUN #0                        0.9 ms
● 3 pass  ○ 2 pending
```

**Test rows:**
- ✓ `test name`  `0.4ms`  (green check, green text for pass)
- ✗ `test name`  `0.5ms`  (red cross, red text for fail)
- ○ `test name`  `—`      (gray dot, gray text for pending/not-run)

In expert mode: only `3 / 5 passed` summary line, no individual rows.

**Output panel** (inside Tests panel, below test rows):
- Collapsed/expanded toggle: `OUTPUT` label + `stdout` badge
- Dark console area:
  ```
  > running solve() against 5 test cases...
  [tc_0] test label
  [tc_2] AssertionError: expected -3 to equal -2
  ```
- Pass lines: normal muted color
- Error lines: `--color-error` red

### Bottom Status Bar
Full-width bar at the bottom of the problem page:

- Left: `Run · first attempt · ln N, col N`
  - `Run` is static label
  - `first attempt` updates to `attempt N` after each run
  - `ln N, col N` tracks Monaco cursor position
- Right: `[Reset]` ghost button + `[▶ Run  ⌘ ↵]` primary accent button

### Success State (`problem-page-panels-success.png`)
When all tests pass, the Tests panel header changes to a success banner:
> ✓ All tests passed — solved in N runs

Large green checkmark icon. The test rows still show all ✓ green.

---

## Tutorial Modal (`modal-Tutorial.png`)

```
┌─────────────────────────────────────────┐
│ [+] How Devdle works               [×]  │
│     Daily puzzles for devs              │
├─────────────────────────────────────────┤
│ A new set of six coding problems is     │
│ generated every 24 hours. Solve them    │
│ in your browser. Keep your streak alive.│
│                                         │
│ [1] Pick a problem                      │
│     Three languages, two difficulties   │
│     each. Beginner ~5 min; advanced     │
│     takes the whole coffee.             │
│     ● .js  ● .py  ● .rb  beginner/adv  │
│                                         │
│ [2] Write solve()                       │
│     Implement the solve() function.     │
│     Runs entirely in your browser —     │
│     no servers, no signup.              │
│     ┌──────────────────────────┐        │
│     │ function solve(items) {  │        │
│     │   // your code here      │        │
│     │ }                        │        │
│     └──────────────────────────┘        │
│                                         │
│ [3] Run the tests                       │
│     Press ⌘ + ↵ to run. See each test  │
│     by name, pass/fail — not the inputs.│
│     ✓ handles empty array     0.4ms     │
│     ✗ sum of floats and ints  0.5ms     │
│                                         │
│                          [  Got it  ]   │
└─────────────────────────────────────────┘
```

- Modal icon: `+` in a rounded square (accent color)
- Title: "How Devdle works", subtitle: "Daily puzzles for devs"
- Numbered steps with bold titles and description text
- "Got it" button: accent filled, right-aligned
- Clicking × or "Got it" sets `seenTutorial: true` and closes

---

## Stats Modal (`modal-Stats.png`)
*(Phase 7 — not built in Phase 3. See design PNG for reference.)*

4 stat tiles (PLAYED, WIN%, CURRENT STREAK, MAX STREAK) + attempts bar chart + by-language counts + countdown timer.

---

## Settings Modal (`modal-Settings.png`)
*(Phase 7 — not built in Phase 3. See design PNG for reference.)*

Theme selector (Light/Dark/System), font size segmented control, expert mode toggle, reset/backup/restore stats, version string.

---

## Color Tokens

Defined in `src/index.css`, available as Tailwind utilities via `@theme inline`:

| Token | Class | Light | Dark |
|---|---|---|---|
| `--color-bg` | `bg-bg` | #ffffff | #09090b |
| `--color-surface` | `bg-surface` | #f4f4f5 | #18181b |
| `--color-border` | `border-border` | #e4e4e7 | #27272a |
| `--color-text-primary` | `text-text-primary` | #09090b | #fafafa |
| `--color-text-secondary` | `text-text-secondary` | #71717a | #a1a1aa |
| `--color-accent` | `bg-accent`, `text-accent` | #4f46e5 | #6366f1 |
| `--color-success` | `text-success` | #16a34a | #22c55e |
| `--color-error` | `text-error` | #dc2626 | #ef4444 |
| `--color-warning` | `text-warning` | #d97706 | #f59e0b |
| `--color-lang-js` | `bg-lang-js`, `text-lang-js` | #f59e0b | #f59e0b |
| `--color-lang-py` | `bg-lang-py`, `text-lang-py` | #3b82f6 | #3b82f6 |
| `--color-lang-rb` | `bg-lang-rb`, `text-lang-rb` | #ef4444 | #ef4444 |

---

## Icon Reference (`react-icons/fi` — Feather)

All icons use `react-icons`. Never write inline SVG components.

| UI element | Icon |
|---|---|
| Stats button (header) | `FiUser` |
| Tutorial / info button (header) | `FiHelpCircle` |
| Theme toggle button (header) | `FiSun` / `FiMoon` |
| Date nav previous | `FiChevronLeft` |
| Date nav next | `FiChevronRight` |
| Date label (header center) | `FiCalendar` |
| Streak icon (StatsHero) | `FiZap` |
| "Show calendar" expand | `FiChevronDown` |
| "Hide calendar" collapse | `FiChevronUp` |
| Problem panel open/close | `FiChevronRight` / `FiChevronLeft` |
| Tests panel open/close | `FiChevronLeft` / `FiChevronRight` |
| Run button | `FiPlay` |
| Success checkmark | `FiCheckCircle` |
| Test pass row | `FiCheck` |
| Test fail row | `FiX` |
| Test pending row | use a gray `○` circle element, not an icon |
| Modal close (icon buttons) | `FiX` |
| Back arrow (problem page header) | `FiArrowLeft` |
