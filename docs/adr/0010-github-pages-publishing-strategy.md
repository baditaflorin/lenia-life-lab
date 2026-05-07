# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live Pages URL is a first-class deliverable from the first commit. The build output must be committed so Pages can serve it without GitHub Actions.

## Decision

Publish GitHub Pages from the `main` branch `/docs` directory. Vite builds directly into `docs/` with `base: "/lenia-life-lab/"`. The app includes a copied `404.html` fallback for static routing and hashed asset filenames for cache busting. `docs/` is intentionally not gitignored.

## Consequences

- Every production build changes committed static assets.
- Rollback is a git revert of the Pages publishing commit.
- The live URL is `https://baditaflorin.github.io/lenia-life-lab/`.
- Service worker scope must stay under `/lenia-life-lab/`.

## Alternatives Considered

- `gh-pages` branch: workable but adds branch choreography without GitHub Actions.
- Root publish from `main`: conflicts with source files and tooling.
