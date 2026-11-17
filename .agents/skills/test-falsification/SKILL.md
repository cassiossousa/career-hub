---
name: test-falsification
description: Replaces superficial AI-generated unit tests with high-signal, mutation-resistant tests using Vitest and fast-check.
---

# Test Falsification Protocol

When asked to write or repair tests for front-end logic:

1. **Ban Tautological Assertions:** Never assert that a mock returns what you just configured it to return. Test real state transitions, boundary conditions, and invariant properties.
2. **Use Property-Based Testing (`fast-check`):** For parsers, formatters, validators, and state reducers, generate randomized adversarial inputs instead of 3 hardcoded happy-path examples.
3. **Verify with Stryker Mutator:** Run incremental mutation testing on the target module:
   ```bash
   npx stryker run -m <path-to-target-file>
   ```
4. **Kill Surviving Mutants:** Inspect any `Survived` mutant (e.g., flipped `>` to `>=`, removed conditional check, or negated boolean) and add a targeted assertion that fails when that mutant is active.
