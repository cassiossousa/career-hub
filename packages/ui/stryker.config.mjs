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
  thresholds: { high: 80, low: 60, break: 60 },
  tsconfigFile: 'tsconfig.json',
};
