# AGENTS.md — apps/job-tracker

App-specific rules for the job tracker. Every rule in the root `AGENTS.md` still applies — this file adds job-tracker-only detail. Humans: see `CONTRIBUTING.md` for setup.

## Stack and layout

- Vite + React SPA: `react-router-dom`, `@tanstack/react-query`, `axios`, `zod`, `zustand`. Mocked API via MSW in demo mode.
- `src/features/` — `applications`, `dashboard`, `ingestion`, `jobs`, `portfolio`, `resumes`, `settings`, `skills`.
- `src/services/api/` — `apiClient` (axios wrapper); every call site must have a matching MSW handler.
- `src/mocks/` — MSW setup: `browser.ts`, `server.ts`, `handlers.ts`, `data.ts` (fabricated demo data).
- `src/store/` — zustand stores (`filterStore`, `uiStore`, `persistedState`).
- `src/app/env.ts` — resolves `dataMode` (`demo` | `live`). `src/app/storage.ts` is the ONLY module allowed to touch Web Storage.
- `e2e/smoke.spec.ts` — Playwright smoke spec. Excluded from Jest.

## Data mode — demo vs live (safety-critical)

`resolveDataMode()` in `src/app/env.ts`:

- **Dev:** demo unless `VITE_MOCK_API=false`.
- **Prod:** demo unless `VITE_DATA_MODE=live` AND `VITE_API_URL` AND `VITE_API_KEY` are all set.

In demo mode MSW serves fabricated data and a catch-all handler fails any unmocked `/api/*` request — the real API is unreachable even if the env vars are set. Live mode is opt-in only, and its `VITE_API_KEY` is inlined in the public bundle — it is only safe behind Vercel Deployment Protection → Vercel Authentication → **All Deployments**. NEVER enable live mode on a public deployment; never commit real `VITE_*` values (dashboard env vars only).

## Gates that matter here

- **`check:api-mocks`** (`scripts/check-api-mocks.mjs`, part of `verify:all`): every `apiClient.<method>(<url>)` call site in `src/` must have a matching MSW handler in `src/mocks/`; dynamic URLs fail the gate. When adding an API call, add the handler AND extend `src/mocks/data.ts`.
- **Coverage:** own `jest.config.cjs` with coverage thresholds; run via `npm run test[:cov] --workspace job-tracker`.
- **Bundle budget:** 400 kB JS / 20 kB CSS gzip + `.bundle-baseline.json` delta ratchet (same rules as portfolio — see root `AGENTS.md` DoD).
- **Mutation:** `stryker.config.mjs` + `stryker.core.config.mjs`; `check:mutate:diff` on PRs, `check:mutate:core` for the pure-logic core.
- **Strictest tsconfig in the repo:** `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noUnusedLocals`/`noUnusedParameters` — portfolio alignment is pending (see `docs/tooling-effectiveness.md`).
- **Architecture:** `check:arch` (dependency-cruiser) + `architecture.spec.ts`, same as the portfolio.
- **`@/` alias:** same three-way sync rule (`tsconfig` paths → `vite-tsconfig-paths` → Jest `moduleNameMapper`).

## Deployment

- Deploys as its own Vercel project (Root Directory = `apps/job-tracker`). Prod defaults to DEMO mode — that is the intended safe posture for any public URL. Live mode requires the deployment-protection setup described above.
