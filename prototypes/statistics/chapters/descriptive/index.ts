import type { Chapter } from '../../chapter';
import {
  graph, palette, svgElement, svgText, text,
} from '../../shared/scene';
import {
  constrainedDeviations, ensemble, enumerationSize, format, observations,
  population, populationStats, sample, squaredDistance,
} from './model';
import styles from './variance.module.css';

function equation(content: string): HTMLElement {
  const element = text(content);
  element.className = styles.equation;
  return element;
}

function note(content: string): HTMLElement {
  const element = text(content);
  element.className = styles.note;
  return element;
}

function plot(description: string): SVGSVGElement {
  const element = graph(description);
  element.setAttribute('viewBox', '0 0 600 360');
  element.classList.add(styles.plot);
  return element;
}

function cards(items: readonly [string, string][]): HTMLElement {
  const container = document.createElement('div');
  container.className = styles.cards;
  items.forEach(([label, value]) => {
    const card = document.createElement('div');
    const heading = document.createElement('span');
    heading.textContent = label;
    const result = document.createElement('strong');
    result.textContent = value;
    card.append(heading, result);
    container.append(card);
  });
  return container;
}

function squareScene(progress: number): Element[] {
  const chart = plot('Квадраты отклонений. Площадь каждого квадрата равна квадрату отклонения.');
  const reveal = 0.25 + 0.75 * Math.min(1, progress * 2);
  observations.forEach((value, index) => {
    const x = 58 + index * 69;
    const side = Math.abs(sample.deviations[index]) * 12;
    chart.append(
      svgText(String(value), x, 60),
      svgElement('rect', {
        x: x - side / 2,
        y: 205 - side,
        width: side,
        height: side,
        fill: palette.teal,
        'fill-opacity': reveal,
        stroke: palette.teal,
      }),
      svgText(format(sample.deviations[index]), x, 254),
      svgText(format(sample.squares[index]), x, 320),
    );
    if (side === 0) {
      chart.append(svgElement('circle', {
        cx: x, cy: 205, r: 2, fill: palette.teal,
      }));
    }
  });
  return [
    text(`Фиксируем выборку: x = (${observations.join(', ')}), n = ${sample.n}, x̄ = ${sample.mean}.`),
    text('Отклонения со знаком компенсируются. Квадраты сохраняют величину каждого отклонения и сильнее выделяют большие отклонения.'),
    chart,
    note('Строки сверху вниз: xᵢ; площади квадратов; dᵢ = xᵢ − x̄; dᵢ². Масштаб площадей общий.'),
    equation(`Σ dᵢ = 0     ·     Q = Σ dᵢ² = ${sample.sumSquares}`),
  ];
}

function centerScene(progress: number): Element[] {
  const center = sample.mean + 2 * (1 - Math.min(1, progress / 0.75));
  const cost = squaredDistance(observations, center);
  const extra = sample.n * (center - sample.mean) ** 2;
  const position = (value: number) => 110 + (value - 2) * 56;
  const chart = plot(`Центр c = ${format(center)}. Сумма квадратов расстояний ${format(cost)}.`);
  observations.forEach((value, index) => {
    const y = 40 + index * 33;
    chart.append(svgText(`x${index + 1}`, 45, y + 7), svgElement('line', {
      x1: position(value),
      x2: position(center),
      y1: y,
      y2: y,
      stroke: palette.ink,
      'stroke-width': 3,
    }), svgElement('circle', {
      cx: position(value), cy: y, r: 7, fill: palette.ink,
    }));
  });
  chart.append(svgElement('line', {
    x1: position(center),
    x2: position(center),
    y1: 20,
    y2: 292,
    stroke: palette.orange,
    'stroke-width': 3,
    'stroke-dasharray': '5 4',
  }), svgText(`c = ${format(center)}`, position(center), 336));
  [2, 5, 9].forEach((value) => chart.append(svgText(String(value), position(value), 307)));
  return [
    text('Сдвигаем центр c к выборочному среднему. Наблюдения остаются на месте, меняются расстояния до центра.'),
    chart,
    equation('Σ(xᵢ − c)² = Q + n(x̄ − c)²'),
    cards([['Минимум Q', format(sample.sumSquares)], ['Доплата за сдвиг центра', format(extra)], ['Сумма квадратов', format(cost)]]),
    note('Среднее подстраивается под эти же данные и минимизирует сумму квадратов. Поэтому оценка разброса требует учитывать оценивание центра.'),
  ];
}

