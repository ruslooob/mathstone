import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './checks',
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium' },
  projects: [
    { name: 'wide', use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: 'narrow',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
  },
});
