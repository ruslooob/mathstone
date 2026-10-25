import { lessons } from './lessons';
import type { LessonId, Matrix } from './lessons';

const arithmeticLimit = 99;

function boundedSums(terms: readonly number[]): boolean {
  let sum = 0;
  return terms.every((term) => {
    sum += term;
    return Math.abs(sum) <= arithmeticLimit;
  });
}

function withinArithmeticLimit(matrix: Matrix, lessonId: LessonId): boolean {
  const flat = matrix.flat();
  const products = [lessons[lessonId].positive, lessons[lessonId].negative].map((paths) => (
    paths.map((indexes) => indexes.reduce((product, index) => product * flat[index], 1))
  ));
  const [positive, negative] = products;
  return products.flat().every((product) => Math.abs(product) <= arithmeticLimit)
    && boundedSums(positive)
    && boundedSums(negative)
    && boundedSums([...positive, ...negative.map((product) => -product)]);
}

function randomMatrix(size: LessonId, maximum: number, signed: boolean): Matrix {
  const minimum = signed ? -maximum : 0;
  return Array.from({ length: size }, () => (
    Array.from({ length: size }, () => (
      minimum + Math.floor(Math.random() * (maximum - minimum + 1))
    ))
  ));
}

export default function generateTask(lessonId: LessonId, solved: number): Matrix {
  // Difficulty uses four-answer steps and stays capped after 28 correct answers.
  const level = Math.min(Math.floor(solved / 4), 7);
  const maximum = lessonId === 2 ? level + 2 : Math.floor(level / 2) + 2;
  const signed = level >= 2;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const matrix = randomMatrix(lessonId, maximum, signed);
    if (withinArithmeticLimit(matrix, lessonId)) return matrix;
  }
  // With entries at most 2 in magnitude, even six triple products sum to at most 48.
  return randomMatrix(lessonId, 2, signed);
}
