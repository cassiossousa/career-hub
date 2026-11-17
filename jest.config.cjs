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
  collectCoverageFrom: [
    'apps/web/src/**/*.(ts|tsx)',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
