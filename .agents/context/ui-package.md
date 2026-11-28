---
area: ui-package
paths: packages/ui/
last-reviewed: 3ed16ab9487fa6985aa1e908ef6361a9a4d038b0
---

# packages/ui (@career-hub/ui)

## Contract: raw TS source, no build

Private unpublished package (`0.0.1`, pinned exactly by consumers). There is NO build/bundler/publish pipeline — apps import TypeScript source directly through the `exports` map:

- `@career-hub/ui/theme` → `theme/index.ts`
- `@career-hub/ui/components` → `components/index.ts`
- `@career-hub/ui/pdf` → `pdf/index.ts` — resume PDF document schema + `ResumePdfDocumentMeta` provenance type shared with job-tracker
- `@career-hub/ui/i18n` → `i18n/index.ts`
- `@career-hub/ui/testkit` → `testkit/index.ts` — test helpers consumed by app `architecture.spec.ts` files and ui specs only, never production app code
- `@career-hub/ui/e2e` → `testkit/e2eFixtures.ts` — e2e-only fixtures

Do not add a bundler, `dist/` publish pipeline, or changesets. `index.ts` barrels are exempt from `no-barrel-files` (exports map points at them). App imports must use the subpath exports — never deep-import internals.

## Contents

- `components/` — MUI-based shared components.
- `pdf/` — `resumePdfDocumentSchema` (zod) validates the resume-document JSON the job-tracker app renders/previews; `schemaVersion` defaults to 1 for pre-versioning documents and an optional `meta` provenance envelope (`locale`, `source`, `versionId`, `applicationId`, `jobId`, `generatedAt` — ADR 0035, rendering ignores it). `ResumePdfDocumentMeta` type is exported from `pdf/index.ts`.
- `theme/` — MUI theme.
- `i18n/` — shared dictionary helpers/types.
- `testkit/` — a11y/testing helpers for consumer specs. `a11y.ts` exports `expectNoA11yViolations(container)` (axe-core, WCAG 2.x A/AA tags; `color-contrast` disabled because jsdom has no layout — e2e axe is the authoritative contrast check). Consumers: app `architecture.spec.ts` files, component specs in both apps and `components/`.
- Runtime deps: `@mui/material`, `@emotion/react`, `@emotion/styled`, `flag-icons`; peers `react`/`react-dom` ^18. Pin identical versions to siblings; declare only what this package's build/tests touch — no root test tooling redeclaration.

## Gates

- `tsc -b` project reference from root solution tsconfig (emits declarations for type-checking; consumers still use source).
- ESLint `strictTypeChecked` + a11y/jsx rules, same as `apps/*/src`.
- Own Jest project (`jest.config.cjs`, jsdom) via `npm run test[:cov] --workspace @career-hub/ui` and inside `verify:all`; single package-wide `global` coverage floor over `components/` + `pdf/` (the spec'd dirs — `theme/`/`i18n/`/`testkit/` stay excluded until they gain specs; re-include a directory when it does).
- jscpd clone scanning, knip dead-code, same lint-staged/prettier/oxlint/biome fast gates.
- Stryker scope is `components/` + `pdf/`, via root `scripts/mutation-targets.mjs` registry (`srcPrefixes` array — `check-mutation-diff.mjs` matches changed files against any prefix); extend registry globs when other dirs gain tests.

## Pitfalls

- Because consumers compile the TS source directly, a type error here breaks BOTH apps' builds — `npm run check:types` (root `tsc -b`) is the real gate.
- New components need specs in `components/` (or `pdf/` for schema work) or they ship uncovered and outside the mutation scope.
- `pdf/schema.ts` is the shared contract for resume-document JSON: keep it permissive-but-typed (optional fields, defaults) since backend documents predate versioning; unknown keys are stripped, not rejected.
- `testkit/` exports must stay test-only — production app code importing it is an architectural violation.
