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
  coverageAnalysis: 'perTest',
  tsconfigFile: 'apps/web/tsconfig.json',
};
