# Devdle Frontend

React + TypeScript frontend for Devdle — a Wordle-inspired daily coding challenge.

Every day, 6 problems are available: one beginner + one advanced for each of JavaScript, Python, and Ruby. Users write solutions in a Monaco editor and run them entirely in the browser — no code is sent to the server. Stats (streak, history) are stored in localStorage; no account is required.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** — custom design tokens only (no raw palette classes)
- **Monaco Editor** (`@monaco-editor/react`) — in-browser code editor
- **In-browser execution:**
  - JavaScript — Web Worker + `Function` constructor
  - Python — Pyodide (~10 MB WASM, loaded on first Python selection)
  - Ruby — `@ruby/wasm-wasi` (~50 MB, lazy-loaded on first Run click)
- **React Router v7** — routes: `/:date` (problem grid), `/:date/:lang/:difficulty` (editor)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`. API calls are proxied to `http://localhost:3001` (the backend) — make sure the backend is also running.

The Pyodide WASM files are copied into `public/pyodide/` automatically during `npm run build`. For local dev, Vite serves them from `node_modules/pyodide` via the proxy — no manual step needed.

## Environment Variables

Create a `.env` file in the project root if you need to override defaults:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty — same-origin)* | Set to the backend URL if frontend and backend are on different domains |
| `VITE_APP_START_DATE` | `2026-05-12` | The first day Devdle was live. Determines puzzle numbers and disables navigation before this date. Update before deploying if you change the launch date. |

## Scripts

```bash
npm run dev      # Vite dev server with HMR at localhost:5173
npm run build    # Copy Pyodide assets, type-check, then bundle for production
npm run lint     # ESLint
npm run preview  # Serve the production build locally
```

## Production Deployment

The CI pipeline (`.github/workflows/publish.yml`) builds and pushes `arthurllbender/devdle-frontend:latest` to Docker Hub on every push to `master`. Set the `DOCKERPASS` secret in the repository settings to enable it.

The production web server (nginx) must set these headers for the WASM runtimes to work:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are already configured in `nginx/nginx.conf` inside the Docker image.
