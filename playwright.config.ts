import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Skyramp-generated specs are emitted as *.spec.ts; the repo's own suite uses
  // *.e2e-spec.ts. Match both so generated specs join this suite.
  testMatch: ['**/*.e2e-spec.ts', '**/*.spec.ts'],
  webServer: {
    command: 'npm start -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
