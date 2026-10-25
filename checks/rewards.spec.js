import { expect, test } from '@playwright/test';

async function openPractice(page, size) {
  await page.locator(`[data-paragraph="${size}"]`).click();
  await page.locator('[data-stage="practice"]').click();
}

async function answerFor(page) {
  return page.locator('#practicePanel svg title').evaluate((element) => {
    const matrix = element.textContent.split('; ').map((row) => row.split(', ').map(Number));
    if (matrix.length === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  });
}

async function solveTasks(page, count) {
  for (let i = 0; i < count; i += 1) {
    if (await page.locator('#nextTask').isVisible()) await page.locator('#nextTask').click();
    await page.locator('#answerInput').fill(String(await answerFor(page)));
    await page.locator('#answerForm button').click();
  }
}

test('награды появляются после пяти решений, без спойлеров, и сохраняются', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav[aria-label="Этапы параграфа"] button'))
    .toHaveText(['Объяснение', 'Практика']);
  await expect(page.locator('#frameCounter')).toHaveCount(0);
  await expect(page.locator('#totalProgress')).toHaveCount(0);
  await expect(page.locator('#inventoryButton')).toHaveText('Мои шпаргалки');
  await page.locator('#inventoryButton').click();
  await expect(page.locator('#inventoryContent')).toHaveText('Пока здесь пусто.');
  await page.locator('#closeInventory').click();

  await openPractice(page, 2);
  await expect(page.locator('#hintButton')).toHaveCount(0);
  await expect(page.locator('#rewardProgress')).toHaveCount(0);
  await expect(page.locator('#reviewExplanation')).toHaveCount(0);
  await page.locator('#answerInput').fill('10000000');
  await page.locator('#answerForm button').click();
  await expect(page.locator('#practicePanel')).toContainText('Решено задач: 0');
  await solveTasks(page, 3);
  await openPractice(page, 3);
  await solveTasks(page, 2);
  await openPractice(page, 2);
  await expect(page.locator('#practicePanel')).toContainText('Решено задач: 3');
  await page.reload();
  await openPractice(page, 2);
  await expect(page.locator('#practicePanel')).toContainText('Решено задач: 3');
  await expect(page.locator('#nextTask')).toBeVisible();

  await openPractice(page, 3);
  await solveTasks(page, 2);
  const dialog = page.locator('#inventoryDialog');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#hintButton')).toHaveCount(0);
  await solveTasks(page, 1);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 }))
    .toHaveText('Вы получили новую шпаргалку');
  await expect(dialog.getByRole('button', { name: 'Назад к инвентарю' })).toHaveCount(0);
  await expect(dialog.locator('[data-cheat-sheet="3"]')).toBeVisible();
  await expect(dialog.locator('[data-cheat-sheet="2"]')).toHaveCount(0);
  await expect(dialog).not.toContainText('2×2');
  await expect(dialog.locator('[aria-hidden="true"] i')).toHaveCount(84);
  await expect(dialog.locator('[role="math"]')).toContainText('D');
  await expect(dialog.locator('[role="math"] sub')).toHaveCount(18);
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#practicePanel')).toBeVisible();

  await page.locator('#inventoryButton').click();
  await expect(dialog.locator('[data-open-cheat-sheet]')).toHaveCount(1);
  await expect(dialog).not.toContainText('2×2');
  await expect(dialog).not.toContainText('Решено:');
  await expect(dialog).not.toContainText('Часть открыта');
  await dialog.locator('[data-open-cheat-sheet="3"]').click();
  await expect(dialog.locator('[data-cheat-sheet="3"]')).toBeVisible();
  await expect(dialog.locator('[aria-hidden="true"] i')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Увеличить' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Назад к инвентарю' }))
    .toHaveAttribute('title', 'Назад к инвентарю');
  await dialog.getByRole('button', { name: 'Назад к инвентарю' }).click();
  await expect(dialog.locator('[data-open-cheat-sheet]')).toHaveCount(1);
  await dialog.locator('[data-open-cheat-sheet="3"]').click();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();

  await page.reload();
  await expect(dialog).not.toBeVisible();
  await openPractice(page, 3);
  await expect(page.locator('#nextTask')).toBeVisible();
  await expect(page.locator('#hintButton')).toHaveCount(0);
  await page.locator('#inventoryButton').click();
  await dialog.locator('[data-open-cheat-sheet="3"]').click();
  await expect(dialog.locator('[data-cheat-sheet="3"]')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Назад к инвентарю' })).toBeVisible();
  await page.locator('#closeInventory').click();
  await solveTasks(page, 1);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#practicePanel')).toContainText('Решено задач: 6');

  await openPractice(page, 2);
  await solveTasks(page, 2);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 }))
    .toHaveText('Вы получили новую шпаргалку');
  await expect(dialog.locator('[data-cheat-sheet="2"]')).toBeVisible();
  await expect(dialog.locator('[data-cheat-sheet="3"]')).toHaveCount(0);
  await expect(dialog.locator('[role="math"]')).toHaveText('D =x11 · x22 − x12 · x21');
  await page.locator('#closeInventory').click();
  await expect(page.locator('#practicePanel')).toContainText('Решено задач: 5');
  await page.locator('#inventoryButton').click();
  await expect(dialog.locator('[data-open-cheat-sheet]')).toHaveCount(2);
});

test('повторная отправка верного ответа не добавляет лишнее решение', async ({ page }) => {
  await page.goto('/');
  await openPractice(page, 2);
  await page.locator('#answerInput').fill(String(await answerFor(page)));
  await page.locator('#answerForm').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await expect(page.locator('#practicePanel')).toContainText('Решено задач: 1');
  await expect(page.locator('#inventoryDialog')).not.toBeVisible();
});
