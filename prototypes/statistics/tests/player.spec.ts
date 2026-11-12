import { expect, test } from '@playwright/test';
import type { Chapter } from '../chapter';
import type createPlayer from '../player';

const url = '/prototypes/statistics/';

test('перемотка восстанавливает кадр, шаги и клавиатура доступны', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  const seek = page.getByLabel('Время', { exact: true });
  await expect(seek).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Пуск', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Далее', exact: true }).click();
  await expect(seek).toHaveValue('8');
  await seek.fill('14');
  const frame = await page.getByRole('img').evaluate((element) => element.outerHTML);
  await seek.fill('29');
  await expect(page.getByText('n = 3', { exact: false })).toBeVisible();
  await seek.fill('14');
  await expect(page.getByText('n = 3', { exact: false })).toHaveCount(0);
  expect(await page.getByRole('img').evaluate((element) => element.outerHTML)).toBe(frame);
  await page.getByRole('region', { name: 'Сцена главы' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(seek).toHaveValue('20');
  await page.keyboard.press('ArrowLeft');
  await expect(seek).toHaveValue('8');
  await page.keyboard.press('End');
  await expect(seek).toHaveValue('30');
  await page.keyboard.press('Home');
  await expect(seek).toHaveValue('0');
  await page.keyboard.press('Tab');
  await expect(seek).toBeFocused();
  expect(await seek.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fitsViewport).toBe(true);
  expect(errors).toEqual([]);
});

test('скорость, пауза, перезапуск и остановка в конце', async ({ page }) => {
  await page.clock.install();
  await page.goto(url);
  const seek = page.getByLabel('Время', { exact: true });
  await page.getByLabel('Скорость').selectOption('2');
  await page.getByRole('button', { name: 'Пуск', exact: true }).click();
  await page.clock.runFor(1000);
  expect(Number(await seek.inputValue())).toBeCloseTo(2, 0);
  await page.getByRole('button', { name: 'Пауза', exact: true }).click();
  const paused = await seek.inputValue();
  await page.clock.runFor(2000);
  await expect(seek).toHaveValue(paused);
  await seek.fill('29');
  await page.getByRole('button', { name: 'Пуск', exact: true }).click();
  await page.clock.runFor(1000);
  await expect(seek).toHaveValue('30');
  await expect(page.getByRole('button', { name: 'Пуск', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Сначала', exact: true }).click();
  await expect(seek).toHaveValue('0');
});

test('скрытие вкладки останавливает часы без автоматического продолжения', async ({ page }) => {
  await page.clock.install();
  await page.goto(url);
  await page.getByRole('button', { name: 'Пуск', exact: true }).click();
  await page.clock.runFor(1000);
  // Headless tabs stay visible. Emulate the browser visibility event.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const seek = page.getByLabel('Время', { exact: true });
  const paused = await seek.inputValue();
  await page.clock.runFor(3000);
  await expect(seek).toHaveValue(paused);
  await expect(page.getByRole('button', { name: 'Пуск', exact: true })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(1000);
  await expect(seek).toHaveValue(paused);
});

test('уменьшенное движение показывает завершённые шаги', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Пуск', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Далее', exact: true }).click();
  const first = await page.getByRole('img').evaluate((element) => element.outerHTML);
  await page.getByLabel('Время', { exact: true }).fill('16');
  expect(await page.getByRole('img').evaluate((element) => element.outerHTML)).toBe(first);
  await page.getByRole('button', { name: 'Далее', exact: true }).click();
  await expect(page.getByText('n = 3', { exact: false })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByRole('button', { name: 'Пуск', exact: true })).toBeEnabled();
});

test('смена главы освобождает ресурсы и запускает новую главу на паузе', async ({ page }) => {
  await page.goto(url);
  await page.evaluate(async () => {
    // Dynamic URL import is served by Vite. These chapters exist only inside this test.
    const moduleUrl = '/prototypes/statistics/player.ts';
    const { default: mount } = await import(moduleUrl) as { default: typeof createPlayer };
    const root = document.createElement('main');
    document.body.replaceChildren(root);
    const makeChapter = (id: string): Chapter => ({
      id,
      title: id,
      resources: [],
      steps: [{ id: 'start', title: 'Первый шаг', duration: 5 }],
      mount(host, { signal }) {
        document.addEventListener('probe', () => {
          document.body.dataset.listener = `${document.body.dataset.listener ?? ''}${id}`;
        }, { signal });
        return {
          render: (frame) => { host.replaceChildren(document.createTextNode(`${id}: ${frame.time}`)); },
          dispose: () => { document.body.dataset.disposed = `${id}:${signal.aborted}`; },
        };
      },
    });
    const dispose = mount(root, [makeChapter('Первая'), makeChapter('Вторая')]);
    document.addEventListener('dispose-player', dispose, { once: true });
  });
  await page.getByRole('button', { name: 'Пуск', exact: true }).click();
  await page.getByRole('button', { name: '02 · Вторая' }).click();
  await expect(page.getByLabel('Время', { exact: true })).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Пуск', exact: true })).toBeVisible();
  expect(await page.evaluate(() => {
    document.dispatchEvent(new Event('probe'));
    return { ...document.body.dataset };
  })).toEqual({ disposed: 'Первая:true', listener: 'Вторая' });
  await page.evaluate(() => {
    document.dispatchEvent(new Event('dispose-player'));
    delete document.body.dataset.listener;
    document.dispatchEvent(new Event('probe'));
  });
  expect(await page.evaluate(() => ({ ...document.body.dataset }))).toEqual({ disposed: 'Вторая:true' });
});
