# AGENTS.md — packages/ui (@career-hub/ui)

Shared component library consumed by both apps. Every rule in the root `AGENTS.md` still applies — this file adds package-only detail.

## Contract: raw TS source, no build

- `private: true`, unpublished. There is NO build step — consumers import TypeScript source directly through the `exports` map:
  - `@career-hub/ui/theme` → `theme/index.ts`
  - `@career-hub/ui/components` → `components/index.ts`
  - `@career-hub/ui/i18n` → `i18n/index.ts`
  - `@career-hub/ui/testkit` → `testkit/index.ts` (test helpers — consumed by app `architecture.spec.ts` files and ui specs only, never by production app code)
- Do not add a bundler, `dist/` publish pipeline, or changesets — source consumption is the contract. (`dist/`/`coverage/` exist locally as tsc/jest artifacts and are gitignored.)
- `index.ts` barrel files are EXEMPT from `eslint-plugin-no-barrel-files` (scoped override in `eslint.config.ts`) — the exports map points at them.

## Dependencies

- Runtime deps: `@mui/material`, `@emotion/react`, `@emotion/styled`, `flag-icons`. Peer deps: `react`, `react-dom` (`^18.0.0`).
- Rule from root `AGENTS.md`: pin the SAME versions sibling workspaces/root already use; declare only what this package's build or tests touch — do not redeclare root-provided test tooling.

## Gates that matter here

- `tsc -b` project reference from the root solution tsconfig (emits declarations to `dist/` for type-checking; consumers still use source).
- ESLint `strictTypeChecked` + a11y/jsx rules, same as `apps/*/src`.
- Own Jest project (`jest.config.cjs`, jsdom, `components/**/*.spec.{ts,tsx}`) run via `npm run test[:cov] --workspace @career-hub/ui` and inside `verify:all`.
- **Coverage bar is higher than the apps':** every component file carries an explicit per-file floor (currently 80%; `ResumePdfViewer/ResumePdfSections.tsx` 90/70 until branch coverage improves). Raise floors as coverage improves — never lower them to pass.
- jscpd clone scanning, knip dead-code analysis, same lint-staged/prettier/oxlint/biome fast gates.
- **Mutation:** `stryker.config.mjs` + `stryker.core.config.mjs`; `check:mutate:diff`/`check:mutate:core` delegate to the root `scripts/check-mutation-*.mjs` via the `scripts/mutation-targets.mjs` registry. Scope is `components/` only — the sole directory with Jest specs; extend the registry globs when `theme/`/`pdf/`/`i18n/`/`testkit/` gain tests.
- App imports go through the `exports` subpaths above — never deep-import internal files (`@career-hub/ui/components/Foo`).
