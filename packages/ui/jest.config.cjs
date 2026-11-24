module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/components/**/*.spec.{ts,tsx}'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/testkit/svgMock.ts',
  },
  collectCoverageFrom: [
    '<rootDir>/{components,theme,i18n,testkit}/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.spec.{ts,tsx}',
    '!<rootDir>/testkit/svgMock.ts',
  ],
  // packages/ui is the reusable-component home, so its bar is higher than
  // the apps': every component file carries an explicit per-file floor.
  // Raise floors as coverage improves — never lower them to pass.
  coverageThreshold: {
    '**/components/AppErrorBoundary.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    '**/components/FlagIcon.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    '**/components/LanguageSwitcher.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    '**/components/OptionGroup.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    '**/components/ThemeModeToggle.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    '**/components/ResumePdfViewer/ResumePdfViewer.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    '**/components/ResumePdfViewer/ResumePdfSections.tsx': {
      branches: 70,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    '**/components/ResumePdfViewer/printPage.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
