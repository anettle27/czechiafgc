# Team Czechia · FIRST Global Challenge

Static site for Team Czechia at https://czechiafgc.anetavostra.com. No build step.

- `public/index.html` — FGC 2026 (this season only)
- `public/past/index.html` — past competitions, 2017 onwards
- `public/styles.css` — shared styles (colours at the top)
- `public/img/` — team photos (from FIRST Global's team profiles)
- `wrangler.jsonc` — Cloudflare Worker (static assets) bound to the custom domain

Every push to `main` deploys to Cloudflare via GitHub Actions (`.github/workflows/deploy.yml`, needs the `CLOUDFLARE_API_TOKEN` repo secret).
