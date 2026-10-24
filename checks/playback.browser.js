// Browser regression check. Run this function with a Playwright page on the local app.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  await page.goto('http://127.0.0.1:8766');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  const results = [];
  for (const n of [2, 3]) {
    await page.locator('[data-lesson="' + n + '"]').click();
    await page.locator('#playButton').click();
    const start = await page.locator('#frameCounter').innerText();
    assert(start.startsWith('02'), n + '×' + n + ': Play must immediately start the first calculation, got ' + start);
    const motion = await page.locator('#mainDiagram').evaluate(element =>
      element.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'));
    assert(motion, n + '×' + n + ': no actual diagram animation is running');
    await page.clock.fastForward(1000);
    await page.locator('#playButton').click();
    const paused = await page.locator('#frameCounter').innerText();
    await page.clock.fastForward(10000);
    assert(await page.locator('#frameCounter').innerText() === paused, 'Pause must stop progression');
    await page.locator('#playButton').click();
    const frameCount = n === 2 ? 4 : 8;
    for (let i = 2; i < frameCount; i++) {
      await page.clock.fastForward(5000);
      const counter = await page.locator('#frameCounter').innerText();
      assert(counter.startsWith(String(i + 1).padStart(2, '0')), 'Playback did not advance: ' + counter);
    }
    assert(await page.locator('#playButton').getAttribute('aria-label') === 'Запустить анимацию', 'Playback must stop at the final frame');
    assert(await page.locator('#collectCard').isEnabled(), 'Finished playback must unlock the card');
    results.push({lesson: n, immediateMotion: true, pauseAndResume: true, automaticCompletion: true});
  }
  await page.clock.resume();
  return results;
}
