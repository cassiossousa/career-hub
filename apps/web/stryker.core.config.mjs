import baseConfig from './stryker.config.mjs';

export default {
  ...baseConfig,
  // Ratchet baseline: current core score is ~75%; raise break as tests improve.
  thresholds: { high: 85, low: 65, break: 70 },
};
