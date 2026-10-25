import { test } from '@playwright/test';
import playback from './playback.browser.js';

test('воспроизведение обоих параграфов', async ({ page }) => {
  await playback(page);
});