function degreesScene(progress: number): Element[] {
  const deviations = constrainedDeviations(progress);
  const chart = plot(`Три отклонения: ${deviations.map(format).join(', ')}. Их сумма всегда равна нулю.`);
  chart.append(svgElement('line', {
    x1: 300, x2: 300, y1: 20, y2: 290, stroke: palette.line, 'stroke-width': 2,
  }), svgText('0', 300, 332));
  deviations.forEach((value, index) => {
    const y = 65 + index * 90;
    const end = 300 + value * 62;
    const color = index === 2 ? palette.orange : palette.ink;
    chart.append(svgElement('line', {
      x1: 300, x2: end, y1: y, y2: y, stroke: color, 'stroke-width': 16,
    }), svgText(`d${index + 1} = ${format(value)}`, 300, y - 24));
  });
  return [
    text('Для наглядности берём три центрированных отклонения. Первые два меняются, третье обязано компенсировать их сумму.'),
    chart,
    equation('d₃ = −(d₁ + d₂)'),
    equation('В общем случае: dₙ = −Σᵢ₌₁ⁿ⁻¹ dᵢ'),
    note('Остаётся n − 1 свободная координата. Это линейное ограничение, а не утверждение о статистической независимости отклонений.'),
  ];
}

function expectationScene(progress: number): HTMLElement[] {
  const proof = document.createElement('div');
  proof.className = styles.proof;
  const rows = [
    ['Разложение суммы квадратов', 'Q = Σ(Xᵢ − μ)² − n(X̄ − μ)²'],
    ['Ожидание первого слагаемого', 'E[Σ(Xᵢ − μ)²] = nσ²'],
    ['Цена оценивания среднего', 'E[n(X̄ − μ)²] = n Var(X̄) = σ²'],
    ['Сумма после оценивания центра', 'E[Q] = nσ² − σ² = (n − 1)σ²'],
  ];
  const active = Math.min(rows.length - 1, Math.floor(progress * rows.length));
  rows.forEach(([label, value], index) => {
    const row = document.createElement('div');
    row.className = index === active ? styles.activeProof : styles.proofRow;
    row.append(text(label), equation(value));
    proof.append(row);
  });
  return [
    text('Теперь выборка случайна: X₁, …, Xₙ независимы и одинаково распределены. E[Xᵢ] = μ, Var(Xᵢ) = σ² < ∞.'),
    proof,
    note('Оценивание среднего уменьшает ожидаемую сумму квадратов ровно на σ². Нормальность для этого результата не требуется.'),
  ];
}

function enumerationScene(progress: number): HTMLElement[] {
  const count = Math.min(ensemble.length, 1 + Math.floor(progress * ensemble.length));
  const visited = ensemble.slice(0, count);
  const empirical = visited.reduce((sum, item) => sum + item.empiricalVariance, 0) / count;
  const corrected = visited.reduce((sum, item) => sum + (item.correctedVariance ?? 0), 0) / count;
  const table = document.createElement('table');
  table.className = styles.table;
  const caption = document.createElement('caption');
  caption.textContent = `Все ${ensemble.length} упорядоченных выборок равновероятны`;
  const head = document.createElement('thead');
  const header = document.createElement('tr');
  ['Выборка', 'Q / n', 'Q / (n − 1)'].forEach((label) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    header.append(cell);
  });
  head.append(header);
  const body = document.createElement('tbody');
  ensemble.forEach((item, index) => {
    const row = document.createElement('tr');
    if (index < count) row.className = styles.counted;
    [item.values.join(', '), format(item.empiricalVariance), format(item.correctedVariance ?? 0)]
      .forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
    body.append(row);
  });
  table.append(caption, head, body);
  return [
    text(`Отдельный точный пример: X принимает ${population.join(' или ')} с вероятностями ½. μ = ${populationStats.mean}, σ² = ${populationStats.empiricalVariance}. Берём ${enumerationSize} независимых наблюдения с возвращением.`),
    table,
    note(`Учтены первые ${count} из ${ensemble.length} строк таблицы. По ним вычислены текущие средние.`),
    cards([['Среднее Q / n', format(empirical)], ['Среднее Q / (n − 1)', format(corrected)]]),
    equation(`По всем выборкам: E[v] = (${enumerationSize - 1}/${enumerationSize})σ²; E[s²] = σ²`),
    note('Несмещённость относится к среднему по повторным выборкам. Для одной выборки s² может быть как ниже, так и выше σ².'),
  ];
}

