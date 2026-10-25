import { expect, test } from '@playwright/test';
import { freshProgress, hasCheatSheet, restoreProgress } from '../src/progress';

test('шпаргалка закрыта до пятого верного решения', () => {
  const progress = freshProgress(2);
  expect(hasCheatSheet(progress)).toBe(false);
  expect(hasCheatSheet({ ...progress, solved: 4 })).toBe(false);
});

test('пятое верное решение открывает только шпаргалку выбранного параграфа', () => {
  const progress = freshProgress(2);
  expect(hasCheatSheet({ ...progress, solved: 5 })).toBe(true);
  expect(hasCheatSheet({ ...progress, solved: 6 })).toBe(true);
  expect(hasCheatSheet(freshProgress(3))).toBe(false);
});

test('сохранение восстанавливает независимый прогресс и уже засчитанную задачу', () => {
  const progress = {
    2: { ...freshProgress(2), solved: 3 },
    3: {
      ...freshProgress(3),
      solved: 5,
      task: { matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], solved: true },
    },
  };
  const restored = restoreProgress(JSON.stringify({ version: 1, progress }));
  expect(restored).toEqual(progress);
  expect(hasCheatSheet(restored[2])).toBe(false);
  expect(hasCheatSheet(restored[3])).toBe(true);
});

test('повреждённое сохранение не мешает начать практику', () => {
  expect(restoreProgress('{broken')[2].solved).toBe(0);
  const progress = {
    2: { ...freshProgress(2), solved: -1 }, 3: { ...freshProgress(3), solved: 2 },
  };
  const restored = restoreProgress(JSON.stringify({ version: 1, progress }));
  expect(restored[2].solved).toBe(0);
  expect(restored[3].solved).toBe(2);
});
