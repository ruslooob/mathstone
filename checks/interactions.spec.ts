import { expect, test } from '@playwright/test';
import { progressStorageKey } from '../src/progress';

['-2', '-02,0', '  −2  '].forEach((submittedAnswer) => {
  test(`проверка сохраняет введённый ответ «${submittedAnswer}»`, async ({ page }) => {
    await page.addInitScript((key) => {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        progress: {
          2: { viewed: [0], solved: 0, task: { matrix: [[1, 2], [3, 4]], solved: false } },
        },
      }));
    }, progressStorageKey);
    await page.goto('/');
    await page.locator('[data-stage="practice"]').click();
    await page.locator('#answerInput').fill(submittedAnswer);
    await page.locator('#answerForm button').click();
    await expect(page.locator('#nextTask')).toBeVisible();
    await expect(page.locator('#answerInput')).toHaveValue(submittedAnswer);
    await page.locator('[data-paragraph="3"]').click();
    await page.locator('[data-paragraph="2"]').click();
    await page.locator('[data-stage="practice"]').click();
    await expect(page.locator('#answerInput')).toHaveValue(submittedAnswer);
    await page.reload();
    await page.locator('[data-stage="practice"]').click();
    await expect(page.locator('#answerInput')).toHaveValue(submittedAnswer);
  });
});

test('инвентарь закрывается снаружи и остаётся открытым при нажатии внутри', async ({ page }) => {
  await page.goto('/');
  await page.locator('#inventoryButton').click();
  const dialog = page.locator('#inventoryDialog');
  await expect(dialog).toBeVisible();
  await page.locator('#inventoryTitle').click();
  await expect(dialog).toBeVisible();
  await dialog.click({ position: { x: 10, y: 10 } });
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#inventoryButton')).toBeFocused();
});
