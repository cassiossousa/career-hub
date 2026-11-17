---
name: test-falsification
description: Replaces superficial AI-generated unit tests with high-signal Jest tests and mutation testing.
---

# Test Falsification Protocol

When asked to write or repair tests for front-end logic:

1. **Ban Tautological Assertions:** Never assert that a mock returns what you just configured it to return. Test real state transitions, boundary conditions, and invariant properties.
2. **Cover Boundary Cases:** For parsers, formatters, validators, and state reducers, test empty, nullish, malformed, and boundary inputs. Use property-based testing only when the project already has an approved property-testing dependency.
3. **Verify with Stryker Mutator:** For changed business logic, run the repository's incremental mutation check:

   ```bash
   npm run check:mutate:diff
   ```

4. **Kill Surviving Mutants:** Inspect any surviving mutant (for example, a flipped comparison, removed condition, or negated boolean) and add a targeted assertion that fails when that mutant is active.
