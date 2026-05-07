# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode A requires Pages only. The bootstrap's Docker and nginx deployment topology applies only to Mode C.

## Decision

Deploy only to GitHub Pages at `https://baditaflorin.github.io/lenia-life-lab/`. The repository contains no `deploy/` server stack. Deployment documentation lives in `docs/deploy.md`.

## Consequences

- There is no server to patch, monitor, back up, or size.
- Pages limitations are documented explicitly.
- Docker targets are omitted from the Makefile.

## Alternatives Considered

- Docker backend behind nginx: rejected because it does not serve a v1 need.
