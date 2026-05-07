# 0001 - Deployment Mode

## Status

Accepted

## Context

Lenia Life Lab needs to let people discover, mutate, hear, save, and share continuous cellular automata creatures. The project bootstrap requires GitHub Pages first and a backend only when client-side or build-time approaches are genuinely insufficient.

## Decision

Use Mode A: Pure GitHub Pages. The public app is a static site served from the `docs/` directory on the `main` branch. Simulation runs in the browser with WebGPU when available, a TypeScript fallback when not available, a small WASM helper for deterministic math routines, Three.js for visualization, Web Audio for sound, URL hashes for sharing, and local browser storage for saved species.

## Consequences

- No runtime backend, Docker image, server database, auth, or server secrets are required for v1.
- Cross-device sync, a global species registry, moderation, and account features are outside v1.
- Heavy runtime modules must be lazy-loaded and browser capability checks must be clear.
- GitHub Pages header limitations affect cross-origin isolation, so WASM must avoid SharedArrayBuffer requirements.

## Alternatives Considered

- Mode B with pre-built data artifacts: unnecessary because v1 data is user-generated and encoded in the URL or local storage.
- Mode C with Docker backend: unnecessary because no authenticated writes, secrets, or realtime shared state are required.
