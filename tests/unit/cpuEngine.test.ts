import { describe, expect, it } from "vitest";
import { CpuLeniaEngine } from "../../src/features/lenia/cpuEngine";
import { starterSpecies } from "../../src/features/lenia/presets";

describe("CPU Lenia engine", () => {
  it("advances a finite frame", async () => {
    const engine = new CpuLeniaEngine(starterSpecies[0], 24);
    const frame = await engine.step(2);

    expect(frame.generation).toBe(2);
    expect(frame.cells).toHaveLength(24 * 24);
    expect(Number.isFinite(frame.metrics.population)).toBe(true);
    expect(frame.metrics.population).toBeGreaterThanOrEqual(0);
    expect(frame.metrics.population).toBeLessThanOrEqual(1);
  });
});
