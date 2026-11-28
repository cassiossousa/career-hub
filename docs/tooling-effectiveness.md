# Tooling Effectiveness Audit — 2026-11-23 (passes 2026-11-26, 2026-11-28)

Point-in-time audit of every lint/test/CI gate in this repo and the verdict for
each tool in the two 300-item evaluation catalogs. Durable rules live in
`AGENTS.md`; this file records _evidence_ — what each gate actually catches,
how often it fires, and whether it overlaps another gate.

## 1. Installed gates — what they actually do

| Gate                                           | Config                                                                        | What it enforces                                                                                                                            | Evidence of value                                                                                                                                                                                                                                                         | Verdict                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| oxlint + Biome (`check:fast`)                  | root `package.json`, `biome.json`                                             | correctness/suspicious lint, formatting, import sorting                                                                                     | runs on every commit via lint-staged; sub-second                                                                                                                                                                                                                          | **keep** — but note overlap with Prettier (see below)                                                |
| ESLint `strictTypeChecked`                     | `eslint.config.ts`                                                            | typed rules on `apps/*/src`, `packages/ui`                                                                                                  | catches type-unsafe patterns oxlint can't see                                                                                                                                                                                                                             | **keep**                                                                                             |
| `sonarjs/cognitive-complexity` ≤ 10            | `eslint.config.ts`                                                            | complexity brake on AI-generated nesting                                                                                                    | 0 suppressions repo-wide                                                                                                                                                                                                                                                  | **keep**                                                                                             |
| `@eslint-react` recommended-type-checked       | `eslint.config.ts`                                                            | React purity/immutability/compiler diagnostics                                                                                              | covers React Compiler lint rules without the runtime compiler                                                                                                                                                                                                             | **keep**                                                                                             |
| `eslint-plugin-react-hooks` recommended-latest | `eslint.config.ts`                                                            | rules-of-hooks + compiler-aware diagnostics                                                                                                 | same                                                                                                                                                                                                                                                                      | **keep**                                                                                             |
| `react-you-might-not-need-an-effect`           | `eslint.config.ts`                                                            | bans derived-state `useEffect`                                                                                                              | directly enforces AGENTS §2                                                                                                                                                                                                                                               | **keep**                                                                                             |
| `eslint-plugin-jsx-a11y`                       | `eslint.config.ts`                                                            | a11y JSX rules                                                                                                                              | complements axe e2e audits                                                                                                                                                                                                                                                | **keep**                                                                                             |
| `eslint-plugin-security`                       | `eslint.config.ts` (app src, excl. services/specs)                            | XSS sinks, unsafe regex, object injection                                                                                                   | 1 warning currently (`detect-non-literal-regexp` in a spec)                                                                                                                                                                                                               | **keep**                                                                                             |
| `check-file` + `no-barrel-files`               | `eslint.config.ts`                                                            | naming conventions, no barrels in app src                                                                                                   | enforces slice architecture mechanically                                                                                                                                                                                                                                  | **keep**                                                                                             |
| raw Web Storage ban                            | `no-restricted-syntax` in `eslint.config.ts`                                  | `localStorage`/`sessionStorage` only via `app/storage.ts`                                                                                   | 1 scoped spec override (documented)                                                                                                                                                                                                                                       | **keep**                                                                                             |
| `dependency-cruiser` (`check:arch`)            | per-app `.dependency-cruiser.cjs`                                             | **only circular deps** — the rich layer rules live in `architecture.spec.ts` (Jest)                                                         | boundary enforcement actually happens in the Jest spec, not depcruise                                                                                                                                                                                                     | **keep+tune** — consider moving boundary rules into depcruise config or accept spec as the real gate |
| `architecture.spec.ts` (Jest)                  | per app                                                                       | feature isolation, shared-component purity                                                                                                  | the real boundary gate                                                                                                                                                                                                                                                    | **keep**                                                                                             |
| `jscpd` (`check:clones`)                       | root script                                                                   | ≥5-line/40-token duplication across src+e2e+scripts                                                                                         | ratchet; no baseline file — hard fail on any clone                                                                                                                                                                                                                        | **keep**                                                                                             |
| `check:vocab`                                  | `scripts/check-vocab.mjs`                                                     | closed string vocabularies (union types, `as const` arrays, `z.enum` literals) declared in >1 form per workspace                            | **real finding:** caught the `JobLevel` vocabulary declared 4× (union + const + zod + i18n map); a backend `"unknown"` value broke live parsing                                                                                                                           | **keep** — added 2026-11-24 after a live outage; AST-based, complements jscpd's textual-only view    |
| `knip` (`check:dead`)                          | `knip.json`                                                                   | unused exports/deps/files                                                                                                                   | catches dead helpers AI leaves behind                                                                                                                                                                                                                                     | **keep**                                                                                             |
| bundle budgets + delta ratchet                 | `scripts/audit-bundle-budget.mjs`                                             | per-app gzip JS/CSS budgets + >5 kB growth fails                                                                                            | 150 kB portfolio / 400 kB job-tracker                                                                                                                                                                                                                                     | **keep** — this is the real "no bloat" gate                                                          |
| `check:case`                                   | `scripts/check-case-sensitivity.mjs`                                          | filename casing vs git index                                                                                                                | prevents Windows→Linux CI breaks                                                                                                                                                                                                                                          | **keep** (cheap, real bug class)                                                                     |
| Jest coverage floors                           | per-app `jest.config.cjs`                                                     | portfolio per-dir thresholds (app 95%, features 90%…), job-tracker global 80%                                                               | enforced in `verify:all`                                                                                                                                                                                                                                                  | **keep**                                                                                             |
| Stryker mutation (`check:mutate:*`)            | `stryker*.config.mjs` per workspace + `scripts/mutation-targets.mjs` registry | kills surviving mutants in changed files (diff) + core globs                                                                                | all workspaces (packages/ui scoped to `components/`); job-tracker diff baseline 83.15 (break 60) on 2026-11-23; packages/ui core baseline 53.80 (break 50) on 2026-11-24 — first run exposed that the 5s default `timeoutMS` faked a 98.37 score via mass mutant timeouts | **keep**                                                                                             |
| Playwright e2e + axe + visual regression       | `e2e/`, `playwright.config.ts`                                                | smoke, WCAG 2.1 AA, fault injection, pixel diffs (platform-suffixed baselines)                                                              | real-browser gate CI runs in the pinned Playwright container                                                                                                                                                                                                              | **keep** — strongest gate in the repo                                                                |
| Lighthouse CI                                  | `lighthouserc.json`                                                           | perf ≥0.75, a11y ≥0.9, BP ≥0.9, CLS ≤0.1                                                                                                    | production-build assertions                                                                                                                                                                                                                                               | **keep**                                                                                             |
| MemLab (`audit:deep`)                          | `scripts/memlab-*.mjs`                                                        | leaked-object clusters on production bundle                                                                                                 | manual deep gate only                                                                                                                                                                                                                                                     | **keep** (on-demand)                                                                                 |
| `npm audit` (`check:audit`)                    | root script                                                                   | prod-dep vulnerabilities ≥high                                                                                                              | in `verify:all`                                                                                                                                                                                                                                                           | **keep**                                                                                             |
| Husky + lint-staged                            | `.husky/`, `lint-staged.config.mjs`                                           | oxlint+biome+prettier on staged files, chunked for Windows                                                                                  | typed ESLint deliberately excluded (30 s cost) — documented trade-off                                                                                                                                                                                                     | **keep**                                                                                             |
| `tsc -b` strict                                | per-app `tsconfig.json`                                                       | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (job-tracker only), `noUnusedLocals/Parameters` (both, added 2026-11-23) | **drift found:** portfolio lacks the two index/optional flags — 36 errors if enabled; deferred to a dedicated pass                                                                                                                                                        | **keep+tune**                                                                                        |

