# Team Czechia · FIRST Global Challenge

Static site for Team Czechia at https://czechiafgc.anetavostra.com. No build step.

- `public/index.html` — the whole page (styles and countdown script inline)
- `wrangler.jsonc` — Cloudflare Worker (static assets) bound to the custom domain

Deploy: `npx wrangler deploy`
