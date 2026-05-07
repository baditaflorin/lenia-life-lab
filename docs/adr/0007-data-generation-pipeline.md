# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

The bootstrap requires a Mode B data pipeline ADR only when static artifacts are generated offline.

## Decision

No Mode B data generation pipeline exists in v1. Built-in starter species are source-controlled TypeScript data and user discoveries are encoded in URL hashes or local storage.

## Consequences

- `make data` is omitted.
- There are no scheduled jobs or release-hosted artifacts.
- If a curated public species atlas is added later, this ADR should be replaced by a Mode B pipeline ADR.

## Alternatives Considered

- Generate a starter catalog JSON during build: unnecessary until the catalog becomes large or externally sourced.
