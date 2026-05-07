# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Users should save discoveries locally without accounts or backend storage.

## Decision

Use `localStorage` for a compact saved species library and user preferences. The data volume is small, human-readable, and easy to export via URL hashes. Use schema validation before reading stored records.

## Consequences

- Saves are device-local and browser-local.
- Storage can be cleared by the user or browser.
- IndexedDB can be added later if genomes, thumbnails, or replay histories become larger.

## Alternatives Considered

- IndexedDB: more scalable but not necessary for the small v1 records.
- OPFS: useful for large binary datasets, not needed in v1.
