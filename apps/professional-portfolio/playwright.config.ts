import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  snapshotPathTemplate:
    '{testDir}/{testFileName}-snapshots/{arg}-{platform}{ext}',
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command:
      'npm run dev --workspace professional-portfolio -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
