import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import ui from './ui.module.css';
import styles from './App.module.css';
import Inventory from './Inventory';
import ParagraphView from './ParagraphView';
import { paragraphIds, paragraphs } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import { freshProgress, hasCheatSheet } from './progress';
import type { ParagraphProgress, ProgressUpdate } from './progress';

function paragraphStatus(id: ParagraphId, progress: ParagraphProgress) {
  if (hasCheatSheet(progress)) return '✓';
  return id === 2 ? '01' : '02';
}

export default function App() {
  const [selection, setSelection] = useState({
    id: 2 as ParagraphId, revision: 0, showCheatSheet: false,
  });
  const [progress, setProgress] = useState<Record<ParagraphId, ParagraphProgress>>(() => ({
    2: freshProgress(2),
    3: freshProgress(3),
  }));
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const announcedCheatSheets = useRef(new Set<ParagraphId>());
  const paragraphId = selection.id;
  const total = progress[2].solved + progress[3].solved;

  const updateProgress = useCallback((id: ParagraphId, update: ProgressUpdate) => {
    setProgress((current) => ({ ...current, [id]: update(current[id]) }));
  }, []);
  const markViewed = useCallback((id: ParagraphId, step: number) => {
    setProgress((current) => (current[id].viewed.includes(step)
      ? current
      : { ...current, [id]: { ...current[id], viewed: [...current[id].viewed, step] } }));
  }, []);

  function switchParagraph(id: ParagraphId, showCheatSheet = false) {
    setSelection((current) => ({ id, revision: current.revision + 1, showCheatSheet }));
  }

  useEffect(() => {
    paragraphIds.forEach((id) => {
      if (hasCheatSheet(progress[id]) && !announcedCheatSheets.current.has(id)) {
        announcedCheatSheets.current.add(id);
        setToast({ message: `Шпаргалка ${id} × ${id} добавлена в инвентарь.` });
      }
    });
  }, [progress]);

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
            switchParagraph(2);
          }}
        >
          Mathstone
        </a>
        <button
          type="button"
          className={styles.inventoryTrigger}
          id="inventoryButton"
          onClick={() => setInventoryOpen(true)}
        >
          Мои шпаргалки
          {' '}
          <span id="cheatSheetCount">
            {paragraphIds.filter((id) => hasCheatSheet(progress[id])).length}
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
          <nav className={styles.paragraphList} aria-label="Параграфы">
            {paragraphIds.map((id) => (
              <button
                type="button"
                key={id}
                className={`${styles.paragraphButton}${paragraphId === id ? ` ${styles.active}` : ''}`}
                data-paragraph={id}
                aria-current={paragraphId === id ? 'page' : 'false'}
                onClick={() => switchParagraph(id)}
              >
                <span className={ui.paragraphSymbol}>
                  {id}
                  <span>×</span>
                  {id}
                </span>
                <span className={styles.paragraphCopy}>
                  <strong>{paragraphs[id].name}</strong>
                  <small>
                    {`Определитель ${id} × ${id}`}
                  </small>
                </span>
                <span className={styles.paragraphStatus} id={`status${id}`}>
                  {paragraphStatus(id, progress[id])}
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
        <ParagraphView
          key={selection.revision}
          paragraphId={paragraphId}
          initialCheatSheet={selection.showCheatSheet}
          progress={progress[paragraphId]}
          inventoryOpen={inventoryOpen}
          onProgress={updateProgress}
          onViewed={markViewed}
        />
      </div>
      <Inventory
        open={inventoryOpen}
        progress={progress}
        onClose={() => setInventoryOpen(false)}
        onCheatSheet={(id) => switchParagraph(id, true)}
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
