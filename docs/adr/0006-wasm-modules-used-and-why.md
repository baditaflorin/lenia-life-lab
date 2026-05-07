# 0006 - WASM Modules Used And Why

## Status

Accepted

## Context

The original Lenia lineage includes Python/CUDA implementations. The browser version needs portable compute, deterministic parameter helpers, and a route for future heavier kernels.

## Decision

Use WebGPU compute shaders for the main Lenia step when available. Include a small AssemblyScript WASM module for deterministic growth and mutation helper math, loaded only when the lab starts. The WASM module avoids SharedArrayBuffer and thread requirements because GitHub Pages cannot set COOP/COEP headers.

## Consequences

- The core simulation is GPU-native in browsers that support WebGPU.
- WASM remains static and Pages-compatible.
- A TypeScript CPU fallback exists for browsers without WebGPU, but performance is intentionally lower.

## Alternatives Considered

- Rust plus wasm-pack: excellent long-term path, but it adds more toolchain weight for v1.
- Full CPU simulation in WASM: portable, but slower than WebGPU for texture-sized Lenia grids.
