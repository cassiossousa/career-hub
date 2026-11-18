export default {
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.cjs',
  },
  mutate: [
    'apps/web/src/**/*.{ts,tsx}',
    '!apps/web/src/**/*.{test,spec}.{ts,tsx}',
  ],
  reporters: ['clear-text', 'progress'],
  ignorePatterns: [
    'test-results/**',
    'playwright-report/**',
    '.lighthouseci/**',
    '.memlab/**',
    '**/dist/**',
  ],
  coverageAnalysis: 'perTest',
  thresholds: { high: 80, low: 60, break: 60 },
  tsconfigFile: 'apps/web/tsconfig.json',
};
