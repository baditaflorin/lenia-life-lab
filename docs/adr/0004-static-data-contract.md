# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A avoids remote runtime data. Users still need a stable way to share species and recover saved local species.

## Decision

The public data contract is the species URL hash:

- Hash prefix: `#species=`.
- Payload: URL-safe base64 of compact JSON.
- Schema version: `v: 1`.
- Required fields: `id`, `name`, `seed`, `radius`, `mu`, `sigma`, `growth`, `dt`, `colorway`, `createdAt`.
- Optional fields: `parents`, `notes`.

Built-in starter species are bundled as TypeScript constants and versioned with the application.

## Consequences

- Shared links are static and do not depend on a server.
- Breaking schema changes require backward-compatible decoders or a new hash prefix.
- There is no global canonical species ID in v1.

## Alternatives Considered

- JSON files in `docs/data`: unnecessary for user-generated v1 species.
- Runtime API: not needed without global sharing or moderation.
