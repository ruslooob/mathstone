import { expect, test } from '@playwright/test';
import { determinant } from '../src/paragraphs';

test('определитель 2×2: положительные элементы, отрицательные элементы и ноль', () => {
  expect(determinant([[3, 2], [1, 4]])).toBe(10);
  expect(determinant([[2, -1], [-3, -4]])).toBe(-11);
  expect(determinant([[0, 2], [0, 4]])).toBe(0);
});

test('определитель 3×3: известный пример, отрицательные элементы и зависимые строки', () => {
  expect(determinant([[2, 1, 3], [1, 0, 2], [3, 2, 1]])).toBe(3);
  expect(determinant([[-2, 1, 0], [0, 3, 1], [1, 0, 2]])).toBe(-11);
  expect(determinant([[1, 2, 3], [2, 4, 6], [0, 1, 1]])).toBe(0);
});
