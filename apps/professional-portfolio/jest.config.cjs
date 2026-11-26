module.exports = {
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.svg$': '<rootDir>/src/test/svgMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  testMatch: ['**/*.(test|spec).(ts|tsx)'],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.stryker-tmp/'],
  modulePathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(ts|tsx)',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Entry bootstrap and theme config are verified by build + e2e, not unit tests.
    '!<rootDir>/src/main.tsx',
    '!<rootDir>/src/app/theme.ts',
    // Reads import.meta.env, which ts-jest cannot execute; specs mock it.
    '!<rootDir>/src/app/env.ts',
  ],
  // Single package-wide floor (same shape as job-tracker and packages/ui);
  // raise it as coverage improves — never lower it to pass.
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
};
