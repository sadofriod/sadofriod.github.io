# Photography + podcast: media, database, and setup

Photography and podcast episodes share the same shape: **bytes in R2, metadata in D1**.
D1 is Cloudflare's SQLite — serverless, free tier, no external account, and the binding works in
`wrangler dev` locally without any extra setup.

```
browser ──▶ Worker (worker.js)
              ├─ /photos/p/:id?w=800   → PHOTOS (R2) → stored WebP preview (or Images transform)
              ├─ /photos/o/:id         → PHOTOS (R2) → attachment download
              ├─ /podcast-media/*      → PODCASTS (R2) → range requests (audio seeking)
              ├─ /api/photos, /api/podcasts, /podcast/rss
              │     └─▶ DB (D1) → tables photos, podcast_episodes
              └─ everything else       → static assets from out/ (the Next.js export)
```

Schema: `migrations/0001_podcasts_and_photos.sql`. SQL lives in `lib/photoStore.js` and
`lib/podcastStore.js`, and is exercised against an in-process SQLite by `pnpm test:db`
(20 assertions) and `pnpm test:routes` (28 assertions, the real routers + an in-memory R2).

## Already provisioned

| Resource | Value |
| --- | --- |
| R2 bucket (photos) | `ashesborn-photos` (`wr photos`) |
| R2 bucket (podcast) | `ashesborn-podcasts` (pre-existing) |
| D1 database | `ashesborn-blog` — id `507abc83-44bf-41db-b238-34d7fa17b202`, bound as `DB` |
| D1 schema | applied: tables `photos`, `podcast_episodes` + 3 indexes |
| Upload key | `UPLOAD_AUTH_KEY` Worker secret (pre-existing) |
| Plans | `workers_paid` + `r2_paid` active |

## Commands

```bash
pnpm db:migrate         # wrangler d1 migrations apply ashesborn-blog --remote
pnpm db:migrate:local   # same against the local dev database
pnpm test:db            # schema + both stores against in-process SQLite
pnpm test:routes        # both routers end to end (no Cloudflare, no server)
pnpm run build          # static export + type check
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

## Running the Worker locally

D1 and R2 both have local implementations inside wrangler, so no database server is needed:

```bash
pnpm db:migrate:local
wrangler dev --port 8799            # real Worker code, local R2 + local D1
```

`UPLOAD_AUTH_KEY` for local runs: put it in `.dev.vars` (gitignored) or pass `--var UPLOAD_AUTH_KEY:dev-key`.
Then `curl -F file=@photo.jpg -F authKey=dev-key http://127.0.0.1:8799/api/photos` exercises the
whole path — this is how the two Worker-only bugs below were found.

## Uploading

- Photo: `/photography/upload?authKey=<UPLOAD_AUTH_KEY>` (key kept in `sessionStorage`, like the
  podcast admin flow). The page downscales to a 1600 px WebP in the browser and posts both files,
  so the gallery never serves a 12 MB original and **no image-optimisation product is needed**.
- Episode: `/podcast?authKey=<UPLOAD_AUTH_KEY>` → *Upload*.
- RSS: `/podcast/rss` (iTunes tags, ordered by `published_on desc`).

## Verifying a deployment

```bash
curl -s https://blog.ashesborn.cloud/api/photos | head            # [] when empty, 503 if DB is unbound
curl -s https://blog.ashesborn.cloud/api/photo-collections        # [{"collection":"street","count":2}]
curl -s https://blog.ashesborn.cloud/api/podcasts | head
curl -sI "https://blog.ashesborn.cloud/photos/p/<id>"             # x-photo-source: stored-preview
curl -s https://blog.ashesborn.cloud/podcast/rss | head -c 400
```

## Notes for future work

- **Cloudflare Images** is not subscribed on this account (`5403 not authorized`), which is why
  previews are generated in the browser. Add `"images": { "binding": "IMAGES" }` to
  `wrangler.jsonc` and `lib/photoMedia.js` starts transforming originals to arbitrary widths.
- **Old episodes** live in a retired Prisma/Postgres + S3 setup and were never migrated, so
  `/api/podcasts` starts empty; re-upload through the admin page (the API shape is unchanged).
- **D1 quirks handled in `lib/`**: arrays are stored as JSON text (`parseJsonArray`/`toJsonArray`),
  booleans as `0/1`, and `updated_at` is set with `datetime('now')` inside the UPDATE statement.
