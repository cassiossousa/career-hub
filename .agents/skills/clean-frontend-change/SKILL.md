---
name: clean-frontend-change
description: Enforces vertical slice architecture, small diffs, strict TypeScript compliance, and deterministic CLI verification when creating or modifying front-end features.
---

# Clean Front-End Change Workflow

Follow this exact 4-step protocol whenever implementing a feature or bugfix:

## Step 1: Inspect Existing Primitives First

Before creating any new component, hook, or utility:

1. Search `apps/web/src/components/`, `apps/web/src/services/`, and `apps/web/src/app/` for existing primitives.
2. Check `package.json`—do NOT add new dependencies when existing utilities or native Web APIs suffice.
3. Respect enforced boundaries: features under `apps/web/src/features/` must not import sibling features, and `apps/web/src/components/` must not import features or services (`apps/web/src/architecture.spec.ts` fails otherwise).

## Step 2: Keep Diffs Small & Vertically Bounded

1. Touch the minimum number of files required. Avoid drive-by rewrites of unrelated files.
2. Keep UI components under **150 lines**. Extract pure business logic and data transformations into `apps/web/src/services/` or `apps/web/src/domain/`-style pure functions so they can be tested without mounting React.
3. Explicitly type all function return values and error states.

## Step 3: Write Falsifiable Tests

1. Test behavior and state transitions, not internal implementation details.
2. Include edge-case inputs (empty arrays, nullish fields, network failures) or `fast-check` property assertions for data transformations.

## Step 4: Execute Deterministic Gates (Mandatory)

Run the automated verification pipeline and resolve all failures before responding:

```bash
npm run verify:all
```

For changes touching runtime behavior, routing, styling, or dependencies, also run the deep gate (requires `npx playwright install chromium` once per machine):

```bash
npm run audit:deep
```

`audit:deep` adds dependency-cruiser arch checks, the Jest boundary spec, Playwright smoke + WCAG AA audits plus resilience specs (`apps/web/e2e/`: storage faults, offline navigation, 360px/pt-BR overflow), a production-build MemLab leak check, and Lighthouse CI budgets. `verify:all` also enforces gzip bundle budgets via `npm run check:bundle`, and ESLint applies `eslint-plugin-security` rules to `apps/web/src` to reject XSS sinks. CI runs `verify:all`, the e2e job (Playwright + Lighthouse), and incremental mutation testing on PRs; pre-commit runs lint-staged and pre-push runs `npm run verify:push`.
