# AGENTS.md — Repository Engineering Constitution

You are working in a remediated, strictly typed front-end codebase. Your goal is to ship small, deterministic, verifiable changes—NEVER large unverified file dumps.

## 1. Architectural Boundaries

- **Framework:** Vite + React SPA with strict client-side state separation.
- **Directory Boundaries** (under `apps/professional-portfolio/src/`):
  - `app/` — Theme, route path constants, app-level wiring only. `app/storage.ts` is the ONLY module allowed to touch Web Storage (see §2).
  - `features/<domain>/` — Self-contained domain slices (UI components, tests). Never import internals from sibling features; enforced by `apps/professional-portfolio/src/architecture.spec.ts`.
  - `components/` — Shared presentational components. Must not import from `features/` or `services/`; enforced by `apps/professional-portfolio/src/architecture.spec.ts`.
  - `services/`, `i18n/`, `types/` — Shared infrastructure layers features may consume.
  - `e2e/` (sibling of `src/`) — Playwright browser specs. Excluded from Jest via `testPathIgnorePatterns`.
- **Dependency cycles** anywhere in `apps/professional-portfolio/src` are forbidden; enforced by `npm run check:arch` (dependency-cruiser).

## 2. Hard Forbidden Anti-Patterns (Instant Rejection)

- **NO Type Escape Hatches:** Never write `any`, `@ts-ignore`, `@ts-expect-error`, or `as unknown as T`. Narrow unknown data at runtime boundaries.
- **NO `useEffect` Data-Fetching Chains:** Never synchronize derived state or fetch server data inside `useEffect`. Derive state during render or use typed query/server loaders.
- **NO Prop-Drilling Soup:** Components accepting > 6 props must be decomposed or backed by a bounded domain hook/context.
- **NO Ghost Files or Unapproved Dependencies:** Do not install new `npm` packages without explicit approval. Do not leave unused exports, dead helpers, or commented-out code blocks behind.
- **NO Tautological "Test Theater":** Never write snapshot tests or `expect(fn).toHaveBeenCalled()` mocks that pass when core business logic is broken.
- **NO Raw Web Storage:** Never call `localStorage`/`sessionStorage` directly. Use `storageGetItem`/`storageSetItem` from `apps/professional-portfolio/src/app/storage.ts` — raw access throws when storage is disabled (enforced by ESLint `no-restricted-syntax`). Sole exception: `app/storage.spec.ts`, which must touch raw storage to test the disabled-storage failure path (scoped per-file override in `eslint.config.ts`).
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
2. `npx jest apps/professional-portfolio/src/architecture.spec.ts` — feature-isolation and shared-component purity guardrails.
3. `npx playwright test` — real-browser smoke + WCAG 2.1 AA audits for every public route, keyboard tab-order sanity (`apps/professional-portfolio/e2e/smoke.spec.ts`), fault-injection specs (`apps/professional-portfolio/e2e/resilience.spec.ts`): disabled/invalid `localStorage`, offline client-side navigation, and 360px horizontal-overflow checks in English and pt-BR, plus pixel-level visual regression (`apps/professional-portfolio/e2e/visual.spec.ts`) for `/` and `/work-experience` at desktop and 360px.
4. Production-build memory-leak detection via `@memlab/api` (`apps/professional-portfolio/scripts/memlab-run.mjs` + `apps/professional-portfolio/scripts/memlab-portfolio.cjs`): builds the app, serves `vite preview` on port 4173, and fails on leaked-object clusters. Artifacts land in `apps/professional-portfolio/.memlab/` (gitignored).
5. `npm run check:lighthouse` — Lighthouse CI assertions on the production build (`apps/professional-portfolio/lighthouserc.json`): performance ≥ 0.75, accessibility ≥ 0.9, best-practices ≥ 0.9, CLS ≤ 0.1. Reports land in `apps/professional-portfolio/.lighthouseci/` (gitignored).

`verify:all` runs Jest with coverage thresholds (`apps/professional-portfolio/jest.config.cjs`: global floor plus per-directory floors for `app/`, `components/`, `features/`, `i18n/`, `services/`, `types/` — raise them when coverage improves, never lower them to pass). It additionally enforces `npm run check:bundle` after the build step — gzip budgets of 150 kB JS / 20 kB CSS plus a delta ratchet against `apps/professional-portfolio/.bundle-baseline.json` (growth > 5 kB fails; intentional growth requires `npm run check:bundle -- --update-baseline` committed in the same PR) — `npm run check:clones` (jscpd copy-paste ratchet over `apps/professional-portfolio/src`, `apps/professional-portfolio/e2e`, `apps/professional-portfolio/scripts/`, `apps/job-tracker/src`, and `scripts/`), `npm run check:case` (git-index vs on-disk filename casing — catches case-only renames that pass on Windows but break Linux CI), and `npm run check:audit` (`npm audit --omit=dev --audit-level=high`, production dependencies only).

ESLint runs `strictTypeChecked` on `apps/professional-portfolio/src` (typed `projectService`), plus `eslint-plugin-sonarjs` cognitive-complexity ≤ 10, `eslint-plugin-check-file` naming conventions (`PascalCase.tsx`, `camelCase.ts`; locale files and `main.tsx` exempt), `eslint-plugin-no-barrel-files`, `eslint-plugin-react-hooks` (`recommended-latest`: rules-of-hooks, exhaustive-deps, and the React Compiler purity/immutability rules), and `eslint-plugin-security` rules (excluding `services/` and specs) to reject XSS sinks like `dangerouslySetInnerHTML` and unsafe regexes. External data (`fetch().json()`, gray-matter frontmatter) must be narrowed with runtime type guards — never `as` casts.

