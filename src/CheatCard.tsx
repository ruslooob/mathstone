import Diagram from './Diagram';
import { lessons } from './lessons';
import type { LessonId, Sign } from './lessons';

export default function CheatCard({ lessonId: n }: { lessonId: LessonId }) {
  const lesson = lessons[n];
  const empty = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const captions = n === 2
    ? { positive: 'Первое произведение', negative: 'Второе произведение вычитаем' }
    : { positive: 'Три произведения складываем', negative: 'Три произведения вычитаем' };
  return (
    <article className="cheat-card">
      <div className="cheat-top">
        <span>
          КАРТОЧКА 0
          {n === 2 ? 1 : 2}
          {' '}
          / МАТЕМАТИКА
        </span>
        <span>
          {`${n} × ${n}`}
        </span>
      </div>
      <h3>{lesson.name}</h3>
      <div className="scheme-pair">
        {(['positive', 'negative'] as const).map((sign: Sign) => (
          <div className="scheme-block" key={sign}>
            <div className={`scheme-sign${sign === 'negative' ? ' negative' : ''}`}>
              {sign === 'positive' ? '+' : '−'}
            </div>
            <Diagram
              matrix={empty}
              paths={lesson[sign].map((indexes) => ({ indexes, sign }))}
              schematic
              label={false}
            />
            <p className="scheme-caption">
              {captions[sign]}
            </p>
          </div>
        ))}
      </div>
      <p className="cheat-rule">
        {n === 2 ? (
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
