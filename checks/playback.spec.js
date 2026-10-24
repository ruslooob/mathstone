import { test } from '@playwright/test';
import playback from './playback.browser.js';

test('воспроизведение обоих уроков', async ({ page }) => {
  await playback(page);
});
