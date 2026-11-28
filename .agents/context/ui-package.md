---
area: ui-package
paths: packages/ui/
last-reviewed: 4a46e82b5ce1fc0b687075005aa050b7b49a384f
---

# packages/ui (@career-hub/ui)

## Contract: raw TS source, no build

Private unpublished package (`0.0.1`, pinned exactly by consumers). There is NO build/bundler/publish pipeline — apps import TypeScript source directly through the `exports` map:

- `@career-hub/ui/theme` → `theme/index.ts`
- `@career-hub/ui/components` → `components/index.ts`
- `@career-hub/ui/i18n` → `i18n/index.ts`
- `@career-hub/ui/testkit` → `testkit/index.ts` — test helpers consumed by app `architecture.spec.ts` files and ui specs only, never production app code

Do not add a bundler, `dist/` publish pipeline, or changesets. `index.ts` barrels are exempt from `no-barrel-files` (exports map points at them). App imports must use the subpath exports — never deep-import internals.

## Contents

- `components/` — MUI-based shared components; the ONLY directory Jest discovers specs in (`components/**/*.spec.{ts,tsx}`) and the only coverage/mutation scope.
- `theme/` — MUI theme.
- `i18n/` — shared dictionary helpers/types.
- `testkit/` — a11y/testing helpers for consumer specs. `a11y.ts` exports `expectNoA11yViolations(container)` (axe-core, WCAG 2.x A/AA tags; `color-contrast` disabled because jsdom has no layout — e2e axe is the authoritative contrast check). Consumers: app `architecture.spec.ts` files, component specs in both apps and `components/`.
- Runtime deps: `@mui/material`, `@emotion/react`, `@emotion/styled`, `flag-icons`; peers `react`/`react-dom` ^18. Pin identical versions to siblings; declare only what this package's build/tests touch — no root test tooling redeclaration.

## Gates

- `tsc -b` project reference from root solution tsconfig (emits declarations for type-checking; consumers still use source).
- ESLint `strictTypeChecked` + a11y/jsx rules, same as `apps/*/src`.
- Own Jest project (`jest.config.cjs`, jsdom) via `npm run test[:cov] --workspace @career-hub/ui` and inside `verify:all`; single package-wide `global` coverage floor over `components/` only. `theme/`/`i18n/`/`testkit/` are excluded until they gain specs — re-include a directory when it does.
- jscpd clone scanning, knip dead-code, same lint-staged/prettier/oxlint/biome fast gates.
- Stryker scope is `components/` only, via root `scripts/mutation-targets.mjs` registry; extend registry globs when other dirs gain tests.

## Pitfalls

- Because consumers compile the TS source directly, a type error here breaks BOTH apps' builds — `npm run check:types` (root `tsc -b`) is the real gate.
- New components need specs in `components/` or they ship uncovered and outside the mutation scope.
- `testkit/` exports must stay test-only — production app code importing it is an architectural violation.
