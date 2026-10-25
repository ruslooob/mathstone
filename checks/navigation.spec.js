import { test } from '@playwright/test';
import navigation from './navigation.browser.js';

test('навигация, ответы и инвентарь обоих параграфов', async ({ page }) => {
  await navigation(page);
});
