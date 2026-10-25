import { paragraphIds } from './paragraphs';
import type { ParagraphId, Matrix } from './paragraphs';
import generateTask from './tasks';

export interface ParagraphProgress {
  viewed: number[];
  solved: number;
  task: {
    matrix: Matrix;
    solved: boolean;
    submittedAnswer?: string;
  };
}

export type ProgressUpdate = (current: ParagraphProgress) => ParagraphProgress;

export type Progress = Record<ParagraphId, ParagraphProgress>;

export const progressStorageKey = 'mathstone.progress.v1';
export const solutionsForCheatSheet = 5;

export function hasCheatSheet(progress: ParagraphProgress): boolean {
  return progress.solved >= solutionsForCheatSheet;
}

export const freshProgress = (paragraphId: ParagraphId): ParagraphProgress => ({
  viewed: [0],
  solved: 0,
  task: { matrix: generateTask(paragraphId, 0), solved: false },
});

function isParagraphProgress(value: unknown, id: ParagraphId): value is ParagraphProgress {
  if (!value || typeof value !== 'object') return false;
  if (!('solved' in value) || !Number.isSafeInteger(value.solved)
    || typeof value.solved !== 'number' || value.solved < 0) return false;
  if (!('viewed' in value) || !Array.isArray(value.viewed)
    || !value.viewed.every((step) => Number.isInteger(step) && step >= 0)) return false;
  if (!('task' in value) || !value.task || typeof value.task !== 'object') return false;
  const { task } = value;
  return 'solved' in task && typeof task.solved === 'boolean'
    && (!('submittedAnswer' in task) || typeof task.submittedAnswer === 'string')
    && (!task.solved || value.solved > 0)
    && 'matrix' in task && Array.isArray(task.matrix) && task.matrix.length === id
    && task.matrix.every((row) => Array.isArray(row) && row.length === id
      && row.every((element) => Number.isSafeInteger(element)));
}

export function restoreProgress(serialized: string | null): Progress {
  const progress: Progress = { 2: freshProgress(2), 3: freshProgress(3) };
  try {
    const saved: unknown = JSON.parse(serialized ?? 'null');
    if (!saved || typeof saved !== 'object' || !('version' in saved) || saved.version !== 1
      || !('progress' in saved) || !saved.progress || typeof saved.progress !== 'object') {
      return progress;
    }
    const stored = saved.progress as Record<string, unknown>;
    paragraphIds.forEach((id) => {
      const value = stored[id];
      if (isParagraphProgress(value, id)) progress[id] = value;
    });
  } catch {
    return progress;
  }
  return progress;
}
