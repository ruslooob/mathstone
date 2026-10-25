// Navigation remains available before a paragraph's cheat sheet is earned.
export default async (page) => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const results = [];
  for (const size of [2, 3]) {
    await page.goto('/');
    await page.locator(`[data-paragraph="${size}"]`).click();
    await page.locator('[data-stage="practice"]').click();
    assert(await page.locator('#practicePanel').isVisible(), 'Practice must be accessible');
    assert(await page.locator('#answerInput').isEnabled(), 'Answer field must be usable');
    assert(await page.locator('#hintButton').count() === 0, 'Unearned cheat sheet must stay hidden');
    assert(
      await page.locator('[data-stage="cheatSheet"]').count() === 0,
      'The cheat sheet tab must not reveal a future reward',
    );
    await page.locator('#inventoryButton').click();
    assert(await page.locator('#inventoryDialog').isVisible(), 'Inventory must be accessible');
    assert(
      (await page.locator('#inventoryContent').innerText()) === 'Пока здесь пусто.',
      'The inventory must not reveal unearned cheat sheets',
    );
    await page.locator('#closeInventory').click();
    await page.locator('[data-stage="watch"]').click();
    assert(await page.locator('#watchPanel').isVisible(), 'Explanation must remain accessible');
    await page.locator('[data-stage="practice"]').click();
    await page.locator('#answerInput').fill('10000000');
    await page.locator('#answerForm button').click();
    assert(
      (await page.locator('#feedbackText').innerText()).includes('Пока не сходится'),
      'Wrong answer must be checked',
    );
    results.push({
      paragraph: size, directPractice: true, explanation: true, inventory: true,
    });
  }
  return results;
};
