# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project requires local checks and no GitHub Actions.

## Decision

Use plain `.githooks/` scripts wired through `git config core.hooksPath .githooks`. Hooks call Makefile targets. Pre-commit runs formatting checks, lint, TypeScript, and gitleaks when installed. Commit-msg validates Conventional Commits. Pre-push runs tests, build, and smoke. Post-merge and post-checkout install dependencies when lockfile changes are present.

## Consequences

- Hooks are transparent shell scripts.
- Contributors can run every hook manually through Make targets.
- Missing optional tools produce actionable messages.

## Alternatives Considered

- Lefthook: good tool, but plain hooks are sufficient and avoid another runtime dependency.
