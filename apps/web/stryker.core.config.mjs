import baseConfig from './stryker.config.mjs';

export default {
  ...baseConfig,
  // Ratchet baseline: current core score is ~49%; raise break as tests improve.
  thresholds: { high: 80, low: 45, break: 45 },
};
