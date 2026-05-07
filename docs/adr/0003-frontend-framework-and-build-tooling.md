# 0003 - Frontend Framework And Build Tooling

## Status

Accepted

## Context

The frontend needs strict TypeScript, fast local development, static GitHub Pages output, and a small first-load payload.

## Decision

Use Vite with strict TypeScript and a vanilla DOM application. Use Three.js for rendering, Zod for species validation, Vitest for unit tests, Playwright for smoke/e2e, ESLint and Prettier for quality gates, and AssemblyScript for the small WASM helper.

## Consequences

- The app avoids framework runtime cost.
- Vite handles hashed assets and a Pages base path.
- Feature modules remain explicit and easy to profile.

## Alternatives Considered

- React: strong ecosystem, but the v1 UI does not need a component framework.
- Svelte: compact output, but a Vite vanilla app is sufficient and keeps dependencies lower.
