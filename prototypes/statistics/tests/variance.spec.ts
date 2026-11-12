import { expect, test } from '@playwright/test';
import {
  constrainedDeviations, describe, ensemble, enumerateSamples, observations, squaredDistance,
} from '../chapters/descriptive/model';

test('числовой пример и граничные случаи дисперсии', () => {
  const stats = describe(observations);
  expect(stats.mean).toBe(5);
  expect(stats.sumSquares).toBe(32);
  expect(stats.empiricalVariance).toBe(4);
  expect(stats.correctedVariance).toBeCloseTo(32 / 7, 12);
  expect(stats.standardDeviation).toBeCloseTo(Math.sqrt(32 / 7), 12);
  expect(describe([5, 5, 5]).correctedVariance).toBe(0);
  expect(describe([5]).correctedVariance).toBeNull();
  expect(describe([5]).standardDeviation).toBeNull();
  expect(() => describe([])).toThrow();
});

test('сдвиг центра добавляет n квадратов сдвига к минимальной сумме', () => {
  [-3, 0, 5, 6.25, 9].forEach((center) => {
    expect(squaredDistance(observations, center)).toBeCloseTo(32 + 8 * (center - 5) ** 2, 12);
  });
  [0, 0.2, 0.5, 0.8, 1].forEach((progress) => {
    expect(constrainedDeviations(progress).reduce((sum, value) => sum + value, 0)).toBe(0);
  });
});

test('точный перебор показывает смещение v и несмещённость s²', () => {
  expect(ensemble).toHaveLength(8);
  expect(new Set(ensemble.map((item) => item.values.join(','))).size).toBe(8);
  expect(ensemble.reduce((sum, item) => sum + item.empiricalVariance, 0) / 8)
    .toBeCloseTo(2 / 3, 12);
  expect(ensemble.reduce((sum, item) => sum + (item.correctedVariance ?? 0), 0) / 8)
    .toBeCloseTo(1, 12);
  // Independent distribution and sample size check the general identity.
  const samples = enumerateSamples([-1, 1, 3], 4).map(describe);
  expect(samples.reduce((sum, item) => sum + (item.correctedVariance ?? 0), 0) / 81)
    .toBeCloseTo(8 / 3, 12);
});

test('каждый шаг восстанавливается при перемотке и помещается по ширине', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/prototypes/statistics/');
  const seek = page.getByLabel('Время', { exact: true });
  const scene = page.locator('[data-scene]');
  const moments = [0, 5, 10, 16, 22, 28, 34, 41, 48, 55, 61, 62, 67, 72, 78, 84];
  // Playback checks are sequential because each seek changes the same page.
  // eslint-disable-next-line no-restricted-syntax
  for (const moment of moments) {
    // eslint-disable-next-line no-await-in-loop
    await test.step(`Кадр ${moment}`, async () => {
      await seek.fill(String(moment));
      const original = await scene.innerHTML();
      await seek.fill('0');
      await seek.fill(String(moment));
      expect(await scene.innerHTML()).toBe(original);
      const fits = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      );
      expect(fits).toBe(true);
      await expect(scene).not.toContainText('NaN');
    });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: '5. Все возможные выборки' }).click();
  await expect(page.getByText('Учтены первые 8 из 8', { exact: false })).toBeVisible();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(9);
  expect(errors).toEqual([]);
});
