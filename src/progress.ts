import type { LessonId, Matrix } from './lessons';
import generateTask from './tasks';

export interface LessonProgress {
  viewed: number[];
  card: boolean;
  solved: number;
  task: {
    matrix: Matrix;
    solved: boolean;
  };
}

export type ProgressUpdate = (current: LessonProgress) => LessonProgress;

export const freshProgress = (lessonId: LessonId): LessonProgress => ({
  viewed: [0],
  card: false,
  solved: 0,
  task: { matrix: generateTask(lessonId, 0), solved: false },
});
