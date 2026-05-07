# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap specifies Go layout for Mode B or Mode C.

## Decision

Skip Go backend layout in v1 because the project is Mode A. No `cmd/`, `internal/`, runtime API, migrations, Docker backend, or server configuration are created.

## Consequences

- The repository stays focused on the static frontend.
- Backend guidance remains available if the project later moves to Mode B or C.

## Alternatives Considered

- Add empty Go folders for future work: rejected because it would imply unsupported backend scope.
