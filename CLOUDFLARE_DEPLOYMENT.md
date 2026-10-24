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

## Admin surfaces behind Cloudflare Access

The upload and manage surfaces (`/photography/upload`, `/podcast/upload` and every write
endpoint under `/api/admin/*`) authenticate through **Cloudflare Access** instead of a shared
key, so no secret ever reaches the browser.

Write endpoints live under `/api/admin/*` on purpose: Access protects a path prefix, and the
public gallery reads `GET /api/photos`, so reads and writes cannot share one protected prefix.
`POST /api/admin/photos` and `POST /api/admin/podcasts` hit the same handlers as the public
paths; with Access configured, the shared key stops being accepted entirely.

Setup, once, in the dashboard:

1. **Zero Trust → Settings → Authentication**: keep the built-in One-time PIN, or add GitHub /
   Google as an identity provider if you want a real OAuth login.
2. **Zero Trust → Access → Applications → Add an application → Self-hosted**:
   - domain `blog.ashesborn.cloud`
   - paths: `/photography/upload`, `/podcast/upload`, `/api/admin`
   - policy: `Allow` → `Emails` → your address
3. Copy the application's **Audience (AUD) Tag**.
4. Set two Worker variables — dashboard (Workers → the worker → Settings → Variables) or
   `vars` in `wrangler.jsonc`:
   - `ACCESS_TEAM_DOMAIN=<team>.cloudflareaccess.com`
   - `ACCESS_AUD=<the AUD tag>`
5. Once uploads work through Access, the old shared key is dead weight:
   `pnpm exec wrangler secret delete UPLOAD_AUTH_KEY`.

How it is enforced: Access injects a `Cf-Access-Jwt-Assertion` header after the visitor signs
in. `lib/accessAuth.js` verifies it against the team's published signing keys (`/cdn-cgi/access/certs`,
cached for an hour), checks `aud`, `exp` and `nbf`, and matches the key by `kid`. Anything else —
no header, bad signature, wrong audience, expired, unknown kid — is a 401. With `ACCESS_TEAM_DOMAIN`
and `ACCESS_AUD` unset the Worker falls back to `UPLOAD_AUTH_KEY`, which is why the two variables
working together is the switch that turns Access on.

The admin pages ask `GET /api/whoami` which mode is live: it returns `{ access, authenticated,
email, keyRequired }`, so a page shows either the signed-in address or the legacy key form.

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
