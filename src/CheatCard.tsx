import styles from './CheatCard.module.css';
import Diagram from './Diagram';
import { lessons } from './lessons';
import type { LessonId, Sign } from './lessons';

interface Props {
  lessonId: LessonId;
  compact?: boolean;
}

export default function CheatCard({ lessonId, compact = false }: Props) {
  const lesson = lessons[lessonId];
  const empty = Array.from({ length: lessonId }, () => Array<number>(lessonId).fill(0));
  const captions = lessonId === 2
    ? { positive: 'Первое произведение', negative: 'Второе произведение вычитаем' }
    : { positive: 'Три произведения складываем', negative: 'Три произведения вычитаем' };
  return (
    <article className={`${styles.cheatCard}${compact ? ` ${styles.compact}` : ''}`}>
      <div className={styles.cheatTop}>
        <span>
          ШПАРГАЛКА 0
          {lessonId === 2 ? 1 : 2}
          {' '}
          / МАТЕМАТИКА
        </span>
        <span>
          {`${lessonId} × ${lessonId}`}
        </span>
      </div>
      <h3>{lesson.name}</h3>
      <div className={styles.schemePair}>
        {(['positive', 'negative'] as const).map((sign: Sign) => (
          <div className={styles.schemeBlock} key={sign}>
            <div className={`${styles.schemeSign}${sign === 'negative' ? ` ${styles.negative}` : ''}`}>
              {sign === 'positive' ? '+' : '−'}
            </div>
            <Diagram
              matrix={empty}
              paths={lesson[sign].map((indexes) => ({ indexes, sign }))}
              schematic
              label={false}
            />
            <p className={styles.schemeCaption}>
              {captions[sign]}
            </p>
          </div>
        ))}
      </div>
      <p className={styles.cheatRule}>
        {lessonId === 2 ? (
          <>
            Перемножь числа вдоль каждой диагонали.
            <br />
            <strong>Из зелёного произведения вычти оранжевое.</strong>
          </>
        ) : (
          <>
            Каждая линия или треугольник — произведение трёх чисел.
            <br />
            <strong>Сумма зелёных произведений минус сумма оранжевых.</strong>
          </>
        )}
      </p>
    </article>
  );
}
