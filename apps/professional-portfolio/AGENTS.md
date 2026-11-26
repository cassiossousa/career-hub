# AGENTS.md — apps/professional-portfolio

App-specific rules for the public portfolio. Every rule in the root `AGENTS.md` still applies — this file adds portfolio-only detail. Humans: see `CONTRIBUTING.md` for setup.

## Layout

- `src/app/` — theme, `routePaths` constants, app-level wiring only. `src/app/storage.ts` is the ONLY module allowed to touch Web Storage (raw access throws when storage is disabled — ESLint `no-restricted-syntax`; `app/storage.spec.ts` is the sole exemption).
- `src/features/<domain>/` — self-contained slices: `home`, `projects`, `resume`, `work-experience`. Never import internals from sibling features — enforced by `src/architecture.spec.ts`.
- `src/components/` — shared presentational components. Must not import from `features/` or `services/` — enforced by `architecture.spec.ts`.
- `src/services/`, `src/i18n/` (dictionaries; `locales/*.ts` exempt from filename convention), `src/types/` — shared infrastructure features may consume.
- `src/test/` — shared test helpers.
- `e2e/` — Playwright specs: `smoke.spec.ts` (routes + WCAG 2.1 AA + keyboard tab order), `resilience.spec.ts` (disabled/invalid `localStorage`, offline navigation, 360px overflow in en + pt-BR), `visual.spec.ts` (pixel regression). Excluded from Jest via `testPathIgnorePatterns`.
- `content/projects/*.mdx` at REPO ROOT — GitHub-synced project content rendered by the portfolio. Regenerate with `npm run sync:projects` (requires `GITHUB_USERNAME`/`GITHUB_TOKEN`); CI-adjacent check `npm run sync:projects:check` fails when the committed MDX is stale.

## Gates that matter here

- **Coverage:** `jest.config.cjs` — a single package-wide `global` floor (same shape as job-tracker and `packages/ui`), not per-directory floors. Raise it when coverage improves; never lower it to pass.
- **Bundle budget:** 150 kB JS / 20 kB CSS gzip via `scripts/audit-bundle-budget.mjs`, plus `.bundle-baseline.json` delta ratchet — growth > 5 kB fails; intentional growth requires `node scripts/audit-bundle-budget.mjs apps/professional-portfolio --update-baseline` committed in the same PR.
- **Architecture:** both `check:arch` (dependency-cruiser, cycles forbidden) and `architecture.spec.ts` (feature isolation + shared-component purity) must stay green.
- **Mutation:** `check:mutate:core` runs Stryker over the pure-logic core (`services/`, `types/`, `i18n/dictionaries.ts`, `app/storage.ts`, `app/routePaths.ts`) with static mutants ignored — break score < 85 fails. `check:mutate:diff` runs on PRs.
- **i18n:** English and pt-BR dictionaries must stay in sync; e2e exercises both locales. Never hard-code user-facing strings.
- **`@/` alias:** `tsconfig` `paths` → `vite-tsconfig-paths` → Jest `moduleNameMapper` — all three must stay in sync. Relative imports deeper than `../../` are banned (use `@/`).

## Visual-regression baselines

Baselines are platform-suffixed (`*-win32.png`, `*-linux.png`) because font rasterization differs per OS, and are only valid in the environment that produced them (Playwright docs, Argos CI, and kanabun all enforce this). Rules:

- **Canonical environments:** win32 baselines are generated locally; linux baselines are generated inside `mcr.microsoft.com/playwright:v1.65.1-noble` — the same image the CI `e2e` job runs in. Never commit baselines from any other environment.
- **Regenerate:** `npm run update:visual-baselines` runs the full ritual — host-platform `--update-snapshots` plus linux regeneration inside the container (`scripts/update-visual-baselines.mjs`; `--local-only` skips the container step). Manually: `npx playwright test visual --update-snapshots` locally for win32; for linux, copy the repo (excluding `node_modules`/`dist`/`.git`) into the container, `npm ci --ignore-scripts`, run `npx playwright test visual --update-snapshots`, and copy `e2e/visual.spec.ts-snapshots/*.png` back.
- **Update ritual:** baseline changes must land in the same PR as the visual change they approve — review the diff images, don't blanket-update. If a PR touches render-affecting files but the regenerated linux baselines come out byte-identical (pixel-neutral refactor), add a `no-visual-change` token to a commit message instead — `check:visual-baseline` accepts it as explicit sign-off.
- **Scope:** `/projects` is excluded on purpose (GitHub-synced content churns upstream). macOS has no committed baseline and the suite self-skips there.

Prerequisite (one-time per machine): `npx playwright install chromium`. The MemLab and Lighthouse steps reuse the Playwright Chromium binary when present (`scripts/playwright-chromium.mjs`).

## `audit:deep` — runtime gate

`npm run audit:deep` (root script → `scripts/audit-runtime.mjs`) layers checks `verify:all` intentionally excludes (they need a browser and a built bundle), aborting on first failure:

1. `npm run check:arch` — dependency-cruiser boundary/cycle check.
2. `npx jest apps/professional-portfolio/src/architecture.spec.ts` — feature-isolation and shared-component purity guardrails.
3. `npx playwright test` — the e2e suite described above.
4. Production-build memory-leak detection via `@memlab/api` (`scripts/memlab-run.mjs` + `scripts/memlab-portfolio.cjs`): builds the app, serves `vite preview` on port 4173, fails on leaked-object clusters. Artifacts in `.memlab/` (gitignored).
5. `npm run check:lighthouse` — Lighthouse CI on the production build (`lighthouserc.json`): performance ≥ 0.75, accessibility ≥ 0.9, best-practices ≥ 0.9, CLS ≤ 0.1. Reports in `.lighthouseci/` (gitignored).

## Bug & regression fixes

- When a bug or regression is provably found, write at least one unit test that proves it (fails on the broken code) and guards the fix, then fix the code — a fix without a failing-first test is incomplete. Same rule as root `AGENTS.md`.

## Deployment

- Deploys as its own Vercel project (Root Directory = `apps/professional-portfolio`). It MUST stay publicly accessible — never add Vercel Deployment Protection, and never commit real `VITE_*` values (dashboard env vars only).
