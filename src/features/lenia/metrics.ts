export interface LeniaMetrics {
  population: number;
  centroidX: number;
  centroidY: number;
  movement: number;
  spread: number;
  energy: number;
}

export function measureCells(cells: Float32Array, size: number, previous?: Float32Array): LeniaMetrics {
  let total = 0;
  let xWeighted = 0;
  let yWeighted = 0;
  let movement = 0;
  let energy = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const value = cells[index] ?? 0;
      total += value;
      xWeighted += x * value;
      yWeighted += y * value;
      energy += value * value;

      if (previous) {
        movement += Math.abs(value - (previous[index] ?? 0));
      }
    }
  }

  const safeTotal = Math.max(total, 0.0001);
  const centroidX = xWeighted / safeTotal / Math.max(1, size - 1);
  const centroidY = yWeighted / safeTotal / Math.max(1, size - 1);
  let spread = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const value = cells[index] ?? 0;
      const dx = x / Math.max(1, size - 1) - centroidX;
      const dy = y / Math.max(1, size - 1) - centroidY;
      spread += Math.sqrt(dx * dx + dy * dy) * value;
    }
  }

  return {
    population: total / cells.length,
    centroidX,
    centroidY,
    movement: movement / cells.length,
    spread: spread / safeTotal,
    energy: energy / cells.length
  };
}