function estimateScene(): HTMLElement[] {
  return [
    text(`Возвращаемся к исходным ${sample.n} наблюдениям. Здесь Q = ${sample.sumSquares}. Делитель зависит от того, какую задачу мы решаем.`),
    cards([
      ['Разброс наблюдаемого набора', `v = ${sample.sumSquares}/${sample.n} = ${format(sample.empiricalVariance)}`],
      ['Несмещённая оценка σ²', `s² = ${sample.sumSquares}/${sample.n - 1} ≈ ${format(sample.correctedVariance ?? 0)}`],
    ]),
    equation('v = Q/n     ·     s² = Q/(n − 1)'),
    text('Деление на n даёт дисперсию эмпирического распределения. Деление на n − 1 устраняет смещение при оценке дисперсии генеральной совокупности.'),
    equation(`s = √s² = √(${sample.sumSquares}/${sample.n - 1}) ≈ ${format(sample.standardDeviation ?? 0)}`),
    note('Если наблюдения измерены в секундах, дисперсия измеряется в с², стандартное отклонение — в с. Из E[s²] = σ² не следует E[s] = σ.'),
    note('Особый случай: если μ известно заранее, (1/n)Σ(Xᵢ − μ)² уже несмещённо оценивает σ².'),
  ];
}

function summaryScene(): HTMLElement[] {
  const list = document.createElement('ul');
  list.className = styles.summary;
  [
    'Q — сумма квадратов отклонений от выборочного среднего; v — разброс наблюдаемого набора; s² — исправленная оценка σ².',
    'После оценки среднего: Σ(Xᵢ − X̄) = 0. Одно линейное ограничение оставляет n − 1 степень свободы.',
    'При независимых одинаково распределённых наблюдениях, конечной дисперсии и n ≥ 2: E[s²] = σ². Нормальность не нужна.',
    'Поправка устраняет смещение в повторных выборках. Она не гарантирует точность отдельной оценки и не исправляет зависимость данных.',
    'Дисперсия чувствительна к выбросам. Несмещённость s² не делает s несмещённой оценкой σ.',
    'При n = 1 исправленная оценка не определена. Если все наблюдения равны и n ≥ 2, обе выборочные дисперсии равны нулю.',
  ].forEach((content) => {
    const item = document.createElement('li');
    item.textContent = content;
    list.append(item);
  });
  const source = document.createElement('a');
  source.href = 'https://web.stanford.edu/class/archive/cs/cs109/cs109.1206/lectures/19_sampling_bootstrap.pdf';
  source.textContent = 'Проверка вывода: Stanford CS109, Sampling and Bootstrapping';
  source.className = styles.source;
  return [
    text('Итог: какой делитель выбрать'),
    equation('Q = Σ(Xᵢ − X̄)²'),
    equation('v = Q/n     ·     s² = Q/(n − 1)'),
    list, source,
  ];
}

const scenes = [
  squareScene, centerScene, degreesScene, expectationScene,
  enumerationScene, estimateScene, summaryScene,
];

const variance: Chapter = {
  id: 'descriptive-variance',
  title: 'Дисперсия и степени свободы',
  resources: [],
  steps: [
    { id: 'squares', title: 'Сумма квадратов', duration: 10 },
    { id: 'center', title: 'Среднее подстраивается', duration: 12 },
    { id: 'constraint', title: 'Одно ограничение', duration: 12 },
    { id: 'expectation', title: 'Откуда n − 1', duration: 14 },
    { id: 'ensemble', title: 'Все возможные выборки', duration: 14 },
    { id: 'estimate', title: 'Какой делитель выбрать', duration: 10 },
    { id: 'summary', title: 'Итог и условия', duration: 12 },
  ],
  mount(host) {
    const content = document.createElement('div');
    content.className = styles.content;
    host.append(content);
    return {
      render(frame) {
        const progress = frame.reducedMotion ? 1 : frame.stepProgress;
        content.replaceChildren(...scenes[frame.stepIndex](progress));
      },
      dispose() { content.remove(); },
    };
  },
};

// Content modules share this named export for assembly.
// eslint-disable-next-line import/prefer-default-export
export const chapters: readonly Chapter[] = [variance];
