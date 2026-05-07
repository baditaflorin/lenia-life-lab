# 0014 - Error Handling Conventions

## Status

Accepted

## Context

WebGPU, Web Audio, storage, and hash decoding can all fail in ordinary browsers.

## Decision

Use typed result objects or thrown `Error` instances at module boundaries, catch them in the app controller, and show user-facing status messages or toasts. Invalid URL hash species fall back to a starter species and explain the recovery. Production code should not silently swallow errors.

## Consequences

- Users get clear fallback behavior.
- Tests can assert on specific validation failures.
- Browser capability problems do not crash the whole page.

## Alternatives Considered

- Global `window.onerror` only: useful as a last resort but too coarse for planned fallbacks.
