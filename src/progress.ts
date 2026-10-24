export interface LessonProgress {
  viewed: number[];
  card: boolean;
  solved: number;
  hints: number[];
  completed: boolean;
}

export const freshProgress = (): LessonProgress => ({ viewed: [0], card: false, solved: 0, hints: [], completed: false });
