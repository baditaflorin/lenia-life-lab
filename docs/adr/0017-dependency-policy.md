# 0017 - Dependency Policy

## Status

Accepted

## Context

The app includes performance-sensitive browser code and should avoid fragile dependencies.

## Decision

Use production-ready libraries only: Vite, TypeScript, Three.js, Zod, AssemblyScript, Vitest, Playwright, ESLint, Prettier, and small official helper packages. Avoid custom domain logic where browser APIs or established libraries fit. Keep dependencies pinned through `package-lock.json` and run `npm audit` as part of security checks.

## Consequences

- Dependency updates are explicit in diffs.
- The first-load budget is protected by lazy loading heavy modules.
- New dependencies need a clear reason and should be documented in an ADR if significant.

## Alternatives Considered

- Roll custom rendering/audio/runtime helpers: rejected when mature browser APIs and libraries already cover the need.
