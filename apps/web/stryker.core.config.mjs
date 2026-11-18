import baseConfig from './stryker.config.mjs';

export default {
  ...baseConfig,
  // Ratchet baseline: current core score is ~92%; raise break as tests improve.
  thresholds: { high: 90, low: 70, break: 85 },
};
