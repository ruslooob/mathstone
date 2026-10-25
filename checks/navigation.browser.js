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
    assert(await page.locator('#hintButton').isDisabled(), 'Unearned cheat sheet must stay closed');
    assert(
      await page.locator('[data-stage="cheatSheet"]').isDisabled(),
      'Opening a paragraph must not award its cheat sheet',
    );
    await page.locator('#inventoryButton').click();
    assert(await page.locator('#inventoryDialog').isVisible(), 'Inventory must be accessible');
    assert(
      (await page.locator('#cheatSheetCount').innerText()) === '0 / 2',
      'Opening the inventory must not award a cheat sheet',
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
