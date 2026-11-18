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
  tsconfigFile: 'apps/web/tsconfig.json',
};
