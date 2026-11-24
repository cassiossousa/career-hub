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
  coverageThreshold: {
    '**/src/app/**': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
    '**/src/components/**': {
      statements: 75,
      branches: 45,
      functions: 40,
      lines: 80,
    },
    '**/src/features/**': {
      statements: 90,
      branches: 70,
      functions: 70,
      lines: 90,
    },
    '**/src/i18n/**': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
    '**/src/services/**': {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 80,
    },
    '**/src/types/**': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};
