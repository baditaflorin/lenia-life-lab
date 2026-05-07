import type { LeniaMath } from "../../wasm/leniaWasm";
import { clamp, mulberry32 } from "../../lib/random";
import type { Species } from "./species";
import { measureCells, type LeniaMetrics } from "./metrics";

export interface LeniaFrame {
  cells: Float32Array;
  generation: number;
  metrics: LeniaMetrics;
}

export class CpuLeniaEngine {
  readonly mode = "cpu";
  readonly size: number;
  generation = 0;

  private cells: Float32Array;
  private previous?: Float32Array;
  private kernel: KernelPoint[] = [];
  private species: Species;
  private readonly math?: LeniaMath;

  constructor(species: Species, size: number, math?: LeniaMath) {
    this.size = size;
    this.species = species;
    this.math = math;
    this.cells = seedCells(species, size);
    this.rebuildKernel();
  }

  reset(species: Species): void {
    this.species = species;
    this.cells = seedCells(species, this.size);
    this.previous = undefined;
    this.generation = 0;
    this.rebuildKernel();
  }

  async step(steps: number): Promise<LeniaFrame> {
    for (let index = 0; index < steps; index += 1) {
      this.stepOnce();
    }

    const metrics = measureCells(this.cells, this.size, this.previous);
    this.previous = this.cells.slice();
    return { cells: this.cells.slice(), generation: this.generation, metrics };
  }

  dispose(): void {
    this.previous = undefined;
  }

  private rebuildKernel(): void {
    this.kernel = buildKernel(this.species.radius);
  }

  private stepOnce(): void {
    const next = new Float32Array(this.cells.length);

    for (let y = 0; y < this.size; y += 1) {
      for (let x = 0; x < this.size; x += 1) {
        const index = y * this.size + x;
        let sum = 0;
        let weight = 0;

        for (const point of this.kernel) {
          const sx = wrap(x + point.dx, this.size);
          const sy = wrap(y + point.dy, this.size);
          sum += this.cells[sy * this.size + sx] * point.weight;
          weight += point.weight;
        }

        const neighborhood = sum / Math.max(0.0001, weight);
        const bell =
          this.math?.bell(neighborhood, this.species.mu, this.species.sigma) ??
          localBell(neighborhood, this.species.mu, this.species.sigma);
        const growth = (2 * bell - 1) * this.species.growth;
        next[index] = clamp(this.cells[index] + this.species.dt * growth, 0, 1);
      }
    }

    this.cells = next;
    this.generation += 1;
  }
}

interface KernelPoint {
  dx: number;
  dy: number;
  weight: number;
}

export function seedCells(species: Species, size: number): Float32Array {
  const random = mulberry32(species.seed);
  const cells = new Float32Array(size * size);
  const blobCount = 7 + Math.floor(random() * 8);

  for (let blob = 0; blob < blobCount; blob += 1) {
    const cx = random() * size;
    const cy = random() * size;
    const blobRadius = size * (0.035 + random() * 0.11);
    const strength = 0.35 + random() * 0.75;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = torusDistance(x, cx, size);
        const dy = torusDistance(y, cy, size);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const value = Math.exp(-0.5 * (distance / blobRadius) ** 2) * strength;
        const index = y * size + x;
        cells[index] = clamp(cells[index] + value, 0, 1);
      }
    }
  }

  return cells;
}

function buildKernel(radius: number): KernelPoint[] {
  const points: KernelPoint[] = [];
  const integerRadius = Math.ceil(radius);

  for (let dy = -integerRadius; dy <= integerRadius; dy += 1) {
    for (let dx = -integerRadius; dx <= integerRadius; dx += 1) {
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 0 || distance > radius) {
        continue;
      }

      const ring = distance / radius;
      const q = (ring - 0.5) / 0.15;
      points.push({ dx, dy, weight: Math.exp(-0.5 * q * q) });
    }
  }

  return points;
}

function localBell(x: number, mu: number, sigma: number): number {
  const q = (x - mu) / Math.max(0.0001, sigma);
  return Math.exp(-0.5 * q * q);
}

function wrap(value: number, size: number): number {
  return (value + size) % size;
}

function torusDistance(value: number, center: number, size: number): number {
  const direct = value - center;
  const wrapped = direct > 0 ? direct - size : direct + size;
  return Math.abs(direct) < Math.abs(wrapped) ? direct : wrapped;
}
