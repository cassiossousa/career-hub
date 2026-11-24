export default {
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.cjs',
  },
  mutate: ['src/**/*.{ts,tsx}', '!src/**/*.{test,spec}.{ts,tsx}'],
  reporters: ['clear-text', 'progress'],
  ignorePatterns: [
    'test-results/**',
    'playwright-report/**',
    'coverage/**',
    '**/dist/**',
  ],
  coverageAnalysis: 'perTest',
  thresholds: { high: 80, low: 60, break: 60 },
  tsconfigFile: 'tsconfig.json',
};
