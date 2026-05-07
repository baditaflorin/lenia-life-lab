# Contributing

Thanks for helping improve Lenia Life Lab.

## Local Workflow

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Run `make install-hooks`.
4. Use Conventional Commits for commit messages.
5. Run `make test`, `make build`, and `make smoke` before pushing.

## Ground Rules

- Do not commit secrets, tokens, private keys, or real `.env` files.
- Keep the public app fully static unless an ADR justifies a different deployment mode.
- Add or update tests for behavior changes.
