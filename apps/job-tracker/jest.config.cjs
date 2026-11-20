/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // MSW-intercepted axios calls are slow under coverage instrumentation;
  // the 5s default flakes on parallel workers.
  testTimeout: 30000,
  testEnvironmentOptions: {
    url: 'http://localhost:8000/',
    customExportConditions: ['node', 'require', 'default'],
  },
  setupFiles: ['<rootDir>/src/test/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.stryker-tmp/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@career-hub/ui/(.*)$': '<rootDir>/../../packages/ui/$1/index.ts',
    '^msw/node$': '<rootDir>/../../node_modules/msw/lib/node/index.js',
    '/app/env$': '<rootDir>/src/test/env.ts',
    '\\.svg$': '<rootDir>/src/test/svgMock.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    // Entry-point and environment bootstrap: main.tsx/browser.ts run side
    // effects at import; env.ts reads import.meta.env which Jest maps to a
    // stub, so the real module can never execute under ts-jest.
    '!src/main.tsx',
    '!src/mocks/browser.ts',
    '!src/app/env.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
