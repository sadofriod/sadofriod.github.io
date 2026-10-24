# Ashes Space

Personal site of [Ashes Born](https://github.com/sadofriod) — long-form notes on GraphRAG,
retrieval infrastructure and frontend engineering, plus photography and a podcast.

Live: <https://blog.ashesborn.cloud>

## What is in here

- Next.js 15 App Router with `output: 'export'` — every page is prerendered at build time
- Posts are Markdown in `app/blog/posts/`; `scripts/generate-post-index.js` builds the index,
  translation pairs (`lang` + `translationKey`) and the sitemap/RSS inputs
- Five locales of interface copy in `lib/i18n/translations.ts`; server pages render
  `<T k="…" />`, client components call `useLanguage()`
- Chinese and English versions of the same article are one entry: same `translationKey`,
  `hreflang` alternates, and a language switch that keeps the reader on the same article
- Photography and podcast media live in R2, their metadata in D1; both APIs run in the Worker
- Served by a Cloudflare Worker (`worker.js`) over the static export, so live routes and
  assets share one origin

## Develop

```bash
pnpm install
pnpm dev                      # next dev + regenerated post index
pnpm run build                # static export into out/
npx tsc --noEmit              # typecheck
pnpm test:db                  # store tests (D1 dialect, node:sqlite)
pnpm test:routes              # Worker route tests
pnpm run preview              # build + wrangler dev with local D1/R2 bindings
```

## Deploy

Cloudflare Workers only. A merge to `master` is the one event that publishes:
`.github/workflows/deploy-cloudflare.yml` runs typecheck, both test suites, the build and then
`wrangler deploy`. Pull requests run the same gates in `ci.yml` without any secret, so nothing
can ship from a branch.

See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for bindings, secrets and DNS.
