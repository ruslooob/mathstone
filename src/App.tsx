import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import ui from './ui.module.css';
import styles from './App.module.css';
import Inventory from './Inventory';
import type { InventoryView } from './Inventory';
import ParagraphView from './ParagraphView';
import { paragraphIds, paragraphs } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import { hasCheatSheet, progressStorageKey, restoreProgress } from './progress';
import type { ParagraphProgress, ProgressUpdate } from './progress';

function paragraphStatus(id: ParagraphId, progress: ParagraphProgress) {
  if (hasCheatSheet(progress)) return '✓';
  return id === 2 ? '01' : '02';
}

export default function App() {
  const [selection, setSelection] = useState({
    id: 2 as ParagraphId, revision: 0,
  });
  const [progress, setProgress] = useState(() => {
    try {
      return restoreProgress(localStorage.getItem(progressStorageKey));
    } catch {
      return restoreProgress(null);
    }
  });
  const [inventory, setInventory] = useState<InventoryView | null>(null);
  const announcedCheatSheets = useRef(new Set(
    paragraphIds.filter((id) => hasCheatSheet(progress[id])),
  ));
  const paragraphId = selection.id;

  const updateProgress = useCallback((id: ParagraphId, update: ProgressUpdate) => {
    setProgress((current) => ({ ...current, [id]: update(current[id]) }));
  }, []);
  const markViewed = useCallback((id: ParagraphId, step: number) => {
    setProgress((current) => (current[id].viewed.includes(step)
      ? current
      : { ...current, [id]: { ...current[id], viewed: [...current[id].viewed, step] } }));
  }, []);

  function switchParagraph(id: ParagraphId) {
    setSelection((current) => ({ id, revision: current.revision + 1 }));
  }

  useEffect(() => {
    paragraphIds.forEach((id) => {
      if (hasCheatSheet(progress[id]) && !announcedCheatSheets.current.has(id)) {
        announcedCheatSheets.current.add(id);
        setInventory({ page: 'reward', paragraphId: id });
      }
    });
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify({ version: 1, progress }));
    } catch {
      // Practice remains available when the browser cannot save progress.
    }
  }, [progress]);

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
          onClick={() => setInventory({ page: 'list' })}
        >
          Мои шпаргалки
        </button>
      </header>
      <div className={styles.appLayout}>
        <aside className={styles.sidebar}>
          <div className={`${ui.eyebrow} ${styles.chapterIndex}`}>МАТЕМАТИКА / ГЛАВА 01</div>
          <h1 className={styles.chapterTitle}>
            Определители
            <br />
            матриц
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
        </aside>
        <ParagraphView
          key={selection.revision}
          paragraphId={paragraphId}
          progress={progress[paragraphId]}
          inventoryOpen={inventory !== null}
          onProgress={updateProgress}
          onViewed={markViewed}
        />
      </div>
      <Inventory
        view={inventory}
        progress={progress}
        onClose={() => setInventory(null)}
        onBack={() => setInventory({ page: 'list' })}
        onCheatSheet={(id) => setInventory({ page: 'sheet', paragraphId: id })}
      />
    </>
  );
}
