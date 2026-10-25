import type { ParagraphId, Matrix } from './paragraphs';
import generateTask from './tasks';

export interface ParagraphProgress {
  viewed: number[];
  solved: number;
  task: {
    matrix: Matrix;
    solved: boolean;
  };
}

export type ProgressUpdate = (current: ParagraphProgress) => ParagraphProgress;

export const solutionsForCheatSheet = 2;

export function hasCheatSheet(progress: ParagraphProgress): boolean {
  return progress.solved >= solutionsForCheatSheet;
}

export const freshProgress = (paragraphId: ParagraphId): ParagraphProgress => ({
  viewed: [0],
  solved: 0,
  task: { matrix: generateTask(paragraphId, 0), solved: false },
});
