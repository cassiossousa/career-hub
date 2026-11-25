import baseConfig from './stryker.config.mjs';

export default {
  ...baseConfig,
  // First measured baseline: 53.80 (2026-11-24, 195 mutants) — most survivors
  // are styling/string literals the render-level specs don't assert. Ratchet
  // upward as component specs deepen; never lower to pass.
  thresholds: { high: 80, low: 60, break: 50 },
};
