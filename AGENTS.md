# AGENTS.md — Repository Engineering Constitution

You are working in a remediated, strictly typed front-end codebase. Your goal is to ship small, deterministic, verifiable changes—NEVER large unverified file dumps.

## 1. Architectural Boundaries

- **Framework:** Vite + React SPA with strict client-side state separation.
- **Directory Boundaries** (under `apps/web/src/`):
  - `app/` — Theme, route path constants, app-level wiring only. `app/storage.ts` is the ONLY module allowed to touch Web Storage (see §2).
  - `features/<domain>/` — Self-contained domain slices (UI components, tests). Never import internals from sibling features; enforced by `apps/web/src/architecture.spec.ts`.
  - `components/` — Shared presentational components. Must not import from `features/` or `services/`; enforced by `apps/web/src/architecture.spec.ts`.
  - `services/`, `i18n/`, `types/` — Shared infrastructure layers features may consume.
  - `e2e/` (sibling of `src/`) — Playwright browser specs. Excluded from Jest via `testPathIgnorePatterns`.
- **Dependency cycles** anywhere in `apps/web/src` are forbidden; enforced by `npm run check:arch` (dependency-cruiser).

## 2. Hard Forbidden Anti-Patterns (Instant Rejection)

- **NO Type Escape Hatches:** Never write `any`, `@ts-ignore`, `@ts-expect-error`, or `as unknown as T`. Narrow unknown data at runtime boundaries.
- **NO `useEffect` Data-Fetching Chains:** Never synchronize derived state or fetch server data inside `useEffect`. Derive state during render or use typed query/server loaders.
- **NO Prop-Drilling Soup:** Components accepting > 6 props must be decomposed or backed by a bounded domain hook/context.
- **NO Ghost Files or Unapproved Dependencies:** Do not install new `npm` packages without explicit approval. Do not leave unused exports, dead helpers, or commented-out code blocks behind.
- **NO Tautological "Test Theater":** Never write snapshot tests or `expect(fn).toHaveBeenCalled()` mocks that pass when core business logic is broken.
- **NO Raw Web Storage:** Never call `localStorage`/`sessionStorage` directly. Use `storageGetItem`/`storageSetItem` from `apps/web/src/app/storage.ts` — raw access throws when storage is disabled (enforced by ESLint `no-restricted-syntax`).
- **NO Copy-Paste Sprawl:** Duplicated blocks ≥ 5 lines / 40 tokens fail `npm run check:clones` (jscpd). Extract shared helpers instead.

## 3. Mandatory Definition of Done (Run Before Finishing)

Before concluding ANY task, you MUST execute the repository's deterministic verification suite and fix every single error or warning:

```bash
npm run verify:all
```

If you modified business logic, reducers, or utility functions in `domain/` or `hooks/`, you MUST also verify that your tests survive mutation testing:

```bash
npm run check:mutate:diff
```

### Deep post-generation gate

After any AI-assisted generation or refactor pass, ALSO run the deep audit. It layers runtime checks that `verify:all` intentionally excludes (they need a browser and a built bundle):

```bash
npm run audit:deep
```

`audit:deep` runs, in order, aborting on the first failure:

1. `npm run check:arch` — dependency-cruiser boundary/cycle check.
2. `npx jest apps/web/src/architecture.spec.ts` — feature-isolation and shared-component purity guardrails.
3. `npx playwright test` — real-browser smoke + WCAG 2.1 AA audits for every public route, keyboard tab-order sanity (`apps/web/e2e/smoke.spec.ts`), fault-injection specs (`apps/web/e2e/resilience.spec.ts`): disabled/invalid `localStorage`, offline client-side navigation, and 360px horizontal-overflow checks in English and pt-BR, plus pixel-level visual regression (`apps/web/e2e/visual.spec.ts`) for `/` and `/projects` at desktop and 360px.
4. Production-build memory-leak detection via `@memlab/api` (`scripts/memlab-run.mjs` + `scripts/memlab-portfolio.cjs`): builds the app, serves `vite preview` on port 4173, and fails on leaked-object clusters. Artifacts land in `.memlab/` (gitignored).
5. `npm run check:lighthouse` — Lighthouse CI assertions on the production build (`lighthouserc.json`): performance ≥ 0.75, accessibility ≥ 0.9, best-practices ≥ 0.9, CLS ≤ 0.1. Reports land in `.lighthouseci/` (gitignored).

`verify:all` additionally enforces `npm run check:bundle` after the build step — gzip budgets of 150 kB JS / 20 kB CSS (`scripts/audit-bundle-budget.mjs`) — `npm run check:clones` (jscpd copy-paste ratchet over `apps/web/src`, `apps/web/e2e`, and `scripts/`), and `npm run check:audit` (`npm audit --omit=dev --audit-level=high`, production dependencies only).

ESLint runs `strictTypeChecked` on `apps/web/src` (typed `projectService`), plus `eslint-plugin-sonarjs` cognitive-complexity ≤ 10, `eslint-plugin-check-file` naming conventions (`PascalCase.tsx`, `camelCase.ts`; locale files and `main.tsx` exempt), `eslint-plugin-no-barrel-files`, and `eslint-plugin-security` rules (excluding `services/` and specs) to reject XSS sinks like `dangerouslySetInnerHTML` and unsafe regexes. External data (`fetch().json()`, gray-matter frontmatter) must be narrowed with runtime type guards — never `as` casts.

Visual-regression baselines are platform-suffixed (`*-win32.png`, `*-linux.png`) because font rasterization differs per OS, and are only valid in the environment that produced them (Playwright docs, Argos CI, and kanabun all enforce this). Rules:

- **Canonical environments:** win32 baselines are generated locally; linux baselines are generated inside `mcr.microsoft.com/playwright:v1.65.1-noble` — the same image the CI `e2e` job runs in. Never commit baselines from any other environment.
- **Regenerate:** `npx playwright test visual --update-snapshots` locally for win32; for linux, copy the repo (excluding `node_modules`/`dist`/`.git`) into the container, `npm ci --ignore-scripts`, run `npx playwright test visual --update-snapshots`, and copy `apps/web/e2e/visual.spec.ts-snapshots/*.png` back.
- **Update ritual:** baseline changes must land in the same PR as the visual change they approve — review the diff images, don't blanket-update.
- **Scope:** `/projects` is excluded on purpose (GitHub-synced content churns upstream). macOS has no committed baseline and the suite self-skips there.

Prerequisite (one-time per machine): `npx playwright install chromium`. The MemLab and Lighthouse steps reuse the Playwright Chromium binary when present (`scripts/playwright-chromium.mjs`).

### CI, hooks, and local gates

- **CI** (`.github/workflows/ci.yml`): `verify:all` on every push/PR, `check:mutate:diff` on PRs, and a dedicated `e2e` job that installs Playwright Chromium, runs `npm run test:e2e`, and runs `npm run check:lighthouse`.
- **Pre-commit** (`.husky/pre-commit`): `lint-staged` — oxlint, biome, prettier on staged files.
- **Pre-push** (`.husky/pre-push`): `npm run verify:push` (types + knip + bloat + arch only; browser gates stay out of the push path).
- **Gitignored audit artifacts:** `.memlab/`, `.lighthouseci/`, `test-results/`, `playwright-report/`, `dist/`.

Do not claim a task is complete until `npm run verify:all` exits with code `0`; run `npm run audit:deep` whenever the change touched runtime behavior, routing, styling, or dependencies.
