# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser logs should help local development without polluting production.

## Decision

Use minimal browser console output gated by `import.meta.env.DEV`. Production UI errors are surfaced through visible status text and toasts instead of console logging.

## Consequences

- Production users are not exposed to noisy logs.
- Debug details remain available during local development.

## Alternatives Considered

- Client log collection: rejected for privacy and because v1 has no analytics endpoint.
