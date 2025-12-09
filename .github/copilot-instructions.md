# Copilot / AI Agent Instructions

Purpose: give an AI coding assistant the minimal, actionable knowledge to be productive in this repo.

- **Big picture**: this is a small demo streaming app split into two services:
  - `backend/` — Node.js + Express server (single process) that uses MySQL (`mysql2/promise`) and exposes a small REST API on port `5000` by default (`backend/server.js`). Database schema and seed data are in `backend/database.sql`.
  - `frontend/` — React + Vite + Tailwind front-end (`frontend/src/App.jsx`) that can run with mock data or call the backend when `USE_REAL_DB = true` and `API_URL = 'http://localhost:5000/api'`.

- **How to run (local dev)**:
  - Backend:
    - cd `backend`
    - `npm install`
    - Ensure a MySQL instance exists and import `backend/database.sql` (DBeaver or mysql CLI).
    - Configure DB via env vars or edit `backend/server.js` `DB_CONFIG` (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`).
    - `npm start` (runs `node server.js`, server listens on `PORT` env or 5000)
    - One-off: run `node fetchFullOMDb.js` to enrich `Media` rows from OMDb (script uses `node-fetch`).
  - Frontend:
    - cd `frontend`
    - `npm install`
    - `npm run dev` (uses Vite, app entry `frontend/index.html` -> `/src/main.jsx`)

- **API surface (examples)** — refer to `backend/server.js` for implementation details:
  - `GET /api/media` — returns media list (fields include `media_ID`, `title`, `description`, `release_date`, `type`, `poster`, `backdrop`)
  - `POST /api/login` — body `{ email, password }` — returns `{ success, user }` on success. Note: login logic maps DB `R1`/`R2` roles to `user`/`admin` in code.
  - Comments: `POST /api/comments/add`, `GET /api/comments/:movieId`.
  - Media updates: `PUT /api/media/genres/:id` and `GET /api/media/:id/related`.

- **Project-specific conventions & patterns**:
  - Frontend contains a `USE_REAL_DB` boolean in `frontend/src/App.jsx`. Tools/scripts should respect this flag when running end-to-end tests or mock mode.
  - Mock data and initial users/media are embedded in `frontend/src/App.jsx` (`INITIAL_USERS`, `INITIAL_MEDIA`). Use these for frontend-only work or unit tests.
  - The backend uses `mysql2/promise` and `conn.execute` with parameterized queries — follow that pattern for new DB code.
  - DB schema is normalized and uses typed IDs (e.g., `M001`, `U001`, `G01`); prefer using these IDs in fixtures to match `database.sql` seeds.

- **Important implementation notes / gotchas (detectable in code)**:
  - `backend/server.js` includes hard-coded DB credentials (user `root`, password `11`) — prefer using env vars. README already mentions `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.
  - There is an apparent bug / stray block near the top of `server.js` labeled `ADMIN: ADD USER` — it contains `const { username, email, password, role } = req.body;` but no surrounding `app.post(...)`. Treat this as a likely missing endpoint; do not assume it's a working API without confirming and fixing.
  - `POST /api/login` has duplicate `return res.json({ success: false, message: "Invalid credentials" });` lines and a permissive password check (`password === user.password || password === ""`) — tests or fixes should be conservative and call this out in PR notes.
  - `fetchFullOMDb.js` uses an OMDb API key inside the file; when updating or running, ensure the key is valid and rate limits are respected.

- **Where to look for examples**:
  - SQL schema & seeds: `backend/database.sql` (roles `R1`/`R2`, media, users)
  - Backend routes and DB usage: `backend/server.js` (GET `/api/media`, POST `/api/login`, comments)
  - OMDb enrichment script: `backend/fetchFullOMDb.js` (shows update pattern to `Media` table)
  - Frontend client patterns: `frontend/src/App.jsx` (API usage via `apiService`, mock fallbacks, UI components)

- **Good-first PRs / safe automated changes for an AI**:
  - Add environment-based DB config in `backend/server.js` (read env vars with sensible defaults and remove hard-coded credentials).
  - Fix the stray/malformed `ADMIN: ADD USER` block by wrapping it in a proper `app.post('/api/users/add', ...)` or remove/comment it and add tests.
  - Document how to run `fetchFullOMDb.js` safely (rate limit, where to store API key).

- **Testing & debugging tips**:
  - To quickly iterate frontend-only changes: set `USE_REAL_DB = false` in `frontend/src/App.jsx` and run `npm run dev`.
  - To test backend quickly: ensure DB is imported, then `cd backend && npm start`. Use `curl` or Postman against `http://localhost:5000/api/media` and `http://localhost:5000/api/login`.
  - When changing DB schema, re-run `backend/database.sql` against a new schema and update seeds; do not run it against production.

If any of these sections are unclear or you'd like me to expand examples (sample requests, or a quick `curl` checklist), tell me which part to expand and I will iterate.
