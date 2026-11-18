module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/apps/web/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/apps/web/tsconfig.json' },
    ],
  },
  testMatch: ['**/*.(test|spec).(ts|tsx)'],
  testPathIgnorePatterns: [
    '<rootDir>/apps/web/e2e/',
    '<rootDir>/.stryker-tmp/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
  collectCoverageFrom: [
    'apps/web/src/**/*.(ts|tsx)',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Entry bootstrap and theme config are verified by build + e2e, not unit tests.
    '!apps/web/src/main.tsx',
    '!apps/web/src/app/theme.ts',
  ],
  coverageThreshold: {
    'apps/web/src/app/**': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
    'apps/web/src/components/**': {
      statements: 75,
      branches: 45,
      functions: 40,
      lines: 80,
    },
    'apps/web/src/features/**': {
      statements: 90,
      branches: 70,
      functions: 70,
      lines: 90,
    },
    'apps/web/src/i18n/**': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
    'apps/web/src/services/**': {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 80,
    },
    'apps/web/src/types/**': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};