Visual-regression baselines are platform-suffixed (`*-win32.png`, `*-linux.png`) because font rasterization differs per OS, and are only valid in the environment that produced them (Playwright docs, Argos CI, and kanabun all enforce this). Rules:

- **Canonical environments:** win32 baselines are generated locally; linux baselines are generated inside `mcr.microsoft.com/playwright:v1.65.1-noble` — the same image the CI `e2e` job runs in. Never commit baselines from any other environment.
- **Regenerate:** `npm run update:visual-baselines` runs the full ritual — host-platform `--update-snapshots` plus linux regeneration inside `mcr.microsoft.com/playwright:v1.65.1-noble` (`apps/professional-portfolio/scripts/update-visual-baselines.mjs`; `--local-only` skips the container step). Manually: `npx playwright test visual --update-snapshots` locally for win32; for linux, copy the repo (excluding `node_modules`/`dist`/`.git`) into the container, `npm ci --ignore-scripts`, run `npx playwright test visual --update-snapshots`, and copy `apps/professional-portfolio/e2e/visual.spec.ts-snapshots/*.png` back.
- **Update ritual:** baseline changes must land in the same PR as the visual change they approve — review the diff images, don't blanket-update. If a PR touches render-affecting files but the regenerated linux baselines come out byte-identical (pixel-neutral refactor), add a `no-visual-change` token to a commit message instead — `check:visual-baseline` accepts it as explicit sign-off.
- **Scope:** `/projects` is excluded on purpose (GitHub-synced content churns upstream). macOS has no committed baseline and the suite self-skips there.

Prerequisite (one-time per machine): `npx playwright install chromium`. The MemLab and Lighthouse steps reuse the Playwright Chromium binary when present (`apps/professional-portfolio/scripts/playwright-chromium.mjs`).

### CI, hooks, and local gates

- **CI** (`.github/workflows/ci.yml`): `verify:all` on every push/PR, `check:mutate:diff` + `check:visual-baseline` (fails PRs that change render-affecting source without updated linux baselines) on PRs, and a dedicated `e2e` job that runs `npm run test:e2e` + `npm run check:lighthouse` in the Playwright container. Deploys are per-app Vercel projects (Root Directory = `apps/<app>`); there is no Pages deploy job. Each app must declare in its own `package.json` every dependency its build touches (`tsc -b`, `vite`, type packages, test-only imports like `fast-check`) — Vercel installs per-workspace, so root devDependencies are invisible to app builds. Verify with `npm install --workspace <app> && npm run build --workspace <app>` in a clean copy.
- **Pre-commit** (`.husky/pre-commit`): `lint-staged` — oxlint, biome, prettier on staged files (chunked via `lint-staged.config.mjs` to stay under the Windows command-line limit).
- **Pre-push** (`.husky/pre-push`): `npm run verify:push` (types + case check + build + knip + bloat + arch + clones; browser gates stay out of the push path).
- **Gitignored audit artifacts:** `apps/professional-portfolio/.memlab/`, `apps/professional-portfolio/.lighthouseci/`, `apps/professional-portfolio/test-results/`, `apps/professional-portfolio/playwright-report/`, `dist/`.

On-demand gates (too slow/networked for `verify:all`):

- `npm run check:mutate:core` — Stryker mutation score (break < 85, ratchet upward as tests improve) over the pure-logic core (`services/`, `types/`, `i18n/dictionaries.ts`, `app/storage.ts`, `app/routePaths.ts`) with static mutants ignored. Run after touching core logic or periodically.
- `npm run sync:projects:check` — regenerates `content/projects` into a temp dir and diffs against the committed MDX; fails when GitHub-synced content is stale. Requires `GITHUB_USERNAME`/`GITHUB_TOKEN`.

Do not claim a task is complete until `npm run verify:all` exits with code `0`; run `npm run audit:deep` whenever the change touched runtime behavior, routing, styling, or dependencies.

**Commit-path check:** `verify:all` green does NOT prove the change can be committed. After editing files, stage them and run `npx lint-staged` (or attempt the commit itself) and fix any failure — lint-staged lints the staged content, so re-stage after fixing. Never finish a task leaving `git commit` broken (missing `node_modules`, unstaged fixes, hook failures). If a hook failure is environmental (e.g. command-line length), fix the tooling — do not bypass the hook.

## 4. Green-CI Guarantee and Workflow Integrity

- **Every change must merge green.** Before finishing ANY task, verify that the resulting merge will pass CI — not just `verify:all`. If your change touches render-affecting source, update the linux visual baselines in the same change (or use the documented `no-visual-change` marker only when pixels are provably identical). If it touches business logic, confirm `check:mutate:diff` will pass. A local `verify:all` pass is necessary but not always sufficient — check the PR-scoped CI steps (`check:mutate:diff`, `check:visual-baseline`) against the files you changed.
- **Never weaken CI to make it pass.** Do NOT edit `.github/workflows/`, CI scripts, thresholds, baselines, or gate logic to bypass a failure — fix the underlying code instead. The only sanctioned pressure valves are the documented ones (`no-visual-change` commit marker, `--update-baseline` for intentional bundle growth, ratchet comments in Stryker config).
- **Workflow changes require explicit request.** Only modify CI workflows (`.github/workflows/*.yml`) when the user explicitly asks for it. All other gates — scripts, configs, thresholds in repo tooling — may be adjusted when a change legitimately requires it, but never to mask a regression.
