import { chapters as descriptiveChapters } from './chapters/descriptive';
import type { Chapter } from './chapter';

/** The assembly owner connects content modules here after their issues are complete. */
const chapters: readonly Chapter[] = [...descriptiveChapters];
export default chapters;
