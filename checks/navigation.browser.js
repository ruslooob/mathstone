// Browser regression: every lesson stage is accessible without watching the animation.
export default async (page) => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const results = [];
  for (const n of [2, 3]) {
    await page.goto('/');
    await page.locator(`[data-lesson="${n}"]`).click();
    await page.locator('[data-stage="practice"]').click();
    assert(await page.locator('#practicePanel').isVisible(), `${n}×${n}: practice tab is blocked`);
    assert(await page.locator('#answerInput').isEnabled(), 'Answer field must be usable');
    await page.locator('#hintButton').click();
    assert(
      await page.locator('#practiceHint').isVisible(),
      'Hint must open before collecting a card',
    );
    await page.locator('[data-stage="card"]').click();
    assert(await page.locator('#cardPanel').isVisible(), `${n}×${n}: card tab is blocked`);
    assert(
      (await page.locator('#cardCount').innerText()) === '1 / 2',
      'Opening a card must add it to the collection',
    );
    await page.locator('#startPractice').click();
    assert(await page.locator('#practicePanel').isVisible(), 'Card must link to practice');
    await page.locator('[data-stage="watch"]').click();
    assert(
      await page.locator('#watchPanel').isVisible(),
      'Must be able to return to the explanation',
    );
    assert(await page.locator('#collectCard').isEnabled(), 'Collect card button must be enabled');
    await page.locator('#collectCard').click();
    assert(await page.locator('#cardPanel').isVisible(), 'Collect button must open the card');
    await page.locator('#collectionButton').click();
    await page.locator(`[data-open-card="${n}"]`).click();
    assert(
      await page.locator('#cardPanel').isVisible(),
      'Collection entry must reopen its lesson card',
    );
    await page.goto('/');
    await page.locator(`[data-lesson="${n}"]`).click();
    assert(
      await page.locator('#collectCard').isEnabled(),
      'Collect button must work from the first frame',
    );
    await page.locator('#collectCard').click();
    assert(
      await page.locator('#cardPanel').isVisible(),
      'First-frame collection must open the card',
    );
    await page.goto('/');
    await page.locator(`[data-lesson="${n}"]`).click();
    await page.locator('[data-stage="practice"]').click();
    await page.locator('#answerInput').fill('999');
    await page.locator('#answerForm button').click();
    assert(
      (await page.locator('#feedbackText').innerText()).includes('Пока не сходится'),
      'Wrong answer must be checked',
    );
    results.push({
      lesson: n,
      directPractice: true,
      directCard: true,
      collectWithoutWatching: true,
      returnAndCollection: true,
    });
  }
  return results;
};
