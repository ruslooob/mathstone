import styles from '../statistics.module.css';

export const palette = {
  ink: 'var(--ink)',
  teal: 'var(--teal)',
  orange: 'var(--orange)',
  muted: 'var(--muted)',
  line: 'var(--line)',
} as const;

export function text(content: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.textContent = content;
  return element;
}

export function formula(content: string, description: string): HTMLElement {
  const element = text(content);
  element.className = styles.formula;
  element.setAttribute('aria-label', description);
  return element;
}

export function svgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
  return element;
}

export function svgText(content: string, x: number, y: number): SVGTextElement {
  const element = svgElement('text', {
    x, y, fill: palette.ink, 'text-anchor': 'middle',
  });
  element.textContent = content;
  return element;
}

/** The page supplies the notebook. Graphs use a quiet light surface inside it. */
export function graph(description: string): SVGSVGElement {
  const element = svgElement('svg', {
    viewBox: '0 0 600 300', role: 'img', 'aria-label': description,
  });
  element.classList.add(styles.graph);
  return element;
}

export function axes(xLabel: string, yLabel?: string): SVGGElement {
  const group = svgElement('g');
  group.append(svgElement('path', {
    d: yLabel ? 'M60 30V210H550' : 'M60 210H550',
    fill: 'none',
    stroke: palette.line,
    'stroke-width': 2,
  }), svgText(xLabel, 300, 282));
  if (yLabel) group.append(svgText(yLabel, 60, 20));
  return group;
}
