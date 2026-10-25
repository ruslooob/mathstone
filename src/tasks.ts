import type { ParagraphId, Matrix } from './paragraphs';

const maximums = [9, 12, 15, 20, 25, 30, 40, 50, 65, 80, 99];

export default function generateTask(paragraphId: ParagraphId, solved: number): Matrix {
  const answersPerLevel = paragraphId === 2 ? 4 : 6;
  const level = Math.min(Math.floor(solved / answersPerLevel), maximums.length - 1);
  const maximum = maximums[level];
  const negativeChance = Math.min(level, 5) / 10;
  const matrix = Array.from({ length: paragraphId }, () => (
    Array.from({ length: paragraphId }, () => {
      const magnitude = 1 + Math.floor(Math.random() * maximum);
      return Math.random() < negativeChance ? -magnitude : magnitude;
    })
  ));
  // A task can contain at most one zero, regardless of the difficulty level.
  if (Math.random() < 0.1) {
    matrix[Math.floor(Math.random() * paragraphId)][Math.floor(Math.random() * paragraphId)] = 0;
  }
  return matrix;
}
