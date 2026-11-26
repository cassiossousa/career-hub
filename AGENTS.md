# AGENTS.md — Repository Engineering Constitution

You are working in a remediated, strictly typed front-end monorepo. Your goal is to ship small, deterministic, verifiable changes—NEVER large unverified file dumps.

This file is the root constitution: universal rules, commands, and gates. Workspace-specific detail lives in nested `AGENTS.md` files — read the one for the workspace you are touching. Humans: `CONTRIBUTING.md` covers setup and PR conventions.

## Repository map

npm workspaces monorepo (`apps/*`, `packages/*`). Node >= 22.12 (`.nvmrc` = 24, `engines` in `package.json`), npm 11.x (`packageManager` field).

| Path                          | What it is                                                                                           | Workspace rules                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `apps/professional-portfolio` | Public Vite + React portfolio (MUI 9, Emotion, MDX content)                                          | `apps/professional-portfolio/AGENTS.md` |
| `apps/job-tracker`            | Vite + React job tracker (react-query, zod, zustand, MSW)                                            | `apps/job-tracker/AGENTS.md`            |
| `packages/ui`                 | `@career-hub/ui` — private shared component library, raw TS source                                   | `packages/ui/AGENTS.md`                 |
| `scripts/`                    | Cross-workspace gates (case-sensitivity, bundle budget, mutation diff/core, visual-baseline helpers) | —                                       |
| `apps/*/scripts/`             | App-local gates                                                                                      | covered by each app's AGENTS.md         |
| `content/projects/`           | Repo-root MDX synced from GitHub (`npm run sync:projects`)                                           | portfolio AGENTS.md                     |
| `docs/`                       | `tooling-effectiveness.md` — living audit of gate value                                              | —                                       |

## Agent skills

**Skills live in exactly one place: `.agents/skills/<name>/SKILL.md`.** All current skills are there; ALL new skills must be created there. No other directory may store skills — `.devin/` holds only Devin tool config (`config.local.json`), and no new skills folders may be created anywhere else.

**Consult skills at planning start.** Before writing ANY plan or starting ANY task, inventory `.agents/skills/` and load every skill whose description matches the work — at minimum during planning stages, and again before implementing.

