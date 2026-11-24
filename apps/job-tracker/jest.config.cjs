const fs = require('node:fs');
const path = require('node:path');

// Stryker's jest runner copies this config into .stryker-tmp/sandbox-*, so
// __dirname-relative lookups for repo-root paths (packages/, node_modules/)
// break. Walk up to the workspace-root package.json instead.
function findRepoRoot(start) {
  let dir = start;
  for (;;) {
    const manifest = path.join(dir, 'package.json');
    if (fs.existsSync(manifest)) {
      try {
        if (
          JSON.parse(fs.readFileSync(manifest, 'utf8')).name === 'career-hub'
        ) {
          return dir;
        }
      } catch {
        // keep walking
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(`career-hub workspace root not found from ${start}`);
    }
    dir = parent;
  }
}

const REPO_ROOT = findRepoRoot(__dirname);

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
  // Discovery is pinned to src/ via a rootDir-free glob: Stryker's jest runner
  // re-roots into .stryker-tmp/sandbox-*, where <rootDir>-based testMatch and
  // testPathIgnorePatterns stop matching (Playwright specs get executed by
  // Jest). '**/src/**' also keeps stale sandbox copies out via the ignore
  // patterns below.
  testMatch: ['**/src/**/*.spec.{ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.stryker-tmp/'],
  modulePathIgnorePatterns: ['<rootDir>/.stryker-tmp/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Absolute paths anchored at the workspace root: Stryker's jest runner
    // re-roots <rootDir> into .stryker-tmp/sandbox-*, breaking ../../ lookups.
    '^@career-hub/ui/(.*)$': path.join(REPO_ROOT, 'packages/ui/$1/index.ts'),
    '^msw/node$': path.join(REPO_ROOT, 'node_modules/msw/lib/node/index.js'),
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