## 2. Overlaps and redundancies found

- **Biome formatter + Prettier both run in `verify:all`** (`check:fast` →
  `biome check`, then `prettier:check`). They mostly agree, so this is
  belt-and-suspenders rather than conflict — but it doubles format CI time.
  Candidate for consolidation (drop Biome's formatter, keep lint+assist, or
  vice versa) — **deferred**, low urgency.
- **`@/` Jest `moduleNameMapper` existed in both apps with zero `@/` imports** —
  dead config until the alias codemod (2026-11-23).
- **depcruise configs only forbid circular deps** — the actual architectural
  boundaries are enforced by `architecture.spec.ts`. Either enrich the
  depcruise configs or accept the spec as the boundary gate.
- **jest version drift:** `jest@29.7.0` + `jest-environment-jsdom@30.3.0` +
  `@types/jest@30` — works, but majors disagree; `syncpack` would catch this
  class (evaluated, not adopted yet).

## 3. New gates added 2026-11-23

| Addition                                                | Covers catalog items                                             | First-run findings                                                                                                                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-jest` (flat/recommended + curated rules) | test-theater enforcement                                         | caught ~10 genuinely assertion-free tests; fixed by adding real assertions or registering assertion helpers in `assertFunctionNames`                                                                                                  |
| `eslint-plugin-playwright` (flat/recommended)           | e2e anti-patterns                                                | 5 warnings (conditionals in e2e, intentional `.skip()` for macOS baseline absence) — warnings only, no errors                                                                                                                         |
| `eslint-plugin-regexp` (flat/recommended)               | ReDoS/regex hygiene                                              | **real finding:** `SKILLS_TAG_PATTERN` `/<!--\s*skills:\s*(.+?)\s*-->/` had polynomial-backtracking potential in `workModel.ts` + 2 specs — rewritten to `/<!--\s*skills:(.+?)-->/`; 4 unused capturing groups → non-capturing        |
| `eslint-plugin-no-relative-import-paths`                | `../../../` sprawl                                               | 10 deep imports in portfolio `features/resume` → rewritten to `@/`                                                                                                                                                                    |
| `@/` aliases                                            | tsconfig `paths` + `vite-tsconfig-paths` + existing jest mappers | both apps' jest configs already mapped `^@/` (dead until now)                                                                                                                                                                         |
| `eslint-plugin-new-with-error`                          | `Error()` without `new`                                          | 0 violations                                                                                                                                                                                                                          |
| Stryker for job-tracker                                 | mutation gap                                                     | first diff run: 83.15 ≥ break 60 (91 mutants, 6 survived — mostly storage-key literals and `??` defaults in `filterStore`/`uiStore`); required jest sandbox fixes (`**/src/**` testMatch, workspace-root-anchored `moduleNameMapper`) |
| Dependabot                                              | supply-chain PRs                                                 | weekly npm + github-actions, grouped minor/patch                                                                                                                                                                                      |
| `noUnusedLocals`/`noUnusedParameters`                   | dead code at compile time                                        | 0 violations on enable                                                                                                                                                                                                                |

## 4. Catalog verdicts (300 items, grouped)

**Already covered — no action:** sonarjs, depcruise, Biome, oxlint, Vite,
React Compiler _diagnostics_ (via react-hooks recommended-latest),
react-you-might-not-need-an-effect, @eslint-react≈eslint-plugin-react,
Zustand/TanStack Query (chosen state libs), Intl, Playwright, Testing
Library, MSW, Stryker, Jest coverage, eslint-plugin-security, Husky,
lint-staged, strict tsc, GH Actions, custom i18n (covers i18next/FormatJS),
custom typed boundaries (covers tRPC/GraphQL-codegen need), no-barrel-files,
check-file naming, fast-check (property testing), axe-core, MDX, AGENTS.md
(= item #175), npm audit.

**Adopted 2026-11-23:** eslint-plugin-jest, eslint-plugin-playwright,
eslint-plugin-regexp, eslint-plugin-no-relative-import-paths,
eslint-plugin-new-with-error, vite-tsconfig-paths, `@/` aliases,
noUnusedLocals/Parameters, Stryker job-tracker, Dependabot, .editorconfig.

**No value for this repo:** unicorn/perfectionist/simple-import-sort/
unused-imports/functional/immutable/no-loops/promise/array-func/yoda/
prefer-arrow (overlap sonarjs+strictTypeChecked+Biome+knip);
SonarQube/SonarCloud; eslint-plugin-depend/n/vitest-globals/storybook/
tsdoc/jsdoc/deprecate; all alternate bundlers/package managers/test
runners (Vite+oxlint+Biome+Jest optimal); tsd/expect-type/ts-pattern/io-ts
(zod+strict TS); Tailwind/Vanilla-Extract/Panda/CSS-Modules/Sass/Base-UI
(MUI+Emotion stays); ky/ofetch/Immer/RxJS/urql/TanStack-Router
(TanStack Query+axios+React Router cover); Cypress/WebdriverIO/Puppeteer/
nock/Sinon/Loki/Reg-suit/Argos/Storybook-\*/Vitest-UI (Playwright+MSW+
visual.spec+fast-check cover); k6 (API repo's `load.yml` covers);
observability SaaS (Sentry/Datadog/NewRelic/OTel/LogRocket/etc. — none
justified for a portfolio+internal tracker today); pnpm/Turborepo/Lerna/
Yarn/semantic-release/pkg-pr-new/publint (npm workspaces, private
packages, Vercel per-app); webpack/Parcel/Babel-pipeline/Rollup-direct/
lightningcss/terser/unplugin/plugin-react-swc (Vite internals);
MUI-X; Docusaurus/VitePress/TypeDoc/Swagger-UI/Redoc/git-cliff (AGENTS.md

- MDX content serve the docs role); Docker/Compose for FE; alternate
  cloud hosts (Vercel); feature-flag platforms; backend items (API repo's
  domain); release-safety infra items (Vercel immutable deploys + instant
  rollback cover the SPA case).

**Deferred with trigger:** React Compiler runtime (needs React 19/babel —
lint diagnostics already active); Storybook/Chromatic (Playwright
visual.spec renders every route — revisit at component-library scale);
RHF+resolvers (zod covers API boundary — revisit if form count grows);
TanStack Table/Virtual (revisit on table perf pain); Sentry (job-tracker
prod error visibility later); Codecov/Coveralls (PR coverage comments —
needs hosted account decision); CSP headers (needs careful Vite SPA
rollout); portfolio `noUncheckedIndexedAccess`+`exactOptionalPropertyTypes`
(36 errors — dedicated pass); verbatimModuleSyntax (churn untested).

**Evaluated and rejected:** `syncpack` — `npx syncpack lint` flags only
convention false-positives (`@career-hub/ui: "*"` workspace specifiers,
peer-range vs pinned mismatches, unparseable `overrides` object) and does
not catch the intra-file `jest@29`/`jest-environment-jsdom@30` drift it
was adopted to find. `commitlint` — history is already conventional-style.
`gitleaks` CI step — no secrets scanner today, but requires a workflow
change (AGENTS §4 explicit-request rule); revisit if wanted. `eslint_d`,
`dpdm`, `perfectionist`, `simple-import-sort`, `eslint-plugin-unicorn` —
redundant with oxlint+Biome+dependency-cruiser already in the fast path.

## 5. Second catalog pass — 2026-11-26 (210 items)

A third-party 210-item tooling catalog was dispositioned against this file's
prior verdicts plus a fresh repo audit. ~75% repeated already-covered or
previously-rejected items. User decision: **no new npm dependencies** — all
adoptions use existing deps, custom `.mjs` gates, or specs.

### Adopted / implemented 2026-11-26

| Addition                                                                   | Covers                                                                                      | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check:env` (`scripts/check-env-vars.mjs`)                                 | env-var documentation drift, undocumented `VITE_*` reads                                    | AST-scans `import.meta.env`/`process.env`/`fileEnv` + `vite-env.d.ts` vs `.env.example` (both directions), per app; `--root` flag for fixtures. **First run caught 4 real doc gaps** (`VITE_MOCK_API`, `GITHUB_USERNAME`, `GITHUB_TOKEN`, `VITE_BASE_PATH`) — all documented. Spec: `src/test/checkEnvVars.spec.ts` (pass + 3 falsification cases). Wired into `verify:all`/`verify:push`.                                                                                   |
| `check:mock-contract` (`apps/job-tracker/scripts/check-mock-contract.mjs`) | MSW handler ↔ OpenAPI drift                                                                 | Every `http.<method>('<path>')` in `src/mocks/` must match a `contract/openapi.json` route (OpenAPI `{param}` ≡ MSW `:param`/`*`). 50 handlers verified. Spec: `checkMockContract.spec.ts`. Wired into `verify:all`/`verify:push`.                                                                                                                                                                                                                                           |
| Falsification-spec backfill                                                | repo rule: every gate proves it catches defects                                             | New specs: `checkApiMocks.spec.ts` (uncovered route, dynamic URL, empty scan), `auditBundleBudget.spec.ts` (budget exceed, >5 kB baseline delta), `packageVercel.spec.ts` (Build Output API v3 layout, double SPA fallback, malformed rewrite, missing vercel.json). `check-workspace-install.mjs` stays exempt per AGENTS §2 category (non-deterministic install simulation). `check-api-mocks`/`package-vercel` gained `--app-root`/`--root` fixture flags to enable this. |
| MSW fault-injection specs                                                  | React Query error/retry UI was only tested on happy path + 404/409                          | `client.spec.ts`, `JobList.spec.tsx`, `ManualJobForm.spec.tsx` now cover 500, 429, network error, malformed JSON, and delayed responses via `server.use()` overrides.                                                                                                                                                                                                                                                                                                        |
| i18n interpolation parity                                                  | `{placeholder}` token drift across locales (key parity already gated)                       | `dictionaries.spec.ts` in both apps asserts placeholder-token sets match per key across en/pt-BR.                                                                                                                                                                                                                                                                                                                                                                            |
| Zustand persist corruption specs                                           | corrupted JSON / version-mismatch / quota-exceeded paths                                    | `persistedState.spec.ts` + `storage.spec.ts` (job-tracker) cover corrupt payloads, schema drift, `QuotaExceededError`, disabled storage.                                                                                                                                                                                                                                                                                                                                     |
| Job-tracker e2e: history/deep-link/quota                                   | `useUrlSyncedFilters` had no back/forward, reload, or direct-URL coverage                   | `e2e/navigation.spec.ts` + `e2e/resilience.spec.ts`: back/forward restores filter state, reload preserves deep-linked filters, storage-quota degradation.                                                                                                                                                                                                                                                                                                                    |
| Portfolio deep-a11y e2e                                                    | skip-link/landmarks/aria-live/focus-return/reduced-motion/forced-colors/200% zoom uncovered | `e2e/a11y.spec.ts`. **Found + fixed a real WCAG 2.4.1 gap:** no skip-to-content link existed — added shared `SkipLink` (`@career-hub/ui`) + `skipToContent` i18n key (4 locale files), wired into both apps' layouts. Also fixed a double-`h1` on `/resume` (`ResumeHeader` h1→h2, variant unchanged).                                                                                                                                                                       |
| Playwright failure artifacts + pageerror gate                              | no `pageerror`/`console.error` collection; bare `list` reporter                             | Both `playwright.config.ts`: `trace`/`video`/`screenshot` retain-on-failure, `html` reporter, shared `e2e/fixtures.ts` fails tests on uncaught page errors and console errors.                                                                                                                                                                                                                                                                                               |

### Dependency re-evaluation (2026-11-26, revised same day after merit review)

| Item                                                                                                                                                                                                                                                          | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-testing-library`                                                                                                                                                                                                                               | **Adopted** (7.16.2, root devDep). Scoped ruleset on `*.spec.*`/`*.test.*`: `prefer-screen-queries`, `no-node-access`, `no-await-sync-events`, `await-async-utils`, `no-unnecessary-act`, `prefer-user-event` minus the noisy `render-result-naming-convention` (disabled — `render()` return vars renamed instead). Initial triage: 38 violations fixed (container/document `querySelector` → `screen.getByRole`/accessible queries; misleading `render`-result names). `eslint-plugin-react-refresh` stays **rejected** — component-library-only concern, N/A for Vite SPAs + raw-TS `packages/ui`. |
| `fast-check` for job-tracker                                                                                                                                                                                                                                  | **Adopted** (4.10.2, scoped). Property specs for pure boundary modules only: `src/i18n/interpolate.spec.ts` (roundtrip, no-op, token preservation) and `skillNameKey` properties in `services/skills.spec.ts` (idempotence, trim/lowercase/single-space invariants). Deliberately NOT blanket-rolled out — component/hook specs stay example-based; Stryker covers mutation breadth.                                                                                                                                                                                                                  |
| `secretlint` in lint-staged                                                                                                                                                                                                                                   | **Adopted** (14.0.1 + preset-recommend 13.1.0). `.secretlintrc.json` at root; lint-staged runs it on code+doc globs and `*.env*`. Verified it catches `ghp_*` tokens and PEM private keys; full-repo scan clean. `gitleaks` CI step remains deferred (workflow change needs explicit request).                                                                                                                                                                                                                                                                                                        |
| `actionlint`/`zizmor` for `ci.yml`                                                                                                                                                                                                                            | **Rejected on merit** (re-evaluated). External binaries (Go/Rust) for one minimal workflow (`contents: read`, no risky perms, no `pull_request_target`, no injection surface). Revisit trigger: a second workflow or deploy/preview automation lands.                                                                                                                                                                                                                                                                                                                                                 |
| oxlint deep pass (`-D pedantic/style/restriction/nursery/perf`)                                                                                                                                                                                               | Triage run: style 7073, restriction 1931, nursery 2275, pedantic 528, perf 38 violations — **no category is clean**, so none enabled. `perf` is closest (38); several are intentional patterns (sequential `await` in sync scripts). Revisit `perf` after targeted cleanup. `check:fast` stays `correctness`+`suspicious`.                                                                                                                                                                                                                                                                            |
| Jest `restoreMocks: true`                                                                                                                                                                                                                                     | **Adopted** in all three `jest.config.cjs` — full suites green in every workspace (job-tracker 361, portfolio 122, packages/ui 49). Restores `jest.spyOn` mocks between tests; `jest.mock` module mocks unaffected.                                                                                                                                                                                                                                                                                                                                                                                   |
| Storybook/Ladle, network/CPU-throttling e2e, multi-browser matrix, MemLab for job-tracker, Vercel preview smoke, `web-vitals` lib, React Profiler/why-did-you-render, portfolio tsconfig strictness flags, license-checker gate, on-demand bundle visualizers | **Deferred with triggers** (unchanged from §4; triggers recorded there).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### 210-item verdict summary

- **Already covered / previously rejected / N/A:** ~155 items (repeat catalog
  entries in new wording — Storybook, Vitest, syncpack, turbo/nx, lefthook,
  attw/publint, stylelint/lightningcss, Sentry/observability SaaS, k6, CSP,
  React Compiler runtime, Codecov, etc.).
- **Implemented above:** 9 capability areas (env gate, mock-contract gate,
  falsification backfill ×3 scripts, MSW fault injection, i18n parity,
  persist corruption, history/deep-link e2e, deep-a11y e2e, Playwright
  hardening) plus 2 real defects fixed (skip-link, double h1).
- **Adopted after merit re-evaluation:** 3 items
  (`eslint-plugin-testing-library`, scoped `fast-check`, `secretlint`).
- **Rejected on merit:** 2 items (`eslint-plugin-react-refresh`,
  `actionlint`/`zizmor` — triggers recorded above).
- **Deferred with trigger:** ~15 items.
- **Evaluated, not adopted:** oxlint extra categories; on-demand diagnostics.

## 6. Third catalog pass — 2026-11-28 (104 items)

A 104-item frontend/monorepo tooling catalog was dispositioned against §1–§5.
~70 items were already covered or previously rejected; the user relaxed the
"no new deps" constraint to **open-source devDependencies allowed**, while
security scanning stayed **on-demand** (no CI workflow change). Five genuine
gaps were implemented; `jest-mock-extended` was trialed and rejected on merit
(see below).

### Adopted / implemented 2026-11-28

| Addition                                                                     | Covers catalog items                                                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expectNoA11yViolations` (`packages/ui/testkit/a11y.ts`, `axe-core@4.14.1`)  | axe-core in unit specs (jest-axe's role, without the wrapper dep)       | First run caught **two real WCAG failures**: MUI `Select` components in `ApplicationTable` (per-row status) and `ManualJobForm` (area/level/source) had no `labelId`/`id` association — fixed via `useId()` per the existing `FilterBar` pattern. `color-contrast` disabled (jsdom has no layout); e2e axe remains authoritative for contrast. Specs: OptionGroup, FilterBar, ApplicationTable, ManualJobForm, ProjectDetails. |
| `analyze:bundle` (`scripts/analyze-bundle.mjs`, `source-map-explorer@2.5.3`) | vite-bundle-visualizer / rollup-plugin-visualizer / source-map-explorer | On-demand treemap: rebuilds the app with `--sourcemap`, emits `.bundle-analysis/report.html` + `report.json` (gitignored) plus a gzip-size table. No build-config change; not a gate (same exempt category as `lighthouse-run.mjs`). Verified on job-tracker (41 assets).                                                                                                                                                      |
| `check:content` (`scripts/check-content.mjs`)                                | remark-lint for MDX (replaced — see rejections)                         | Deterministic gate wired into `verify:all`/`verify:push`: frontmatter parse + per-type required/typed fields, non-empty bodies, work-experience locale pairing (base + every non-en `LOCALES` entry, read from `types/i18n.ts` — never re-declared), no locale suffixes on single-locale projects, no unknown locales. Spec: `checkContent.spec.ts` (pass + 8 falsification fixtures). First run: clean on all 25 MDX files.   |
| `check:supply-chain` (`scripts/check-supply-chain.mjs`)                      | Semgrep/OSV-Scanner intent for dependency provenance (on-demand only)   | Audits `package-lock.json`: registry-only `resolved` URLs, `integrity` present, no git/file/http deps, `hasInstallScript` reported for manual review. First run: clean; 5 install-script packages noted (esbuild, fsevents, msw, puppeteer, sleep). Spec: `checkSupplyChain.spec.ts` (pass + 5 falsification fixtures). NOT wired into verify per user decision.                                                               |

### Evaluated and rejected this pass

- **`jest-mock-extended`** — trialed against `content.spec.ts` (the repo's only
  hand-rolled `jest.Mocked` intersections). Its `DeepMockProxy` typing cannot be
  reached without `as unknown as` casts (banned by AGENTS §2) or loses mock
  method typing; existing `jest.mock` automock + `jest.MockedFunction` + MSW
  already cover the need. Uninstalled.
- **`remark-lint`** — lints prose style; content is GitHub-synced, so upstream
  edits would fail CI on style the repo doesn't own. `check:content` validates
  the structural contract instead.
- **`jest-when`, `jest-extended`** — redundant with `mockReturnValueOnce`
  idioms and `@testing-library/jest-dom` matchers.
- **`eslint-plugin-import-x`, `madge`, `dpdm`, `ts-prune`** — covered by
  no-relative-import-paths + dependency-cruiser + Biome organizeImports + knip.
- **`publint`, `are-the-types-wrong`** — packages are private, unpublished,
  raw-TS source; no publish surface to lint.
- **`Pa11y`, `WAVE`, `jest-axe`, `vitest-axe`** — axe already runs in Playwright
  e2e (authoritative, real browser) and now in Jest via the testkit helper.
- **`stylelint`, `lightningcss`** — one CSS file in the repo (`App.css`),
  formatted by Biome.
- **`vite-bundle-visualizer`, `rollup-plugin-visualizer`** —
  source-map-explorer covers the same treemap on demand without touching
  `vite.config.ts`.
- **`Trivy`, `Syft`, `Grype`, `Cosign`, `Checkov`, `Hadolint`** — no
  containers/IaC/Dockerfile in this repo.
- **`pip-audit`, `Bandit`, `Vulture`, `deptry`** — Python tooling; the
  job-tracker-api repo owns that surface.
- **`detect-secrets`, `TruffleHog`** — secretlint (lint-staged + full-repo
  scan) already covers the commit-stage role.
- **`tsd`, `expect-type`** — redundant with strict `tsc` + zod; `type-fest`
  was already a dependency.
- **`k6`, `Locust`** — previously rejected; API repo's `load.yml` owns load
  testing.
- **`Storybook`/`@storybook/test`, `Ladle`** — unchanged deferred trigger
  (component-library scale); Playwright visual.spec renders every route.
- **`web-vitals` library, Playwright CDP throttling, React Profiler /
  why-did-you-render, multi-browser matrix, MemLab for job-tracker,
  license-checker, Vercel preview smoke, portfolio tsconfig strictness flags**
  — unchanged deferred triggers from §4/§5.
- **`@total-typescript/ts-reset`** — global type augmentation; revisit on
  first real `Response.json()`/unknown-narrowing pain.
- **`npm audit`/`npm ls`/`npm outdated`, `git bisect`, `git worktree`,
  `React.lazy`/`<Suspense>`, `PerformanceObserver`,
  `performance.getEntriesByType`, Chrome DevTools panels, Bundlephobia,
  Vercel Build Output API, `actions/cache`** — builtins, platform primitives,
  informational tools, or already implemented (`package:vercel`,
  `cache: npm`).

### 104-item verdict summary

- **Already covered / previously rejected / N/A:** ~85 items.
- **Implemented:** 4 capability areas (Jest axe helper + 2 real a11y fixes,
  bundle visualizer, content gate, supply-chain audit).
- **Adopted-then-rejected on merit:** 1 (`jest-mock-extended`).
- **Deferred with trigger:** ~10 items (unchanged triggers above).
- **Rejected on merit:** ~8 items.

## 7. Fourth pass — AI-agent context & local models (2026-11-28)

Disposition of a suggestion (YouTube comment thread) to have the LLM train
"tiny local models" on the project so the agent gets fast, specialized
answers without re-scanning the codebase — plus two reply threads proposing
(a) code-bound guardrails + agent config over fine-tuning, and (b) a learned
model that picks which unit tests to run per modified file.

| Suggestion                                            | Verdict                                           | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tiny local models / LoRA fine-tuned on the codebase   | **Rejected**                                      | Non-deterministic, unverifiable output — violates the deterministic-gate rule (AGENTS §2); GPU/runtime infra for unproven iteration savings; embeddings/RAG adds a stale-index failure mode worse than grep. The underlying need — project-specialized context without re-scanning — is already served deterministically by `.agents/context/` area files (auto-injected via `scripts/context-hook.mjs` + scout refresh), `AGENTS.md` + `.agents/skills/`, and typed gates. No revisit trigger identified. |
| Code-bound guardrails + editing the agent config      | **Already adopted — this is the repo's approach** | AGENTS.md constitution, per-workspace AGENTS.md, skills loaded at planning start, ESLint `strictTypeChecked` + sonarjs + security plugins, ~20 deterministic gates. Convention stands: each observed agent mistake becomes a lint rule or gate, not a trained model.                                                                                                                                                                                                                                       |
| LLM that learns which unit tests to run per file diff | **Adopted deterministically**                     | Same outcome, zero model infra: `npm run test:changed` (`scripts/test-changed.mjs`, Jest `--findRelatedTests` per workspace) here; `uv run python scripts/test_changed.py` (stdlib AST reverse-import graph with conservative full-suite fallback) in job-tracker-api. Both are dev tools, deliberately NOT wired into `verify:*`/lint-staged — subset semantics differ from the full-suite gates.                                                                                                         |

## 8. How to use this file

Re-run the audit when adding/removing gates. Update verdicts, not just the
tool list — a gate that never fires and has no suppressions is either
perfectly preventive or dead weight; check `git log` for the commit that
introduced it and any CI failure it caught before deciding.
