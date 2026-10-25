import styles from './CheatSheet.module.css';
import Diagram from './Diagram';
import { paragraphs } from './paragraphs';
import type { ParagraphId, Sign } from './paragraphs';

interface Props {
  paragraphId: ParagraphId;
  compact?: boolean;
}

export default function CheatSheet({ paragraphId, compact = false }: Props) {
  const paragraph = paragraphs[paragraphId];
  const empty = Array.from({ length: paragraphId }, () => Array<number>(paragraphId).fill(0));
  const captions = paragraphId === 2
    ? { positive: 'Первое произведение', negative: 'Второе произведение вычитаем' }
    : { positive: 'Три произведения складываем', negative: 'Три произведения вычитаем' };
  return (
    <article className={`${styles.cheatSheet}${compact ? ` ${styles.compact}` : ''}`}>
      <div className={styles.cheatTop}>
        <span>
          ШПАРГАЛКА 0
          {paragraphId === 2 ? 1 : 2}
          {' '}
          / МАТЕМАТИКА
        </span>
        <span>
          {`${paragraphId} × ${paragraphId}`}
        </span>
      </div>
      <h3>{paragraph.name}</h3>
      <div className={styles.schemePair}>
        {(['positive', 'negative'] as const).map((sign: Sign) => (
          <div className={styles.schemeBlock} key={sign}>
            <div className={`${styles.schemeSign}${sign === 'negative' ? ` ${styles.negative}` : ''}`}>
              {sign === 'positive' ? '+' : '−'}
            </div>
            <Diagram
              matrix={empty}
              paths={paragraph[sign].map((indexes) => ({ indexes, sign }))}
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
        {paragraphId === 2 ? (
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
