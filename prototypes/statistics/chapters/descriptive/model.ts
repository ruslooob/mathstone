export const observations = [2, 4, 4, 4, 5, 5, 7, 9] as const;

export function describe(values: readonly number[]) {
  if (!values.length || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Нужна непустая выборка конечных чисел.');
  }
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const deviations = values.map((value) => value - mean);
  const squares = deviations.map((value) => value ** 2);
  const sumSquares = squares.reduce((sum, value) => sum + value, 0);
  const correctedVariance = n > 1 ? sumSquares / (n - 1) : null;
  return {
    n,
    mean,
    deviations,
    squares,
    sumSquares,
    empiricalVariance: sumSquares / n,
    correctedVariance,
    standardDeviation: correctedVariance === null ? null : Math.sqrt(correctedVariance),
  };
}

export function squaredDistance(values: readonly number[], center: number): number {
  return values.reduce((sum, value) => sum + (value - center) ** 2, 0);
}

/** All ordered iid samples. Each population entry has the same probability. */
export function enumerateSamples(population: readonly number[], size: number): number[][] {
  if (!population.length || !Number.isInteger(size) || size < 1 || size > 8) {
    throw new Error('Укажите непустую совокупность и размер выборки от 1 до 8.');
  }
  return Array.from({ length: population.length ** size }, (_, index) => (
    Array.from({ length: size }, (_entry, position) => (
      population[Math.floor(index / population.length ** position) % population.length]
    ))
  ));
}

export const sample = describe(observations);
export const population = [0, 2] as const;
export const populationStats = describe(population);
export const enumerationSize = 3;
export const ensemble = enumerateSamples(population, enumerationSize).map((values) => ({
  values, ...describe(values),
}));

export function constrainedDeviations(progress: number): number[] {
  const angle = progress * 2 * Math.PI;
  const first = -2 + Math.sin(angle);
  const second = 1 + 0.5 * Math.sin(2 * angle);
  return [first, second, -(first + second)];
}

export function format(value: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 3 }).format(
    Math.abs(value) < 1e-10 ? 0 : value,
  );
}
