# 0009 - Configuration And Secrets Management

## Status

Accepted

## Context

Mode A should not need secrets. Build-time configuration still needs to handle the GitHub Pages base path.

## Decision

Use Vite environment constants for public build metadata only. No secrets are read by the frontend. `.env.example` documents the public base path placeholder. Real `.env` files and secret-like extensions are gitignored. Local hooks run gitleaks when installed.

## Consequences

- No frontend secrets can leak because none are required.
- Version and commit are injected at build time from package metadata and git.
- Any future secret requirement must move the project to a build-time pipeline or backend ADR.

## Alternatives Considered

- Runtime configuration endpoint: not available in Mode A.
- Obfuscated frontend keys: rejected because obfuscation is not secrecy.
