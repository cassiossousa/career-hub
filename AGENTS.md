# AGENTS.md — Repository Engineering Constitution

You are working in a remediated, strictly typed front-end codebase. Your goal is to ship small, deterministic, verifiable changes—NEVER large unverified file dumps.

## 1. Architectural Boundaries

- **Framework:** Vite + React SPA with strict client-side state separation.
- **Directory Boundaries** (under `apps/web/src/`):
  - `app/` — Theme, route path constants, app-level wiring only.
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
3. `npx playwright test` — real-browser smoke + WCAG 2.1 AA audits for every public route (`apps/web/e2e/smoke.spec.ts`, config in `playwright.config.ts`, dev server on port 4173).
4. Production-build memory-leak detection via `@memlab/api` (`scripts/memlab-run.cjs` + `scripts/memlab-portfolio.cjs`): builds the app, serves `vite preview` on port 4173, and fails on leaked-object clusters. Artifacts land in `.memlab/` (gitignored).

Prerequisite (one-time per machine): `npx playwright install chromium`. The MemLab step reuses the Playwright Chromium binary when present.

### CI, hooks, and local gates

- **CI** (`.github/workflows/ci.yml`): `verify:all` on every push/PR, `check:mutate:diff` on PRs, and a dedicated `e2e` job that installs Playwright Chromium and runs `npm run test:e2e`.
- **Pre-commit** (`.husky/pre-commit`): `lint-staged` — oxlint, biome, prettier on staged files.
- **Pre-push** (`.husky/pre-push`): `npm run verify:push` (types + knip + bloat + arch only; browser gates stay out of the push path).
- **Gitignored audit artifacts:** `.memlab/`, `test-results/`, `playwright-report/`, `dist/`.

Do not claim a task is complete until `npm run verify:all` exits with code `0`; run `npm run audit:deep` whenever the change touched runtime behavior, routing, styling, or dependencies.
