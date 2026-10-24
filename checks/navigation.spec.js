import { test } from '@playwright/test';
import navigation from './navigation.browser.js';

test('навигация, ответы и коллекция обоих уроков', async ({ page }) => {
  await navigation(page);
});
