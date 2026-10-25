import styles from './CheatSheet.module.css';
import Diagram from './Diagram';
import { paragraphs } from './paragraphs';
import type { ParagraphId, Sign } from './paragraphs';

interface Props {
  paragraphId: ParagraphId;
}

export default function CheatSheet({ paragraphId }: Props) {
  const paragraph = paragraphs[paragraphId];
  const empty = Array.from({ length: paragraphId }, () => Array<number>(paragraphId).fill(0));
  const terms = (['positive', 'negative'] as const).flatMap((sign) => (
    paragraph[sign].map((indexes) => ({ sign, indexes }))
  ));
  const notation = terms.map(({ sign, indexes }, termIndex) => {
    const product = indexes.map((index) => (
      `x${Math.floor(index / paragraphId) + 1}${(index % paragraphId) + 1}`
    )).join(' · ');
    const operator = sign === 'positive' ? ' + ' : ' − ';
    return `${termIndex === 0 ? '' : operator}${product}`;
  }).join('');
  return (
    <article
      data-cheat-sheet={paragraphId}
      className={styles.cheatSheet}
    >
      <h3 id="cheatSheetTitle" tabIndex={-1} data-dialog-heading>
        {`Нахождение определителя матрицы ${paragraphId}×${paragraphId}`}
      </h3>
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
            />
          </div>
        ))}
      </div>
      <div className={styles.formula} role="math" aria-label={`D = ${notation}`}>
        <span>
          <i>D</i>
          {' '}
          =
        </span>
        {terms.map(({ sign, indexes }, termIndex) => (
          <span className={styles.term} key={`${sign}-${indexes.join('-')}`}>
            {termIndex > 0 && <span>{sign === 'positive' ? ' + ' : ' − '}</span>}
            {indexes.map((index, factorIndex) => (
              <span key={index}>
                {factorIndex > 0 && ' · '}
                <i>x</i>
                <sub>{`${Math.floor(index / paragraphId) + 1}${(index % paragraphId) + 1}`}</sub>
              </span>
            ))}
          </span>
        ))}
      </div>
    </article>
  );
}
