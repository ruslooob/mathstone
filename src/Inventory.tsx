import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import ui from './ui.module.css';
import styles from './Inventory.module.css';
import CheatSheet from './CheatSheet';
import { paragraphIds } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import type { Progress } from './progress';
import { hasCheatSheet } from './progress';

export type InventoryView =
  | { page: 'list' }
  | { page: 'sheet' | 'reward'; paragraphId: ParagraphId };

interface Props {
  view: InventoryView | null;
  progress: Progress;
  onClose: () => void;
  onBack: () => void;
  onCheatSheet: (id: ParagraphId) => void;
}

const confetti = Array.from({ length: 84 }, (_, index) => ({
  id: index,
  style: {
    '--left': index % 2 ? '15%' : '85%',
    '--drift': `${(((index * 19) % 300) + 50) * (index % 2 ? 1 : -1)}px`,
    '--rise': `${55 + ((index * 17) % 35)}vh`,
    '--delay': `${(index % 9) * 40}ms`,
    '--turn': `${index % 2 ? 540 : -540}deg`,
  } as CSSProperties,
}));

export default function Inventory({
  view, progress, onClose, onBack, onCheatSheet,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = view !== null;
  const reward = view?.page === 'reward';
  const selected = view && view.page !== 'list' && hasCheatSheet(progress[view.paragraphId])
    ? view.paragraphId
    : null;

  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    let startedOutside = false;
    function isOutside(event: MouseEvent) {
      const bounds = dialog!.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    function onPointerDown(event: PointerEvent) {
      startedOutside = event.target === dialog && isOutside(event);
    }
    function onClick(event: MouseEvent) {
      if (startedOutside && event.target === dialog && isOutside(event)) onClose();
      startedOutside = false;
    }
    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('click', onClick);
    };
  }, [onClose]);

  useEffect(() => {
    if (open) {
      ref.current?.querySelector<HTMLElement>('[data-dialog-heading]')?.focus();
      if (ref.current) ref.current.scrollTop = 0;
    }
  }, [open, view]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const earned = paragraphIds.filter((id) => hasCheatSheet(progress[id]));

  return (
    <dialog
      className={`${styles.dialog}${selected ? ` ${styles.sheetDialog}` : ''}${reward ? ` ${styles.celebration}` : ''}`}
      ref={ref}
      id="inventoryDialog"
      aria-labelledby={selected && !reward ? 'cheatSheetTitle' : 'inventoryTitle'}
      onClose={onClose}
    >
      {reward && (
        <div className={styles.confetti} aria-hidden="true">
          {confetti.map((piece) => <i key={piece.id} style={piece.style} />)}
        </div>
      )}
      <div className={styles.dialogTop}>
        {selected && !reward ? (
          <button
            type="button"
            className={styles.iconButton}
            title="Назад к инвентарю"
            aria-label="Назад к инвентарю"
            onClick={onBack}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M20 12H4m7-7-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <h2 id="inventoryTitle" tabIndex={-1} data-dialog-heading>
            {reward ? 'Вы получили новую шпаргалку' : 'Определители матриц'}
          </h2>
        )}
        <button
          type="button"
          className={styles.iconButton}
          id="closeInventory"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {selected ? (
        <div className={styles.sheetViewport}>
          <CheatSheet paragraphId={selected} />
        </div>
      ) : (
        <div id="inventoryContent" className={styles.inventoryList}>
          {earned.length ? earned.map((id) => (
            <button
              type="button"
              className={styles.inventoryEntry}
              data-open-cheat-sheet={id}
              key={id}
              onClick={() => onCheatSheet(id)}
            >
              <span className={ui.paragraphSymbol}>{`${id}×${id}`}</span>
              <span>{`Нахождение определителя матрицы ${id}×${id}`}</span>
            </button>
          )) : <p className={styles.emptyInventory}>Пока здесь пусто.</p>}
        </div>
      )}
    </dialog>
  );
}
