# 0002 - Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The app combines a Lenia simulation, parameter evolution, 3D rendering, audio synthesis, local persistence, and URL sharing. Each concern should remain understandable and testable.

## Decision

Use a feature-oriented frontend layout:

- `features/lenia`: species schema, mutation, crossover, simulation engines, metrics.
- `features/audio`: Web Audio synthesis driven by creature movement metrics.
- `features/library`: local species persistence.
- `features/share`: URL hash encoding and decoding.
- `rendering`: Three.js scene and texture updates.
- `wasm`: lazy loader for the small AssemblyScript WASM helper.
- `app`: UI orchestration and state.

## Consequences

- Simulation and genetic logic can be unit-tested without DOM or WebGPU.
- Rendering and audio remain replaceable shells around stable metrics.
- The app can degrade gracefully when WebGPU or Web Audio are unavailable.

## Alternatives Considered

- A single-page script: faster to start but harder to test and extend.
- React: useful for complex component trees but unnecessary for this compact interaction surface and asset budget.
