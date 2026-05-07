# 0013 - Testing Strategy

## Status

Accepted

## Context

The app needs fast local checks in hooks without GitHub Actions.

## Decision

Use Vitest for deterministic species, sharing, storage, and CPU simulation logic. Use Playwright for a smoke test that builds the site, serves `docs/`, loads the page, and runs one happy-path interaction. Use `make test`, `make build`, `make smoke`, and `make lint` as the main local gates.

## Consequences

- Core logic remains covered without browser GPU dependence.
- Smoke tests catch Pages base-path and boot failures.
- WebGPU availability is checked gracefully instead of required in CI-like local smoke runs.

## Alternatives Considered

- Browser-only manual QA: too fragile.
- Heavy visual regression testing: useful later, too costly for v1.
