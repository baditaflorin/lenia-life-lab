# Postmortem

## What Was Built

Lenia Life Lab v0.1.0 is a static GitHub Pages app with:

- A browser Lenia simulation using WebGPU compute when available.
- A CPU fallback for browsers without WebGPU.
- AssemblyScript WASM helper math loaded at startup.
- Three.js habitat rendering.
- Web Audio synthesis driven by movement metrics.
- Species mutation, crossbreeding, local saves, and URL hash sharing.
- GitHub and PayPal links in the published UI.
- Version and source commit display in the published UI.
- ADRs, local hooks, Makefile targets, unit tests, and Playwright smoke tests.

## Was Mode A Correct?

Yes. Mode A was the right choice. The v1 requirements do not need runtime secrets, auth, global writes, moderation, or cross-device state. URL hashes and local storage cover sharing and persistence. A backend would add operational cost without improving v1.

Mode B may become useful for a curated species atlas. Mode C only becomes justified for accounts, a public breeding registry, moderation, realtime collaboration, or server-side analytics.

## What Worked

- Vite's Pages base path and committed `docs/` output fit the deployment target well.
- Lazy-loading Three.js kept the initial JS payload small.
- Playwright smoke testing caught a local preview port collision before publish.
- Pinning Pages commit metadata made repeated builds stable.

## What Did Not Work

- Injecting `HEAD` directly into the bundle made publish builds self-referential and unstable.
- The first smoke run accidentally reused another Vite preview server on port 4173.
- Prettier initially touched generated `docs/assets`; `.prettierignore` fixed that.

## Surprises

- The Three.js lazy chunk is large uncompressed, but its gzip size is acceptable and it is not part of the first-load JS.
- GitHub Pages constraints make threaded WASM unattractive for v1, so WebGPU carries the main compute path.

## Accepted Tech Debt

- The WebGPU engine reads the grid back to CPU each frame for rendering and audio metrics. This is simple and works for v1, but a future version should share GPU textures more directly.
- Local storage is enough for compact species records, but IndexedDB would be better for thumbnails, replay histories, or larger catalogs.
- The CPU fallback is intentionally lower performance.

## Next Improvements

1. Add a curated starter atlas with thumbnails and species families.
2. Move rendering closer to the GPU simulation output to reduce readback overhead.
3. Add import/export bundles for local species libraries.

## Time Spent Vs Estimate

Estimate for a v1 static implementation: 2 to 3 focused hours.

Actual first pass: roughly within that range for scaffold, implementation, docs, tests, Pages build, and smoke verification.
