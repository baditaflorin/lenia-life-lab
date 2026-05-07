# Deploy

Live URL: https://baditaflorin.github.io/lenia-life-lab/

Repository: https://github.com/baditaflorin/lenia-life-lab

## Topology

GitHub Pages serves `docs/` from the `main` branch. There is no Docker backend, nginx config, runtime API, database, or server-side deployment.

## Publish

```bash
npm install
make install-hooks
make build
git add docs
git commit -m "build: publish pages app"
git push
```

Pages source is configured as:

- Branch: `main`
- Folder: `/docs`
- URL: https://baditaflorin.github.io/lenia-life-lab/

## Preview

```bash
make build
make pages-preview
```

Preview URL: http://127.0.0.1:4187/lenia-life-lab/

## Rollback

Revert the commit that changed `docs/`, then push `main`.

```bash
git revert <commit>
git push
```

## Custom Domain

No custom domain is configured for v1. If a domain is added later:

- Add `docs/CNAME`.
- Point DNS at GitHub Pages according to https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- Keep the Vite base path and service worker scope aligned with the chosen domain.

## Pages Gotchas

- GitHub Pages does not support custom `_headers` or `_redirects`.
- The app uses `docs/404.html` as the SPA fallback.
- The service worker scope is `/lenia-life-lab/`.
- WASM avoids SharedArrayBuffer requirements because Pages cannot set COOP/COEP headers.
