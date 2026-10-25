import { expect, test } from '@playwright/test';
import { freshProgress, hasCheatSheet } from '../src/progress';

test('шпаргалка закрыта до второго верного решения', () => {
  const progress = freshProgress(2);
  expect(hasCheatSheet(progress)).toBe(false);
  expect(hasCheatSheet({ ...progress, solved: 1 })).toBe(false);
});

test('второе верное решение открывает шпаргалку выбранного параграфа', () => {
  const progress = freshProgress(2);
  expect(hasCheatSheet({ ...progress, solved: 2 })).toBe(true);
  expect(hasCheatSheet({ ...progress, solved: 3 })).toBe(true);
  expect(hasCheatSheet(freshProgress(3))).toBe(false);
});
