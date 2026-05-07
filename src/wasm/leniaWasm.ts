import wasmUrl from "./lenia.wasm?url";

export interface LeniaMath {
  bell(x: number, mu: number, sigma: number): number;
  clamp(value: number, minimum: number, maximum: number): number;
  clamp01(value: number): number;
  mixSeed(a: number, b: number): number;
  mutateFloat(value: number, minimum: number, maximum: number, amount: number, seed: number): number;
}

let wasmPromise: Promise<LeniaMath> | undefined;

export function loadLeniaWasm(): Promise<LeniaMath> {
  wasmPromise ??= instantiate();
  return wasmPromise;
}

async function instantiate(): Promise<LeniaMath> {
  if ("instantiateStreaming" in WebAssembly) {
    try {
      const streamed = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {});
      return streamed.instance.exports as unknown as LeniaMath;
    } catch {
      // GitHub Pages serves wasm correctly, but local preview fallbacks can be less predictable.
    }
  }

  const response = await fetch(wasmUrl);
  const bytes = await response.arrayBuffer();
  const compiled = await WebAssembly.instantiate(bytes, {});
  return compiled.instance.exports as unknown as LeniaMath;
}
