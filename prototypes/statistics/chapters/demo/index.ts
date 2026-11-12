import type { Chapter } from '../../chapter';
import {
  axes, formula, graph, palette, svgElement, svgText, text,
} from '../../shared/scene';

const values = [2, 4, 6];
const sum = values.reduce((total, value) => total + value, 0);
const mean = sum / values.length;
const position = (value: number) => 90 + value * 60;

/** Temporary connection example. Remove this module during final assembly (#22). */
const demo: Chapter = {
  id: 'demo-mean',
  title: 'Среднее как точка равновесия',
  resources: [],
  steps: [
    { id: 'sample', title: 'Три наблюдения', duration: 8 },
    { id: 'balance', title: 'Точка равновесия', duration: 12 },
    { id: 'summary', title: 'Коротко о среднем', duration: 10 },
  ],
  mount(host) {
    return {
      render(frame) {
        const progress = frame.reducedMotion ? 1 : frame.stepProgress;
        const shift = frame.stepIndex === 0 ? 0 : Math.min(1, progress * 2);
        const finalShift = frame.stepIndex === 2 ? 1 : shift;
        const chart = graph(`Наблюдения ${values.join(', ')}. Среднее равно ${mean}. Точки сходятся к среднему.`);
        chart.append(axes('Значение'));
        values.forEach((value, index) => {
          const x = position(value + (mean - value) * finalShift);
          const y = 165 - index * 38;
          chart.append(svgElement('line', {
            x1: position(value),
            x2: position(mean),
            y1: y,
            y2: y,
            stroke: palette.line,
            'stroke-dasharray': '4 5',
          }), svgElement('circle', {
            cx: x, cy: y, r: 9, fill: palette.ink,
          }), svgText(`x${index + 1} = ${value}`, x, y - 17));
        });
        if (frame.stepIndex > 0) {
          chart.append(svgElement('line', {
            x1: position(mean),
            x2: position(mean),
            y1: 25,
            y2: 210,
            stroke: palette.teal,
            'stroke-width': 2,
            'stroke-dasharray': '6 4',
          }), svgText(`Среднее = ${mean}`, position(mean), 244));
        }
        const caption = [
          'У каждого наблюдения одинаковый вес. Найдём общую точку равновесия.',
          'Перенос к среднему уравновешивает отклонения: слева и справа они компенсируются.',
          'Среднее сохраняет общую сумму. Это характеристика центра, а не разброса.',
        ][frame.stepIndex];
        const equation = frame.stepIndex === 0
          ? `x = (${values.join(', ')})`
          : `x̄ = (${values.join(' + ')}) / ${values.length} = ${mean}`;
        host.replaceChildren(text(caption), chart, formula(equation, equation));
        if (frame.stepIndex === 2) {
          host.append(text(`n = ${values.length} — число наблюдений. Сумма = ${sum}. Отклонения от среднего в сумме дают 0. Не путайте среднее с медианой.`));
        }
      },
      dispose() { host.replaceChildren(); },
    };
  },
};

// Content modules share this named export for assembly.
// eslint-disable-next-line import/prefer-default-export
export const chapters: readonly Chapter[] = [demo];
