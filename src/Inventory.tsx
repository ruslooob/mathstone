import { useEffect, useRef } from 'react';
import ui from './ui.module.css';
import styles from './Inventory.module.css';
import { paragraphIds, paragraphs } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import type { ParagraphProgress } from './progress';
import { hasCheatSheet, solutionsForCheatSheet } from './progress';

interface Props {
  open: boolean;
  progress: Record<ParagraphId, ParagraphProgress>;
  onClose: () => void;
  onCheatSheet: (paragraphId: ParagraphId) => void;
}

export default function Inventory({
  open, progress, onClose, onCheatSheet,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  const earned = paragraphIds.filter((paragraphId) => hasCheatSheet(progress[paragraphId]));
  return (
    <dialog className={styles.dialog} ref={ref} id="inventoryDialog" onClose={onClose}>
      <div className={styles.dialogTop}>
        <div>
          <div className={ui.eyebrow}>ТВОИ ПРИЁМЫ</div>
          <h2>Шпаргалки</h2>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          id="closeInventory"
          aria-label="Закрыть шпаргалки"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div id="inventoryContent">
        {earned.length ? (
          earned.map((paragraphId) => (
            <article className={styles.inventoryEntry} key={paragraphId}>
              <span className={`${ui.paragraphSymbol} ${styles.entrySymbol}`}>
                {paragraphId}
                <span>×</span>
                {paragraphId}
              </span>
              <div>
                <h3>{paragraphs[paragraphId].name}</h3>
                <p>
                  {`Шпаргалка получена · решено задач: ${progress[paragraphId].solved}`}
                </p>
              </div>
              <button
                type="button"
                className={ui.secondaryButton}
                data-open-cheat-sheet={paragraphId}
                onClick={() => {
                  onClose();
                  onCheatSheet(paragraphId);
                }}
              >
                Открыть ↗
              </button>
            </article>
          ))
        ) : (
          <div className={styles.emptyInventory}>
            Здесь появятся твои шпаргалки.
            <br />
            {`Реши ${solutionsForCheatSheet} задачи в одном параграфе, чтобы получить шпаргалку.`}
          </div>
        )}
      </div>
    </dialog>
  );
}
