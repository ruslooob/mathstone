export type LessonId = 2 | 3;
export type Matrix = readonly (readonly number[])[];
export type Sign = 'positive' | 'negative';
export interface DiagramPath {
  indexes: readonly number[];
  sign: Sign;
}
interface Lesson {
  title: readonly [string, string];
  name: string;
  description: readonly [string, string];
  example: Matrix;
  positive: readonly (readonly number[])[];
  negative: readonly (readonly number[])[];
  tasks: readonly Matrix[];
}
export interface Frame {
  kicker: string;
  title: string;
  text: string;
  paths: DiagramPath[];
  expression: string;
  result?: number;
  negative?: boolean;
}

export const lessonIds: readonly LessonId[] = [2, 3];
export const lessons: Record<LessonId, Lesson> = {
  2: {
    title: ['Две диагонали.', 'Один ответ.'],
    name: 'Две диагонали',
    description: ['Посмотри, как устроен приём.', 'Потом повторишь его сам.'],
    example: [
      [3, 2],
      [1, 4],
    ],
    positive: [[0, 3]],
    negative: [[1, 2]],
    tasks: [
      [
        [2, 3],
        [1, 4],
      ],
      [
        [4, 2],
        [3, 1],
      ],
      [
        [2, -1],
        [3, 4],
      ],
    ],
  },
  3: {
    title: ['Три тройки в плюс.', 'Три — в минус.'],
    name: 'Правило треугольников',
    description: ['Шесть произведений.', 'Одна наглядная схема.'],
    example: [
      [2, 1, 3],
      [1, 0, 2],
      [3, 2, 1],
    ],
    positive: [
      [0, 4, 8],
      [1, 5, 6],
      [2, 3, 7],
    ],
    negative: [
      [2, 4, 6],
      [0, 5, 7],
      [1, 3, 8],
    ],
    tasks: [
      [
        [1, 2, 0],
        [0, 3, 1],
        [2, 0, 1],
      ],
      [
        [2, 0, 1],
        [1, 3, 0],
        [0, 2, 1],
      ],
      [
        [1, 2, 3],
        [2, 4, 6],
        [0, 1, 1],
      ],
    ],
  },
};

export function determinant(matrix: Matrix): number {
  if (matrix.length === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  return (
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1])
    - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0])
    + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
  );
}

export const numberText = (value: number): string => String(value).replace(/-/g, '−');
const factorText = (value: number): string => (value < 0 ? `(${numberText(value)})` : numberText(value));
function productOf(flat: readonly number[], indexes: readonly number[]): number {
  return indexes.reduce((value, i) => value * flat[i], 1);
}

export function framesFor(lessonId: LessonId): Frame[] {
  const lesson = lessons[lessonId];
  const flat = lesson.example.flat();
  const frames: Frame[] = [
    {
      kicker: 'НАЧНЁМ С ЗАДАЧИ',
      title: 'Ищем одно число',
      text: `Определитель — число, которое вычисляют по элементам квадратной матрицы. Сейчас покажем способ для ${lessonId} × ${lessonId}.`,
      paths: [],
      expression: 'det A = ?',
    },
  ];
  lesson.positive.forEach((indexes, i) => {
    const tripleTitle = i === 0
      ? 'Первая тройка — диагональ'
      : 'Следующая тройка — треугольник';
    const tripleText = i === 0
      ? 'Перемножь три выделенных числа. Это первое слагаемое со знаком «+».'
      : 'Перемножь числа в трёх вершинах выделенного треугольника. Прибавь это произведение.';
    frames.push({
      kicker: lessonId === 2 ? 'ШАГ 01 · ПЛЮС' : `ПЛЮС · ТРОЙКА ${i + 1} ИЗ 3`,
      title: lessonId === 2 ? 'Главная диагональ' : tripleTitle,
      text:
        lessonId === 2
          ? 'Перемножь два числа на диагонали сверху слева вниз направо.'
          : tripleText,
      paths: [{ indexes, sign: 'positive' }],
      expression: `${indexes.map((j) => factorText(flat[j])).join(' × ')} = ${numberText(productOf(flat, indexes))}`,
    });
  });
  lesson.negative.forEach((indexes, i) => {
    const tripleTitle = i === 0 ? 'Теперь другая диагональ' : 'Ещё один треугольник';
    const tripleText = i === 0
      ? 'Перемножь три выделенных числа. Это произведение и два следующих нужно вычесть.'
      : 'Перемножь числа в вершинах оранжевого треугольника. Это произведение тоже вычитается.';
    frames.push({
      kicker: lessonId === 2 ? 'ШАГ 02 · МИНУС' : `МИНУС · ТРОЙКА ${i + 1} ИЗ 3`,
      title:
        lessonId === 2 ? 'Вторая диагональ' : tripleTitle,
      text:
        lessonId === 2
          ? 'Перемножь числа на второй диагонали. Это произведение нужно вычесть.'
          : tripleText,
      paths: [{ indexes, sign: 'negative' }],
      negative: true,
      expression: `${indexes.map((j) => factorText(flat[j])).join(' × ')} = ${numberText(productOf(flat, indexes))}`,
    });
  });
  frames.push({
    kicker: 'СОБИРАЕМ ОТВЕТ',
    title: lessonId === 2 ? 'Первое минус второе' : 'Складываем и вычитаем',
    text:
      lessonId === 2
        ? 'Из произведения на зелёной диагонали вычти произведение на оранжевой. Получился определитель.'
        : 'Сложи три зелёных произведения и вычти три оранжевых. Так работает правило треугольников для матрицы 3 × 3.',
    paths: [],
    expression: `${lesson.positive.map((p) => factorText(productOf(flat, p))).join(' + ')} − ${lesson.negative.map((p) => factorText(productOf(flat, p))).join(' − ')} = `,
    result: determinant(lesson.example),
  });
  return frames;
}
