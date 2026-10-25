import { useEffect, useRef } from 'react';
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
    <dialog ref={ref} id="collectionDialog" onClose={onClose}>
      <div className="dialog-top">
        <div>
          <div className="eyebrow">ТВОИ ПРИЁМЫ</div>
          <h2>Коллекция карточек</h2>
        </div>
        <button
          type="button"
          className="icon-button"
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
            <article className="collection-entry" key={lessonId}>
              <span className="lesson-symbol">
                {lessonId}
                <span>×</span>
                {lessonId}
              </span>
              <div>
                <h3>{lessons[lessonId].name}</h3>
                <p>
                  {progress[lessonId].completed
                    ? '✓ Освоено · 3 задачи решены'
                    : `Карточка получена · решено ${progress[lessonId].solved} из 3 задач`}
                </p>
              </div>
              <button
                type="button"
                className="secondary-button"
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
          <div className="empty-collection">
            Здесь появятся твои шпаргалки.
            <br />
            Посмотри первый разбор и забери карточку.
          </div>
        )}
      </div>
    </dialog>
  );
}
