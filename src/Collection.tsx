import { useEffect, useRef } from 'react';
import ui from './ui.module.css';
import styles from './Collection.module.css';
import { lessonIds, lessons } from './lessons';
import type { LessonId } from './lessons';
import type { LessonProgress } from './progress';

interface Props {
  open: boolean;
  progress: Record<LessonId, LessonProgress>;
  onClose: () => void;
  onCard: (lessonId: LessonId) => void;
}

export default function Collection({
  open, progress, onClose, onCard,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  const earned = lessonIds.filter((lessonId) => progress[lessonId].card);
  return (
    <dialog className={styles.dialog} ref={ref} id="collectionDialog" onClose={onClose}>
      <div className={styles.dialogTop}>
        <div>
          <div className={ui.eyebrow}>ТВОИ ПРИЁМЫ</div>
          <h2>Коллекция шпаргалок</h2>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          id="closeCollection"
          aria-label="Закрыть коллекцию"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div id="collectionContent">
        {earned.length ? (
          earned.map((lessonId) => (
            <article className={styles.collectionEntry} key={lessonId}>
              <span className={`${ui.lessonSymbol} ${styles.entrySymbol}`}>
                {lessonId}
                <span>×</span>
                {lessonId}
              </span>
              <div>
                <h3>{lessons[lessonId].name}</h3>
                <p>
                  {`Шпаргалка получена · решено задач: ${progress[lessonId].solved}`}
                </p>
              </div>
              <button
                type="button"
                className={ui.secondaryButton}
                data-open-card={lessonId}
                onClick={() => {
                  onClose();
                  onCard(lessonId);
                }}
              >
                Открыть ↗
              </button>
            </article>
          ))
        ) : (
          <div className={styles.emptyCollection}>
            Здесь появятся твои шпаргалки.
            <br />
            Посмотри первый разбор и забери шпаргалку.
          </div>
        )}
      </div>
    </dialog>
  );
}
