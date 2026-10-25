import { Fragment } from 'react';
import styles from './Diagram.module.css';
import { numberText } from './paragraphs';
import type { DiagramPath, Matrix } from './paragraphs';

interface Props {
  matrix: Matrix;
  paths?: readonly DiagramPath[];
  schematic?: boolean;
}

export default function Diagram({
  matrix, paths = [], schematic = false,
}: Props) {
  const matrixSize = matrix.length;
  const gap = matrixSize === 2 ? 105 : 82;
  const start = matrixSize === 2 ? 107.5 : 78;
  const yStart = matrixSize === 2 ? 95 : 61;
  const flat = matrix.flat();
  const coords = flat.map((_, index) => {
    const x = start + (index % matrixSize) * gap;
    const y = yStart + Math.floor(index / matrixSize) * gap;
    return [x, y];
  });
  const left = matrixSize === 2 ? 62 : 38;
  const right = 320 - left;
  const top = matrixSize === 2 ? 51 : 24;
  const bottom = matrixSize === 2 ? 243 : 260;

  return (
    <svg
      viewBox="0 0 320 300"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={schematic ? 'Схема произведений' : `Матрица ${matrixSize} на ${matrixSize}`}
    >
      <title>
        {schematic
          ? 'Выделенные линии соединяют элементы одного произведения'
          : matrix.map((row) => row.join(', ')).join('; ')}
      </title>
      <path
        className={styles.matrixBracket}
        d={`M${left + 8} ${top} H${left} V${bottom} H${left + 8} M${right - 8} ${top} H${right} V${bottom} H${right - 8}`}
      />
      {paths.map((path) => {
        const points = path.indexes.map((i) => coords[i]);
        const close = matrixSize === 3
          && new Set(points.map((v) => v[0] - v[1])).size !== 1
          && new Set(points.map((v) => v[0] + v[1])).size !== 1;
        return (
          <path
            key={`${path.sign}-${path.indexes.join('-')}`}
            className={`${styles.matrixPath} ${styles[path.sign]}`}
            d={
              `${points.map((point, i) => `${i ? 'L' : 'M'}${point.join(' ')}`).join(' ')}${close ? ' Z' : ''}`
            }
          />
        );
      })}
      {coords.map(([x, y], i) => {
        const active = paths.find((path) => path.indexes.includes(i));
        const activeClass = active
          ? styles[active.sign === 'positive' ? 'onPositive' : 'onNegative']
          : '';
        return (
          <Fragment key={`${x}-${y}`}>
            <circle
              className={`${styles.matrixNode} ${activeClass}`}
              cx={x}
              cy={y}
              r="26"
            />
            <text className={styles.matrixNumber} x={x} y={y + 1}>
              {schematic ? (
                <>
                  <tspan fontStyle="italic">x</tspan>
                  <tspan baselineShift="sub" fontSize="0.6em">
                    {`${Math.floor(i / matrixSize) + 1}${(i % matrixSize) + 1}`}
                  </tspan>
                </>
              ) : numberText(flat[i])}
            </text>
          </Fragment>
        );
      })}
    </svg>
  );
}
