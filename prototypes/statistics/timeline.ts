import type { Chapter, ChapterFrame } from './chapter';

export function stepStarts(chapter: Chapter): number[] {
  let elapsed = 0;
  return chapter.steps.map((step) => {
    const start = elapsed;
    elapsed += step.duration;
    return start;
  });
}

export function chapterDuration(chapter: Chapter): number {
  return chapter.steps.reduce((total, step) => total + step.duration, 0);
}

export function chapterFrame(chapter: Chapter, time: number, reducedMotion: boolean): ChapterFrame {
  const duration = chapterDuration(chapter);
  const boundedTime = Math.max(0, Math.min(duration, time));
  const starts = stepStarts(chapter);
  const stepIndex = starts.reduce((current, start, index) => (
    start <= boundedTime ? index : current
  ), 0);
  const stepTime = boundedTime - starts[stepIndex];
  return {
    time: boundedTime,
    duration,
    stepIndex,
    stepTime,
    stepProgress: stepTime / chapter.steps[stepIndex].duration,
    reducedMotion,
  };
}

/** Reject malformed chapter metadata before starting playback. */
export function validateChapters(chapters: readonly Chapter[]): void {
  const ids = new Set<string>();
  if (!chapters.length) throw new Error('Добавьте хотя бы одну главу в реестр.');
  chapters.forEach((chapter) => {
    if (!chapter.id || ids.has(chapter.id) || !chapter.steps.length) {
      throw new Error(`Проверьте идентификатор и шаги главы: ${chapter.id}`);
    }
    ids.add(chapter.id);
    const stepIds = new Set<string>();
    chapter.steps.forEach((step) => {
      if (!step.id || stepIds.has(step.id) || !Number.isFinite(step.duration)
        || step.duration <= 0) throw new Error(`Проверьте шаг: ${chapter.id}/${step.id}`);
      stepIds.add(step.id);
    });
  });
}
