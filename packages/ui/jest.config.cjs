module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // No <rootDir> in testMatch: Stryker's jest runner re-roots into
  // .stryker-tmp/sandbox-*, where <rootDir>-based patterns stop matching.
  testMatch: ['**/components/**/*.spec.{ts,tsx}'],
  // Stale Stryker sandboxes contain copied specs — never let Jest see them.
  testPathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
  modulePathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/testkit/svgMock.ts',
  },
  // Coverage measures the tested surface: testMatch only discovers specs
  // under components/, so theme/, i18n/, and testkit/ (no specs yet) plus
  // re-export barrels are excluded rather than dragging the floor to zero.
  // Re-include a directory here when it gains specs.
  collectCoverageFrom: [
    '<rootDir>/components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.spec.{ts,tsx}',
    '!**/index.ts',
  ],
  // packages/ui is the reusable-component home, so its bar is a single
  // package-wide floor (same shape as the apps' global thresholds). Raise
  // it as coverage improves — never lower it to pass.
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
