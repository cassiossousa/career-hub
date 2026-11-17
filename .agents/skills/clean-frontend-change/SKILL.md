---
name: clean-frontend-change
description: Enforces vertical slice architecture, small diffs, strict TypeScript compliance, and deterministic CLI verification when creating or modifying front-end features.
---

# Clean Front-End Change Workflow

Follow this exact 4-step protocol whenever implementing a feature or bugfix:

## Step 1: Inspect Existing Primitives First

Before creating any new component, hook, or utility:

1. Search `src/components/ui/` and `src/domain/` for existing primitives.
2. Check `package.json`—do NOT add new dependencies when existing utilities or native Web APIs suffice.

## Step 2: Keep Diffs Small & Vertically Bounded

1. Touch the minimum number of files required. Avoid drive-by rewrites of unrelated files.
2. Keep UI components under **150 lines**. Extract pure business logic and data transformations into `src/domain/` functions so they can be tested without mounting React.
3. Explicitly type all function return values and error states.

## Step 3: Write Falsifiable Tests

1. Test behavior and state transitions, not internal implementation details.
2. Include edge-case inputs (empty arrays, nullish fields, network failures) or `fast-check` property assertions for data transformations.

## Step 4: Execute Deterministic Gates (Mandatory)

Run the automated verification pipeline and resolve all failures before responding:

```bash
npm run verify:all
```
