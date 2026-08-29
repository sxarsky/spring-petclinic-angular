import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // '**/*.spec.ts' covers the Skyramp-generated specs in e2e/; testDir keeps this
  // scoped to e2e/ so the Angular unit specs under src/ are not picked up.
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
