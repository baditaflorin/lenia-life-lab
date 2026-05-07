SHELL := /bin/bash

.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout clean audit

help:
	@printf "Targets:\n"
	@printf "  make install-hooks      Wire .githooks through core.hooksPath\n"
	@printf "  make dev                Run the local Vite dev server\n"
	@printf "  make build              Build the Pages-ready app into docs/\n"
	@printf "  make test               Run unit tests\n"
	@printf "  make test-integration   Placeholder for future integration tests\n"
	@printf "  make smoke              Build, serve docs/ with Vite preview, and run Playwright smoke tests\n"
	@printf "  make lint               Run ESLint, Prettier check, and TypeScript\n"
	@printf "  make fmt                Format files\n"
	@printf "  make pages-preview      Serve the built docs/ site locally\n"
	@printf "  make clean              Remove generated local artifacts\n"

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-integration:
	@printf "No integration tests are required for Mode A v1.\n"

smoke:
	npm run build
	npm run smoke

lint:
	npm run lint

fmt:
	npm run fmt

pages-preview:
	npm run pages:serve

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

hooks-post-merge:
	.githooks/post-merge

hooks-post-checkout:
	.githooks/post-checkout

audit:
	npm audit --audit-level=high

clean:
	rm -rf coverage playwright-report test-results docs/assets docs/index.html docs/404.html src/wasm/lenia.wasm
