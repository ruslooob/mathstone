import { chapters as demoChapters } from './chapters/demo';
import type { Chapter } from './chapter';

/** The assembly owner connects content modules here after their issues are complete. */
const chapters: readonly Chapter[] = [...demoChapters];
export default chapters;