| Skill                   | When to load                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clean-frontend-change` | Creating or modifying any front-end feature — enforces vertical slices, small diffs, strict TS, deterministic verification                                                                            |
| `test-falsification`    | Writing or reviewing unit tests — replaces superficial tests with high-signal Jest tests + mutation evidence                                                                                          |
| `ui-ux-guidelines`      | ANY UI/UX change — screens, components, forms, layouts, styling, empty/loading/error states, i18n strings, navigation. Mandatory before implementing; run its §14 pre-ship checklist before finishing |

## Read before you start

| Task                                        | Read first                                      |
| ------------------------------------------- | ----------------------------------------------- |
| Any change in `apps/professional-portfolio` | `apps/professional-portfolio/AGENTS.md`         |
| Any change in `apps/job-tracker`            | `apps/job-tracker/AGENTS.md`                    |
| Any change in `packages/ui`                 | `packages/ui/AGENTS.md`                         |
| UI/UX work anywhere                         | `.agents/skills/ui-ux-guidelines/SKILL.md`      |
| Writing tests                               | `.agents/skills/test-falsification/SKILL.md`    |
| Front-end feature work                      | `.agents/skills/clean-frontend-change/SKILL.md` |
| Wondering if a gate is worth its runtime    | `docs/tooling-effectiveness.md`                 |
| Human setup/PR questions                    | `CONTRIBUTING.md`                               |

## Hard Forbidden Anti-Patterns (Instant Rejection)

- **NO Type Escape Hatches:** Never write `any`, `@ts-ignore`, `@ts-expect-error`, or `as unknown as T`. Narrow unknown data at runtime boundaries.
- **NO `useEffect` Data-Fetching Chains:** Never synchronize derived state or fetch server data inside `useEffect`. Derive state during render or use typed query/server loaders.
- **NO Prop-Drilling Soup:** Components accepting > 6 props must be decomposed or backed by a bounded domain hook/context.
- **NO Ghost Files or Unapproved Dependencies:** Do not install new `npm` packages without explicit approval. Do not leave unused exports, dead helpers, or commented-out code blocks behind.
- **NO Tautological "Test Theater":** Never write snapshot tests or `expect(fn).toHaveBeenCalled()` mocks that pass when core business logic is broken.
- **NO Re-Declared Business Constants in Tests:** Specs and e2e must not copy production constants, patterns, routes, or storage keys — import them from source (`routePaths`, `*_STORAGE_KEY`, `SKILLS_TAG_PATTERN`, …) so tests fail when the rule drifts. Regex/`new RegExp` declarators in `*.spec.*`/`e2e` are rejected by ESLint `no-restricted-syntax`; content validation should exercise the real pipeline (e.g. `getAllEntries` + `mapContentToWorkRoles`), not re-parse files with a private copy of the parser.
- **NO Raw Web Storage:** Never call `localStorage`/`sessionStorage` directly. Use `storageGetItem`/`storageSetItem` from each app's `src/app/storage.ts` (both apps have one — raw access throws when storage is disabled; enforced by ESLint `no-restricted-syntax`). Sole exception: `src/app/storage.spec.ts`, which must touch raw storage to test the disabled-storage failure path (scoped per-file override in `eslint.config.ts`).
- **NO Copy-Paste Sprawl:** Duplicated blocks ≥ 5 lines / 40 tokens fail `npm run check:clones` (jscpd). Extract shared helpers instead.
- **NO Re-Declared Vocabularies:** Every closed string vocabulary (enum-like union of literals) has exactly ONE canonical `as const` array in the domain types module; union types, `z.enum`, option lists, filter-store schemas, and i18n `Record<Enum, …>` maps must derive from it — never redeclare the literal list. Semantic duplication like this is invisible to jscpd and has already shipped a live outage once; enforced by `npm run check:vocab` (AST-based, part of `verify:all`/`verify:push`). Convention: `export const X_VALUES = [...] as const; export type X = (typeof X_VALUES)[number]` (or the contract `Schemas['X']` alias), then `z.enum(X_VALUES)` and `Record<X, string>` everywhere else.
- **NO Unverified Gates:** Every script that acts as a gate, check, verification, or code-improvement tool (`scripts/check-*.mjs`, `scripts/audit-*.mjs`, `apps/*/scripts/*.mjs` wired into `verify:*` or lint-staged) must be **deterministic** — filesystem/git inputs only, no network, no wall-clock or locale dependence, stable output ordering, explicit exit codes — and must carry **automated tests** proving its detection logic: at minimum a pass case AND a falsification case (feed it a known violation fixture and assert it exits non-zero / reports the site). A gate that cannot prove it catches the defect it exists for is test theater — do not wire an untested script into `verify:all`/`verify:push`/lint-staged; land the script and its tests together. **Exempt by category** (non-deterministic deep/manual tooling, must stay OUT of `verify:*`): the `audit:deep` chain (`audit-runtime.mjs`, `memlab-run.mjs`, `lighthouse-run.mjs`), `check-workspace-install.mjs`, `update-visual-baselines.mjs`, and the `run-stryker.mjs` runners. If any exempt script gains a pass/fail mode, that mode must be tested.
- **NO UI/UX CHANGES WITHOUT THE SKILL:** Every UI/UX alteration — screens, components, forms, layouts, styling, empty/loading/error states, i18n strings, navigation — MUST consult `.agents/skills/ui-ux-guidelines/SKILL.md` before implementing and run its §14 pre-ship checklist before finishing. Skill violations are bugs, not taste.
- **NO LIVE-MODE LEAKS:** Never enable job-tracker live data mode (`VITE_DATA_MODE=live`) on a public deployment — its `VITE_API_KEY` is inlined in the bundle. Details in `apps/job-tracker/AGENTS.md`. Never commit real `VITE_*` values.

## Universal conventions

**Monorepo-wide rule:** every configuration, guideline, and lint-/test-style rule that applies to one workspace applies to ALL of them (`apps/*`, `packages/*`). `packages/ui` (@career-hub/ui) is verified exactly like the apps: `tsc -b` project reference, ESLint `strictTypeChecked` + a11y/jsx rules, its own Jest project (`packages/ui/jest.config.cjs`, run via `npm run test[:cov] --workspace @career-hub/ui` and inside `verify:all`) whose coverage is collected only over `components/` (the sole spec-discovered directory) behind a single package-wide `global` floor — raise it as coverage improves, never lower it to pass, jscpd clone scanning, knip dead-code analysis, and the same lint-staged/prettier/oxlint/biome fast gates. Each workspace declares in its own `package.json` every dependency its build or tests touch — but reuse, don't duplicate: pin the SAME version already used by sibling workspaces or root `devDependencies`, and do NOT redeclare root-provided test tooling (`jest`, `ts-jest`, `jest-environment-jsdom`) in a workspace that only consumes it via `npm run test --workspace` (binaries resolve from the root `node_modules/.bin`; `apps/professional-portfolio` is the lean precedent — it declares only the `@testing-library/*`/`@types/*` imports its specs reference, and knip enforces that boundary). Declare a runner dep only when the workspace needs a divergent version. Any new workspace or shared rule must be plugged into the same gates — never verify a package only "where it is used". Workspace deps on `@career-hub/ui` are pinned to its exact version (`0.0.1`), not `*`.

ESLint runs `strictTypeChecked` on `apps/*/src` and `packages/ui` (typed `projectService`), plus `eslint-plugin-sonarjs` cognitive-complexity ≤ 10, `eslint-plugin-check-file` naming conventions (`PascalCase.tsx`, `camelCase.ts`; locale files and `main.tsx` exempt), `eslint-plugin-no-barrel-files` (`packages/ui/**/index.ts` exempt — exports map points at barrels), `eslint-plugin-react-hooks` (`recommended-latest`: rules-of-hooks, exhaustive-deps, and the React Compiler purity/immutability rules), `eslint-plugin-security` rules (excluding `services/` and specs) to reject XSS sinks like `dangerouslySetInnerHTML` and unsafe regexes, `eslint-plugin-regexp` (ReDoS/backtracking analysis), `eslint-plugin-new-with-error`, `eslint-plugin-no-relative-import-paths` (relative imports deeper than `../../` are banned — use the `@/` alias), `eslint-plugin-jest` on specs/test helpers (including `expect-expect` with an explicit `assertFunctionNames` list — add new assertion helpers there), and `eslint-plugin-playwright` on `e2e/` + `playwright.config.ts`. Every plugin is registered once in a global `plugins` block at the top of `eslint.config.ts` so `<plugin>/*` disable directives resolve in any file — scope rules via `files`/`ignores` only, and never re-declare `plugins` in a scoped block (flat config rejects plugin redefinition). External data (`fetch().json()`, gray-matter frontmatter) must be narrowed with runtime type guards — never `as` casts.

App source imports use the `@/` alias per app (`tsconfig` `paths` → `vite-tsconfig-paths` → Jest `moduleNameMapper` — all three must stay in sync). `tsc` runs `noUnusedLocals`/`noUnusedParameters` in both apps; job-tracker and packages/ui additionally enforce `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (portfolio alignment is pending — see `docs/tooling-effectiveness.md`).

## Definition of Done

Default to targeted local checks; CI is the authoritative full gate.

Before finishing ANY task:

1. Stage the files you changed and run `npx lint-staged`; fix failures and re-stage.
2. Run the narrowest checks that cover the change:
   - TS/TSX: `npm run check:types` plus the related Jest specs (`npx jest --config <app>/jest.config.cjs --runInBand <spec paths>`).
   - UI/styling/i18n: check the affected routes at desktop and 360px when a dev/preview server is already running; update visual baselines only when those routes' pixels change (see the app's AGENTS.md).
   - Business logic/services/types: keep focused Jest coverage and run `npm run check:mutate:diff` when touching mutation-covered logic.
3. Do NOT run `verify:all` or `audit:deep` for routine small changes — CI runs them on every push/PR. Run them manually only for broad refactors, dependency/build-system changes, or explicit user request.

### Gate tiers

| Tier        | Command                                                                                                                                       | When                                                                                                                                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pre-commit  | `npx lint-staged` (via `.husky/pre-commit`)                                                                                                   | Every commit — oxlint, biome, prettier autofix on staged files only (chunked via `lint-staged.config.mjs` for the Windows command-line limit). Typed ESLint deliberately excluded (~30s); enforced by `npm run lint`/CI                                      |
| Pre-push    | `.husky/pre-push` → `npm run verify:push` (fast/format/type/typed-lint/case/API-mocks/static/build/bundle; no Jest coverage or network audit) | Every push. `verify:all` remains the authoritative full gate                                                                                                                                                                                                 |
| CI          | `verify:all` + PR-scoped `check:mutate:diff`/`check:visual-baseline` + `e2e` job                                                              | Every push/PR — the authoritative merge gate                                                                                                                                                                                                                 |
| Manual deep | `npm run audit:deep`                                                                                                                          | High-risk changes only — layers runtime checks `verify:all` excludes (browser, built bundle): portfolio arch spec → Playwright smoke/WCAG/resilience/visual → memlab leak detection → Lighthouse budgets. Details in `apps/professional-portfolio/AGENTS.md` |

`verify:all` runs Jest with coverage thresholds — every workspace uses a single package-wide `global` floor in its `jest.config.cjs` (`apps/job-tracker`, `apps/professional-portfolio`, `packages/ui`; raise them when coverage improves, never lower them to pass). It additionally enforces `npm run check:bundle` after the build step — per-app gzip budgets via `scripts/audit-bundle-budget.mjs` (professional-portfolio 150 kB JS / 20 kB CSS, job-tracker 400 kB JS / 20 kB CSS) plus a delta ratchet against each app's `.bundle-baseline.json` (growth > 5 kB fails; intentional growth requires `node scripts/audit-bundle-budget.mjs <appDir> --update-baseline` committed in the same PR) — `npm run check:clones` (jscpd copy-paste ratchet over `apps/professional-portfolio/src`, `apps/professional-portfolio/e2e`, `apps/professional-portfolio/scripts/`, `apps/job-tracker/src`, `apps/job-tracker/e2e`, `packages/ui`, and `scripts/`), `npm run check:case` (git-index vs on-disk filename casing — catches case-only renames that pass on Windows but break Linux CI), `npm run check:api-mocks` (`apps/job-tracker/scripts/check-api-mocks.mjs` — every `apiClient` call site in job-tracker must have a matching MSW handler in `src/mocks/`; dynamic URLs fail the gate), and `npm run check:audit` (`npm audit --omit=dev --audit-level=high`, production dependencies only).

On-demand gates (too slow/networked for `verify:all`):

- `npm run check:mutate:core` — Stryker mutation score (break < 85 for portfolio core, ratchet upward as tests improve; job-tracker baseline pending; packages/ui baseline 53.80 → break 50, ratchet upward) over each workspace's pure-logic core (`services/`, `types/`, plus app-specific modules like `i18n/dictionaries.ts`, `app/storage.ts`, `app/routePaths.ts`; packages/ui scopes to `components/` — its only tested surface) with static mutants ignored. Runs for ALL workspaces via `scripts/check-mutation-*.mjs` + the `scripts/mutation-targets.mjs` registry. Run after touching core logic or periodically.
- `npm run sync:projects:check` — regenerates `content/projects` into a temp dir and diffs against the committed MDX; fails when GitHub-synced content is stale. Requires `GITHUB_USERNAME`/`GITHUB_TOKEN`.

Prerequisite (one-time per machine): `npx playwright install chromium`. The MemLab and Lighthouse steps reuse the Playwright Chromium binary when present (`apps/professional-portfolio/scripts/playwright-chromium.mjs`).

## CI, hooks, and platform notes

- **CI** (`.github/workflows/ci.yml`): `verify:all` on every push/PR, `check:mutate:diff` + `check:visual-baseline` (fails PRs that change render-affecting source without updated linux baselines) on PRs, and a dedicated `e2e` job that runs `npm run test:e2e` + `npm run check:lighthouse` in the Playwright container (`mcr.microsoft.com/playwright:v1.65.1-noble`). Deploys are per-app Vercel projects (Root Directory = `apps/<app>`) via Vercel Git auto-deploys on `main` (each app's `vercel.json` disables them only for `dependabot/**`). On green `main` CI runs, `npm run package:vercel` also builds Vercel Build Output API v3 artifacts (`apps/<app>/.vercel/output`) uploaded as `vercel-output-*` artifacts (1-day retention) for optional manual `vercel deploy --prebuilt` use. There is no Pages deploy job. Each app must declare in its own `package.json` every dependency its build touches (`tsc -b`, `vite`, type packages, test-only imports like `fast-check`) — Vercel installs per-workspace, so root devDependencies are invisible to app builds. Verify with `npm install --workspace <app> && npm run build --workspace <app>` in a clean copy.
- **Deployment protection is asymmetric:** `apps/job-tracker` prod builds default to DEMO mode — MSW serves fabricated data and a catch-all handler fails any unmocked `/api/*` request, so the real API is unreachable even if `VITE_API_URL`/`VITE_API_KEY` are set. Live mode is opt-in only (`VITE_DATA_MODE=live` + both credentials) and its `VITE_API_KEY` is inlined in the public bundle — it is only safe behind Vercel Deployment Protection → Vercel Authentication → **All Deployments**. NEVER enable live mode on a public deployment; the public portfolio demo must stay in demo mode. `apps/professional-portfolio` must stay publicly accessible. Never add protection to the portfolio, and never commit real `VITE_*` values (dashboard env vars only). Mechanism details: `apps/job-tracker/AGENTS.md`.
- **Gitignored audit artifacts:** `apps/professional-portfolio/.memlab/`, `apps/professional-portfolio/.lighthouseci/`, `apps/professional-portfolio/test-results/`, `apps/professional-portfolio/playwright-report/`, `dist/`.

Do not claim a task is complete until the targeted checks above pass and `npx lint-staged` is clean; CI `verify:all`/`audit:deep` remains the merge gate.

**Commit-path check:** targeted checks green do NOT prove the change can be committed. After editing files, stage them and run `npx lint-staged` (or attempt the commit itself) and fix any failure — lint-staged lints the staged content, so re-stage after fixing. Never finish a task leaving `git commit` broken (missing `node_modules`, unstaged fixes, hook failures). If a hook failure is environmental (e.g. command-line length), fix the tooling — do not bypass the hook.

## Boundaries

**Always do:**

- Ship the smallest correct change; add a failing test before fixing a bug when test infrastructure exists.
- Route every plan through the skills table above before writing it.
- Extend existing gates when adding a workspace, rule, or shared pattern — never verify something only "where it is used".
- Update the relevant nested `AGENTS.md` when workspace conventions change.

**Ask first:**

- Installing any new `npm` dependency.
- Changing CI workflows, thresholds, baselines, or gate logic.
- Weakening or removing any lint rule, coverage floor, or forbidden-pattern check.
- Aligning portfolio tsconfig strictness flags (`noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`) — tracked in `docs/tooling-effectiveness.md`.

**Never do:**

- Type escape hatches, raw Web Storage, unapproved dependencies, test theater, copy-paste sprawl, live-mode leaks (full list above).
- Weaken CI to make it pass — see below.
- Create skills outside `.agents/skills/` or skip skill consultation at planning start.
- Bypass hooks (`HUSKY=0`, `--no-verify`) except documented emergencies.

## Green-CI Guarantee and Workflow Integrity

- **Every change must merge green.** CI `verify:all`, the PR-scoped mutation/visual-baseline checks, and the `e2e` job are the authoritative gates. For routine changes, targeted local checks plus pre-commit/pre-push hooks are enough; run `verify:all`/`audit:deep` locally only for broad or high-risk changes. If your change touches render-affecting source, update the linux visual baselines in the same change (or use the documented `no-visual-change` marker only when pixels are provably identical). If it touches business logic, confirm `check:mutate:diff` will pass.
- **Never weaken CI to make it pass.** Do NOT edit `.github/workflows/`, CI scripts, thresholds, baselines, or gate logic to bypass a failure — fix the underlying code instead. The only sanctioned pressure valves are the documented ones (`no-visual-change` commit marker, `--update-baseline` for intentional bundle growth, ratchet comments in Stryker config).
- **Workflow changes require explicit request.** Only modify CI workflows (`.github/workflows/*.yml`) when the user explicitly asks for it. All other gates — scripts, configs, thresholds in repo tooling — may be adjusted when a change legitimately requires it, but never to mask a regression.

## Maintaining this file

This file is living documentation. Keep the ROOT lean: universal rules, commands, gate tiers, and pointers. Workspace detail belongs in that workspace's nested `AGENTS.md`; rationale for gate changes belongs in `docs/tooling-effectiveness.md`; human-facing workflow belongs in `CONTRIBUTING.md`; reusable procedures belong in `.agents/skills/`. When a rule moves or a gate changes, update the file that owns it — never let the same rule live in two places with different wording.
