import { useCallback, useEffect, useState } from 'react';
import ui from './ui.module.css';
import styles from './App.module.css';
import Collection from './Collection';
import LessonView from './LessonView';
import { lessonIds, lessons } from './lessons';
import type { LessonId } from './lessons';
import { freshProgress } from './progress';
import type { LessonProgress, ProgressUpdate } from './progress';

function lessonStatus(id: LessonId, progress: LessonProgress) {
  if (progress.card) return '▱';
  return id === 2 ? '01' : '02';
}

export default function App() {
  const [selection, setSelection] = useState({ id: 2 as LessonId, revision: 0, card: false });
  const [progress, setProgress] = useState<Record<LessonId, LessonProgress>>(() => ({
    2: freshProgress(2),
    3: freshProgress(3),
  }));
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const lessonId = selection.id;
  const total = progress[2].solved + progress[3].solved;

  const updateProgress = useCallback((id: LessonId, update: ProgressUpdate) => {
    setProgress((current) => ({ ...current, [id]: update(current[id]) }));
  }, []);
  const markViewed = useCallback((id: LessonId, step: number) => {
    setProgress((current) => (current[id].viewed.includes(step)
      ? current
      : { ...current, [id]: { ...current[id], viewed: [...current[id].viewed, step] } }));
  }, []);

  function switchLesson(id: LessonId, card = false) {
    setSelection((current) => ({ id, revision: current.revision + 1, card }));
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <header className={styles.topbar}>
        <a
          className={styles.brand}
          href="/"
          aria-label="Mathstone, на главную"
          onClick={(event) => {
            event.preventDefault();
            switchLesson(2);
          }}
        >
          Mathstone
        </a>
        <button
          type="button"
          className={styles.collectionTrigger}
          id="collectionButton"
          onClick={() => setCollectionOpen(true)}
        >
          <span aria-hidden="true">▱</span>
          {' '}
          Мои шпаргалки
          {' '}
          <span id="cardCount">
            {Number(progress[2].card) + Number(progress[3].card)}
            {' '}
            / 2
          </span>
        </button>
      </header>
      <div className={styles.appLayout}>
        <aside className={styles.sidebar}>
          <div className={`${ui.eyebrow} ${styles.chapterIndex}`}>МАТЕМАТИКА / ГЛАВА 01</div>
          <h1 className={styles.chapterTitle}>
            Определители
            <br />
            матриц
            <span className={styles.titleDot}>.</span>
          </h1>
          <nav className={styles.lessonList} aria-label="Уроки">
            {lessonIds.map((id) => (
              <button
                type="button"
                key={id}
                className={`${styles.lessonButton}${lessonId === id ? ` ${styles.active}` : ''}`}
                data-lesson={id}
                aria-current={lessonId === id ? 'page' : 'false'}
                onClick={() => switchLesson(id)}
              >
                <span className={ui.lessonSymbol}>
                  {id}
                  <span>×</span>
                  {id}
                </span>
                <span className={styles.lessonCopy}>
                  <strong>{lessons[id].name}</strong>
                  <small>
                    {`Определитель ${id} × ${id}`}
                  </small>
                </span>
                <span className={styles.lessonStatus} id={`status${id}`}>
                  {lessonStatus(id, progress[id])}
                </span>
              </button>
            ))}
          </nav>
          <div className={styles.journey}>
            <div className={styles.journeyTop}>
              <span>ТВОЙ ПУТЬ</span>
              <span id="totalProgress">
                {total}
                {' '}
                задач
              </span>
            </div>
          </div>
        </aside>
        <LessonView
          key={selection.revision}
          lessonId={lessonId}
          initialCard={selection.card}
          progress={progress[lessonId]}
          collectionOpen={collectionOpen}
          onProgress={updateProgress}
          onViewed={markViewed}
          onToast={(message) => setToast({ message })}
        />
      </div>
      <Collection
        open={collectionOpen}
        progress={progress}
        onClose={() => setCollectionOpen(false)}
        onCard={(id) => switchLesson(id, true)}
      />
      <div
        id="toast"
        className={`${styles.toast}${toast ? ` ${styles.visible}` : ''}`}
        role="status"
        aria-live="polite"
      >
        {toast?.message}
      </div>
    </>
  );
}
