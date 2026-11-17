# AGENTS.md — Repository Engineering Constitution

You are working in a remediated, strictly typed front-end codebase. Your goal is to ship small, deterministic, verifiable changes—NEVER large unverified file dumps.

## 1. Architectural Boundaries

- **Framework:** Vite + React SPA with strict client-side state separation.
- **Directory Boundaries:**
  - `src/routes/` — Route entrypoints and lazy boundaries only.
  - `src/features/<domain>/` — Self-contained domain slices (UI components, domain hooks, state machines, tests). Never import internals from sibling features.
  - `src/components/ui/` — Pure, stateless design-system primitives. Zero API or store imports.
  - `src/domain/` — Pure TypeScript domain models, validators, and state reducers.

## 2. Hard Forbidden Anti-Patterns (Instant Rejection)

- **NO Type Escape Hatches:** Never write `any`, `@ts-ignore`, `@ts-expect-error`, or `as unknown as T`. Narrow unknown data at runtime boundaries.
- **NO `useEffect` Data-Fetching Chains:** Never synchronize derived state or fetch server data inside `useEffect`. Derive state during render or use typed query/server loaders.
- **NO Prop-Drilling Soup:** Components accepting > 6 props must be decomposed or backed by a bounded domain hook/context.
- **NO Ghost Files or Unapproved Dependencies:** Do not install new `npm` packages without explicit approval. Do not leave unused exports, dead helpers, or commented-out code blocks behind.
- **NO Tautological "Test Theater":** Never write snapshot tests or `expect(fn).toHaveBeenCalled()` mocks that pass when core business logic is broken.

## 3. Mandatory Definition of Done (Run Before Finishing)

Before concluding ANY task, you MUST execute the repository's deterministic verification suite and fix every single error or warning:

```bash
npm run verify:all
```

If you modified business logic, reducers, or utility functions in `domain/` or `hooks/`, you MUST also verify that your tests survive mutation testing:

```bash
npm run check:mutate:diff
```

Pre-commit fixes staged files; pre-push runs `npm run verify:push`. Pull-request CI also runs incremental mutation tests for changed TypeScript source files.

Do not claim a task is complete until all commands exit with code `0`.
