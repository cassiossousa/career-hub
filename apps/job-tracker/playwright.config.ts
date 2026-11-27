import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev --workspace job-tracker -- --port 4174 --strictPort',
    url: 'http://localhost:4174',
    // E2E must always run against MSW demo data — a developer's `.env.local`
    // may enable live mode (VITE_MOCK_API=false), which hangs the suite.
    // Process env wins over .env files in Vite.
    env: { VITE_MOCK_API: 'true' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
