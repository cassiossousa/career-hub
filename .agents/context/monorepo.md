---
area: monorepo
paths: package.json scripts/ .github/ content/ docs/ .agents/ .devin/
last-reviewed: cc53ac3b6ee8ee365566700fe038566e92ab3dd4
---

# Monorepo root

## What this is

npm workspaces (`apps/*`, `packages/*`), Node >= 22.12 (`.nvmrc` = 24), npm 11.x (`packageManager` field). Root `package.json` scripts orchestrate every gate; each workspace declares only the deps its own build/tests touch. The sibling repo `job-tracker-api` is the backend — the frontends consume its committed `openapi.json` via codegen (job-tracker) or hand-typed fetches (portfolio).

## Gate tiers (order matters)

- **Pre-commit** `.husky/pre-commit` → `npx lint-staged`: oxlint + biome + prettier --write + secretlint on staged files, chunked for Windows cmd limits. Typed ESLint deliberately excluded (~30s) — enforced by `npm run lint`/CI.
- **Pre-push** `.husky/pre-push` → `npm run verify:push`: fast/format/type/typed-lint/case/API-mocks/static/build/bundle. No Jest coverage, no network audit.
- **CI** (`.github/workflows/ci.yml`): `verify:all` on every push/PR + PR-scoped `check:mutate:diff`/`check:visual-baseline` + dedicated `e2e` job (Playwright container `mcr.microsoft.com/playwright:v1.65.1-noble`). On green `main` runs, `npm run package:vercel` emits Vercel Build Output API artifacts.
- **Manual deep** `npm run audit:deep` → `scripts/audit-runtime.mjs`: portfolio-only runtime checks (arch spec → Playwright smoke/WCAG/resilience/visual → memlab leak check → Lighthouse budgets).

`verify:all` additionally enforces `check:bundle` (gzip budgets + `.bundle-baseline.json` delta ratchet), `check:clones` (jscpd), `check:case` (git-index vs disk casing), `check:api-mocks`, `check:audit` (prod deps), and per-workspace Jest coverage behind single package-wide `global` floors.

## Cross-workspace rules worth remembering

- `@/` alias must stay in sync three ways per app: tsconfig `paths` → `vite-tsconfig-paths` → Jest `moduleNameMapper`.
- Workspace deps on `@career-hub/ui` pin exact `0.0.1`; root-provided test tooling (jest, ts-jest, jest-environment-jsdom) is NOT redeclared in workspaces.
- jscpd scans `apps/*/src`, `apps/*/e2e`, `apps/*/scripts`, `packages/ui`, and `scripts/` — duplicated blocks ≥5 lines/40 tokens fail `check:clones`.
- Every closed string vocabulary has ONE canonical `as const` array (`check:vocab`, AST-based) — unions, zod enums, option lists, i18n Records all derive from it.
- Raw `localStorage`/`sessionStorage` is banned outside each app's `src/app/storage.ts` (ESLint `no-restricted-syntax`).
- External data (`fetch().json()`, frontmatter) must be narrowed with runtime type guards — never `as` casts.

## Content & deploy topology

- `content/projects/*.mdx` at repo root is synced from GitHub (`npm run sync:projects`, needs `GITHUB_USERNAME`/`GITHUB_TOKEN`); `sync:projects:check` fails CI-adjacent when stale. Rendered only by the portfolio.
- Deploys are per-app Vercel projects (Root Directory = `apps/<app>`), auto-deploy on `main`. `package:vercel` builds `.vercel/output` artifacts for manual `vercel deploy --prebuilt`.
- Protection is asymmetric: portfolio MUST stay public; job-tracker prod defaults to MSW demo mode and live mode is only safe behind Vercel Authentication on ALL deployments.

## Agent tooling (.agents/, .devin/)

- Skills: `.agents/skills/<name>/SKILL.md` (only place skills may live). Current: `clean-frontend-change`, `test-falsification`, `ui-ux-guidelines`, `multi-part-change` (mirrored byte-identically in job-tracker-api — edit both copies together), `context-scout`.
- Subagent profiles: `.agents/agents/<name>.md`; `name:` frontmatter sets the profile id (files may be uppercase, e.g. `SCOUT.md` → id `scout`).
- Context store: `.agents/context/` — see `index.md`. `.runtime/` inside it is gitignored session state.
- Hooks: `.devin/hooks.v1.json` registers `scripts/context-hook.mjs` for SessionStart/PostCompaction/UserPromptSubmit/PostToolUse/Stop/SessionEnd. A global dispatcher at `%APPDATA%/devin/hooks/context-hook.mjs` (registered in `%APPDATA%/devin/config.json`) delegates to the repo script with `DEVIN_CONTEXT_HOOK=global`; the repo script self-disables when it detects the global config, preventing double injection. Hook scripts must stay silent-and-fast: any failure exits 0.
- `.devin/config.local.json` is gitignored local permission allow-lists — never commit real secrets there either.

## Pointers

- `docs/tooling-effectiveness.md` — living audit of whether each gate earns its runtime.
- `CONTRIBUTING.md` — human setup/PR conventions.
- Rationale for gates lives in the app AGENTS.md files and this audit doc — don't duplicate it here.
