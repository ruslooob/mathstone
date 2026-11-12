import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';

export default defineConfig({
  ...base,
  testDir: './tests',
  outputDir: '../../test-results/statistics',
  webServer: {
    command: 'npm run dev',
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
