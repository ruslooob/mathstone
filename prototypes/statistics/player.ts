import type { Chapter, ChapterInstance } from './chapter';
import {
  chapterDuration, chapterFrame, stepStarts, validateChapters,
} from './timeline';
import styles from './statistics.module.css';

function formatTime(time: number): string {
  const seconds = Math.floor(time);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Owns the only animation clock and all shell listeners. */
export default function createPlayer(root: HTMLElement, chapters: readonly Chapter[]): () => void {
  validateChapters(chapters);
  const lifetime = new AbortController();
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let chapter = chapters[0];
  let chapterLifetime = new AbortController();
  let instance: ChapterInstance;
  let time = 0;
  let speed = 1;
  let playing = false;
  let requestId = 0;
  let previousTimestamp: number | undefined;
  let currentStep = -1;

  root.setAttribute('class', styles.app);
  const template = document.createElement('template');
  template.innerHTML = `
    <header class="${styles.header}">
      <p class="${styles.eyebrow}">ЖИВАЯ ШПАРГАЛКА · ПРОТОТИП</p>
      <h1>Статистика</h1>
      <p>Вспомнить смысл. Проследить вычисление. Остановиться на формуле.</p>
    </header>
    <nav class="${styles.chapters}" aria-label="Главы"></nav>
    <section class="${styles.notebook}" tabindex="0" aria-label="Сцена главы">
      <div class="${styles.sceneHeading}">
        <span data-counter></span>
        <span>Статистика / заметки</span>
      </div>
      <h2 data-title></h2>
      <p data-step aria-live="polite" class="${styles.stepTitle}"></p>
      <div data-scene class="${styles.scene}"></div>
    </section>
    <section class="${styles.controls}" aria-label="Управление анимацией">
      <div class="${styles.seekRow}">
        <label for="statistics-seek">Время</label>
        <input id="statistics-seek" type="range" min="0" step="0.01" value="0" />
        <output for="statistics-seek" data-time></output>
      </div>
      <div class="${styles.buttons}">
        <div class="${styles.transport}">
          <button type="button" data-previous>Назад</button>
          <button type="button" data-play class="${styles.primary}">Пуск</button>
          <button type="button" data-next>Далее</button>
          <button type="button" data-restart>Сначала</button>
        </div>
        <div class="${styles.speed}">
          <label for="statistics-speed">Скорость</label>
          <select id="statistics-speed">
            <option value="0.5">0,5×</option><option value="1" selected>1×</option>
            <option value="1.5">1,5×</option><option value="2">2×</option>
          </select>
        </div>
      </div>
      <nav data-steps class="${styles.steps}" aria-label="Шаги главы"></nav>
      <p class="${styles.hint}" data-hint></p>
    </section>`;
  root.replaceChildren(template.content.cloneNode(true));

  function find<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Не найден элемент проигрывателя: ${selector}`);
    return element;
  }

  const host = find('[data-scene]');
  const navigation = find('nav');
  const steps = find('[data-steps]');
  const seek = find<HTMLInputElement>('#statistics-seek');
  const speedSelect = find<HTMLSelectElement>('#statistics-speed');
  const play = find<HTMLButtonElement>('[data-play]');
  const previous = find<HTMLButtonElement>('[data-previous]');
  const next = find<HTMLButtonElement>('[data-next]');
  const restart = find<HTMLButtonElement>('[data-restart]');
  const title = find('[data-title]');
  const stepTitle = find('[data-step]');
  const counter = find('[data-counter]');
  const timeLabel = find('[data-time]');
  const hint = find('[data-hint]');

  function render(): void {
    const frame = chapterFrame(chapter, time, media.matches);
    instance.render(frame);
    seek.value = String(time);
    seek.setAttribute('aria-valuetext', `${formatTime(time)} из ${formatTime(frame.duration)}`);
    timeLabel.textContent = `${formatTime(time)} / ${formatTime(frame.duration)}`;
    play.textContent = playing ? 'Пауза' : 'Пуск';
    play.disabled = media.matches;
    speedSelect.disabled = media.matches;
    previous.disabled = frame.stepIndex === 0;
    next.disabled = frame.stepIndex === chapter.steps.length - 1;
    if (currentStep !== frame.stepIndex) {
      currentStep = frame.stepIndex;
      stepTitle.textContent = chapter.steps[currentStep].title;
      counter.textContent = `ШАГ ${currentStep + 1} / ${chapter.steps.length}`;
      Array.from(steps.children).forEach((button, index) => {
        if (index === currentStep) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    }
    hint.textContent = media.matches
      ? 'Уменьшенное движение: готовые кадры. Используйте шаги или ползунок времени.'
      : 'На сцене: пробел — пуск или пауза, стрелки — шаги, Home — сначала, End — итог.';
  }

  function pause(): void {
    playing = false;
    cancelAnimationFrame(requestId);
    previousTimestamp = undefined;
  }

  function seekTo(value: number): void {
    pause();
    time = Math.max(0, Math.min(chapterDuration(chapter), value));
    render();
  }

  function tick(timestamp: number): void {
    if (!playing) return;
    if (previousTimestamp !== undefined) time += ((timestamp - previousTimestamp) / 1000) * speed;
    previousTimestamp = timestamp;
    if (time >= chapterDuration(chapter)) {
      time = chapterDuration(chapter);
      pause();
    }
    render();
    if (playing) requestId = requestAnimationFrame(tick);
  }

  function toggle(): void {
    if (media.matches || document.hidden) return;
    if (playing) pause();
    else {
      if (time >= chapterDuration(chapter)) time = 0;
      playing = true;
      previousTimestamp = undefined;
      requestId = requestAnimationFrame(tick);
    }
    render();
  }

  function moveStep(direction: number): void {
    const index = chapterFrame(chapter, time, media.matches).stepIndex;
    const target = Math.max(0, Math.min(chapter.steps.length - 1, index + direction));
    seekTo(stepStarts(chapter)[target]);
  }

  function selectChapter(selected: Chapter): void {
    pause();
    chapterLifetime.abort();
    instance?.dispose();
    host.replaceChildren();
    chapterLifetime = new AbortController();
    chapter = selected;
    time = 0;
    currentStep = -1;
    title.textContent = chapter.title;
    seek.max = String(chapterDuration(chapter));
    instance = chapter.mount(host, { signal: chapterLifetime.signal });
    steps.replaceChildren(...chapter.steps.map((step, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${index + 1}. ${step.title}`;
      button.addEventListener('click', () => seekTo(stepStarts(chapter)[index]), {
        signal: chapterLifetime.signal,
      });
      return button;
    }));
    Array.from(navigation.children).forEach((button) => {
      if ((button as HTMLButtonElement).value === chapter.id) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    render();
  }

  chapters.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.value = item.id;
    button.textContent = `${String(index + 1).padStart(2, '0')} · ${item.title}`;
    button.addEventListener('click', () => selectChapter(item), { signal: lifetime.signal });
    navigation.append(button);
  });
  play.addEventListener('click', toggle, { signal: lifetime.signal });
  previous.addEventListener('click', () => moveStep(-1), { signal: lifetime.signal });
  next.addEventListener('click', () => moveStep(1), { signal: lifetime.signal });
  restart.addEventListener('click', () => seekTo(0), { signal: lifetime.signal });
  seek.addEventListener('input', () => seekTo(Number(seek.value)), { signal: lifetime.signal });
  speedSelect.addEventListener('change', () => {
    speed = Number(speedSelect.value);
    previousTimestamp = undefined;
  }, { signal: lifetime.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pause(); render(); }
  }, { signal: lifetime.signal });
  media.addEventListener('change', () => { pause(); render(); }, { signal: lifetime.signal });
  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || (event.target as HTMLElement).closest('button, input, select, a, textarea, [contenteditable]')) return;
    const actions: Record<string, () => void> = {
      ' ': toggle,
      ArrowLeft: () => moveStep(-1),
      ArrowRight: () => moveStep(1),
      Home: () => seekTo(0),
      End: () => seekTo(chapterDuration(chapter)),
    };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  }, { signal: lifetime.signal });
  selectChapter(chapter);

  return () => {
    pause();
    lifetime.abort();
    chapterLifetime.abort();
    instance.dispose();
    root.replaceChildren();
  };
}
