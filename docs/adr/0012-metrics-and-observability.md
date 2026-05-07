# 0012 - Metrics And Observability

## Status

Accepted

## Context

The app could collect usage metrics, but Mode A defaults to no analytics and no server-side observability.

## Decision

Ship with no analytics. Surface only local runtime metrics in the UI: FPS, engine mode, movement energy, population, generation, and saved species count.

## Consequences

- No PII or usage events are collected.
- Product insight comes from user feedback and public repository activity.
- `docs/privacy.md` documents the no-analytics stance.

## Alternatives Considered

- Plausible analytics: privacy-friendly but still unnecessary for v1.
- Custom beacon: rejected because it would require a receiver and privacy policy expansion.
