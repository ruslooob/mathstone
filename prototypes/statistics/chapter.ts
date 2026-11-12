/** All times are seconds. Step durations must be positive and finite. */
export interface ChapterStep {
  readonly id: string;
  readonly title: string;
  readonly duration: number;
}

export interface ChapterFrame {
  readonly time: number;
  readonly duration: number;
  readonly stepIndex: number;
  readonly stepTime: number;
  readonly stepProgress: number;
  /** Render the complete current step without continuous movement when true. */
  readonly reducedMotion: boolean;
}

export interface ChapterContext {
  /** Use this signal for listeners and fetches. The shell aborts it before dispose. */
  readonly signal: AbortSignal;
}

export interface ChapterInstance {
  /** Render from absolute time. Never depend on a previous frame or start a timer. */
  render(frame: ChapterFrame): void;
  /** Release resources outside host, including observers and object URLs. */
  dispose(): void;
}

export interface Chapter {
  /** Unique across the registry. Keep this ID stable when editing the title. */
  readonly id: string;
  readonly title: string;
  readonly steps: readonly [ChapterStep, ...ChapterStep[]];
  /** Local asset URLs only. Imports and in-memory data do not need declarations. */
  readonly resources: readonly string[];
  /** Own only host descendants. Create a new instance on every chapter selection. */
  mount(host: HTMLElement, context: ChapterContext): ChapterInstance;
}
