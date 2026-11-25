export default {
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.cjs',
  },
  mutate: [
    'components/**/*.{ts,tsx}',
    '!components/**/*.{test,spec}.{ts,tsx}',
    '!**/*.d.ts',
  ],
  reporters: ['clear-text', 'progress'],
  ignorePatterns: ['e2e/**', 'coverage/**', '**/dist/**'],
  coverageAnalysis: 'perTest',
  // Jest cold-start under 17 parallel runners exceeds the 5s default on
  // Windows — without this every mutant "times out" and the score is fake.
  timeoutMS: 30000,
  thresholds: { high: 80, low: 60, break: 60 },
  tsconfigFile: 'tsconfig.json',
};
