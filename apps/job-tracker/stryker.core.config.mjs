import baseConfig from './stryker.config.mjs';

export default {
  ...baseConfig,
  // Baseline pending first full run — ratchet upward as tests improve.
  thresholds: { high: 90, low: 70, break: 60 },
};
