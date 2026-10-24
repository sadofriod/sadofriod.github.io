# Cloudflare Workers deployment

The site is a static export (`next build` → `out/`) served by a Cloudflare Worker
(`worker.js`), which also answers the live routes: `/api/photos`, `/api/podcasts`,
`/podcast/rss`, `/podcast-media/*` and `/photos/*`. Pages and article HTML are prerendered, so
requests do not spend Worker CPU on rendering.

## Bindings (`wrangler.jsonc`)

- `ASSETS` — the `out/` directory, with `not_found_handling: "404-page"` and
  `run_worker_first` covering the live prefixes. A prefix missing from that list is answered by
  the asset layer, so the Worker never runs and the route 404s.
- `DB` — D1 database `ashesborn-blog` (photos + podcast episodes). Schema in `migrations/`,
  applied with `pnpm db:migrate` (remote) or `pnpm db:migrate:local`.
- `PHOTOS`, `PODCASTS` — R2 buckets `ashesborn-photos` and `ashesborn-podcasts`. Audio and
  originals are streamed through the Worker with byte-range support; the gallery uses a
  browser-generated WebP preview stored beside the original.
- `UPLOAD_AUTH_KEY` — Worker secret guarding the upload endpoints.

## DNS

`blog.ashesborn.cloud` must exist in the `ashesborn.cloud` zone and be **proxied** (orange
cloud); Worker routes match on hostname, and a DNS-only record bypasses them. The Worker route is
`blog.ashesborn.cloud/*`, so no separate custom-domain mapping is needed.

## Deploy

```
pnpm install
pnpm run build            # static export; the prebuild step regenerates the post index
pnpm exec wrangler deploy # or: pnpm run deploy
```

## GitHub Actions

Two workflows, split by intent:

- `.github/workflows/ci.yml` — pull requests and manual runs. Typecheck, store tests (20),
  route tests (33), build, and a `wrangler deploy --dry-run` bundle check. No secrets.
- `.github/workflows/deploy-cloudflare.yml` — `push` to `master` only, i.e. when a pull request
  is merged. The same gates run first, then `wrangler deploy`. Manual dispatch is allowed but
  guarded by `github.ref == 'refs/heads/master'`, so a feature branch can never be published.

Repository secrets (`Settings → Secrets and variables → Actions`):

- `CLOUDFLARE_API_TOKEN` — Workers Scripts Edit, Workers Routes Edit, Account Settings Read.
- `CLOUDFLARE_ACCOUNT_ID` — the account owning the `ashesborn.cloud` zone and both buckets.

`UPLOAD_AUTH_KEY` stays a Worker secret; the build job never needs it.

## Notes

- `lib/generated/post-index.json` is gitignored and produced by the prebuild script — run
  `node scripts/generate-post-index.js` before `tsc`, or the typecheck fails on a fresh checkout.
- Tests import a `node:sqlite` adapter for D1 and an in-memory bucket, so they run with no
  account and no network. `pnpm run preview` is the way to exercise the real Worker locally.
- Anything that writes (uploads, PATCH, DELETE) needs `UPLOAD_AUTH_KEY`; the pages read it from
  the URL fragment or prompt for it in the admin forms.
