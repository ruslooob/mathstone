import { Fragment } from 'react';
import { numberText } from './lessons';
import type { DiagramPath, Matrix } from './lessons';

interface Props {
  matrix: Matrix;
  paths?: readonly DiagramPath[];
  schematic?: boolean;
  label?: boolean;
}

export default function Diagram({
  matrix, paths = [], schematic = false, label = true,
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
        className="matrix-bracket"
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
            className={`matrix-path ${path.sign}`}
            d={
              `${points.map((point, i) => `${i ? 'L' : 'M'}${point.join(' ')}`).join(' ')}${close ? ' Z' : ''}`
            }
          />
        );
      })}
      {coords.map(([x, y], i) => {
        const active = paths.find((path) => path.indexes.includes(i));
        const activeColor = active?.sign === 'positive' ? '#285c45' : '#cd7046';
        return schematic ? (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="7"
            fill={active ? activeColor : '#75816f'}
          />
        ) : (
          <Fragment key={`${x}-${y}`}>
            <circle
              className={`matrix-node${active ? ` on-${active.sign}` : ''}`}
              cx={x}
              cy={y}
              r="26"
            />
            <text className="matrix-number" x={x} y={y + 1}>
              {numberText(flat[i])}
            </text>
          </Fragment>
        );
      })}
      {label && !schematic && (
        <text className="matrix-label" x="160" y="290">
          {`МАТРИЦА A · ${matrixSize} × ${matrixSize}`}
        </text>
      )}
    </svg>
  );
}
