---
area: job-tracker-app
paths: apps/job-tracker/
last-reviewed: cc53ac3b6ee8ee365566700fe038566e92ab3dd4
---

# apps/job-tracker

## Product purpose

Personal job-application tracker SPA: applications pipeline (saved → applied → screening → interview → offer, plus rejected/withdrawn), job search with filters/presets, resumes, portfolio documents, skills catalog, ingestion runs, and AI-assisted apply flows (apply runs, answer drafts). Backed by the sibling `job-tracker-api` FastAPI service in live mode; fully demo-capable offline via MSW.

## Layout

- `src/features/` — `applications`, `dashboard`, `ingestion`, `jobs`, `portfolio`, `resumes`, `settings`, `skills`.
- `src/services/api/` — dependency-free `apiClient` XHR wrapper; generated OpenAPI types at `src/services/api/generated/openapi.ts` (NEVER hand-edit); `src/services/types/*` re-exports generated component types so contract drift surfaces as `tsc` errors.
- `src/mocks/` — MSW `browser.ts`/`server.ts`/`handlers.ts`/`data.ts` (fabricated demo data).
- `src/store/` — zustand `filterStore`, `uiStore`, `persistedState`.
- `src/app/env.ts` `resolveDataMode()` + `src/app/storage.ts` (sole Web Storage module).
- `contract/openapi.json` — committed copy of the backend's openapi.json.

## Data mode — the safety boundary (read before touching env/API config)

- Dev: demo unless `VITE_MOCK_API=false`. Prod: demo unless `VITE_DATA_MODE=live` AND `VITE_API_URL` AND `VITE_API_KEY` are all set.
- Demo mode: MSW serves fabricated data AND a catch-all fails any unmocked `/api/*` — the real API is unreachable even with env vars set. This is the intended public posture.
- Live mode inlines `VITE_API_KEY` in the public bundle — only safe behind Vercel Deployment Protection → Vercel Authentication → **All Deployments**. NEVER enable on a public deployment; never commit real `VITE_*` values (dashboard env only).

## Gates that bite here

- **`check:api-mocks`** (in `verify:all`): every `apiClient.<method>(<url>)` call site needs a matching MSW handler in `src/mocks/`; dynamic URLs fail. Adding an API call = handler + `data.ts` fixture.
- **Contract sync:** backend API changes → `npm run sync:api-contract --workspace job-tracker` → commit regenerated `contract/openapi.json` + `src/services/api/generated/openapi.ts`. `check:api-contract` verifies freshness (needs sibling checkout or `--from`). Per `multi-part-change`: backend lands first, then sync, then frontend.
- Strictest tsconfig in the repo: `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + unused checks.
- Bundle budget 400 kB JS / 20 kB CSS + baseline ratchet; own Jest `global` coverage floor; Stryker core mutation gate.

## Pitfalls

- Generated files (`contract/openapi.json`, `services/api/generated/`) are excluded from lint/knip/jscpd — drift is caught by `check:api-contract`/`tsc`, not style gates.
- MSW handlers must mirror the real API's error envelope and status codes or demo mode hides contract bugs.
- Recent feature thrust (see git log): apply runs — per-field AI answer regeneration, manual-submit review UI, ATS adapters on the backend.
