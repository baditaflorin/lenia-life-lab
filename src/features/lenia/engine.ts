import type { LeniaMath } from "../../wasm/leniaWasm";
import { CpuLeniaEngine, type LeniaFrame } from "./cpuEngine";
import { WebGpuLeniaEngine } from "./webgpuEngine";
import type { Species } from "./species";

export type LeniaEngine = {
  readonly mode: "webgpu" | "cpu";
  readonly size: number;
  generation: number;
  reset(species: Species): void;
  step(steps: number): Promise<LeniaFrame>;
  dispose(): void;
};

export async function createLeniaEngine(
  species: Species,
  size: number,
  math?: LeniaMath
): Promise<LeniaEngine> {
  try {
    return (await WebGpuLeniaEngine.create(species, size)) as LeniaEngine;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info("Falling back to CPU Lenia engine.", error);
    }
    return new CpuLeniaEngine(species, size, math) as LeniaEngine;
  }
}
