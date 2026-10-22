# Photography + podcast: media, database, and the one-time setup

Photography and podcast episodes share the same shape: **bytes in R2, metadata in Postgres**.
Postgres is reached from the Worker through a **Cloudflare Hyperdrive** binding, so the same
deployment works against Neon, Supabase, or a self-hosted Postgres without changing code.

```
browser ──▶ Worker (worker.js)
              ├─ /photos/p/:id?w=800   → PHOTOS (R2) ──▶ Images binding (transform) ──▶ WebP
              ├─ /photos/o/:id         → PHOTOS (R2) ──▶ attachment download
              ├─ /podcast-media/*      → PODCASTS (R2) ──▶ range requests (audio seeking)
              ├─ /api/photos, /api/podcasts, /podcast/rss
              │     └─▶ HYPERDRIVE ──▶ Postgres (photos, podcast_episodes)
              └─ everything else       → static assets from out/ (the Next.js export)
```

Tables live in `migrations/0001_podcasts_and_photos.sql`; the SQL the Worker runs lives in
`lib/podcastStore.js` and `lib/photoStore.js` and is exercised against a throwaway Postgres by
`pnpm test:db`.

## One-time setup (needs Cloudflare credentials)

Everything below is a one-off. `wrangler` must be logged in (`CLOUDFLARE_API_TOKEN` in CI already is).

### 1. R2 bucket for photos

```bash
npx wrangler r2 bucket create ashesborn-photos
```

`wrangler.jsonc` already binds it as `PHOTOS`. The podcast bucket (`ashesborn-podcasts`) already exists.

### 2. Postgres + Hyperdrive

Hyperdrive is a pooler in front of an existing Postgres — it does not create a database.
Point it at whatever you already run (Neon free tier is enough for both tables):

```bash
npx wrangler hyperdrive create blog-db \
  --connection-string="postgres://user:password@host:5432/dbname?sslmode=require"
```

This prints a config `id`. Uncomment the block at the end of `wrangler.jsonc` and fill it in:

```jsonc
"hyperdrive": [{ "binding": "HYPERDRIVE", "id": "<that id>" }]
```

> The block ships **commented out** on purpose: while it is commented the Worker
> deploys normally and the photo/podcast APIs answer `503 Database is not configured`,
> so a deploy never breaks on a missing id.

### 3. Schema

```bash
DATABASE_URL='postgres://user:password@host:5432/dbname?sslmode=require' pnpm db:migrate
```

Prints `applied 0001_podcasts_and_photos.sql` and the resulting table list. Safe to re-run
(every statement is `IF NOT EXISTS`).

### 4. Upload key

`UPLOAD_AUTH_KEY` is already set as a Worker secret (the existing podcast upload flow uses it).
To rotate:

```bash
npx wrangler secret put UPLOAD_AUTH_KEY
```

### 5. Workers Paid (optional but recommended)

Two paid capabilities are used:

| Capability | Bound as | Without it |
| --- | --- | --- |
| Hyperdrive | `env.HYPERDRIVE` | photo + podcast APIs answer `503 Database is not configured` |
| Workers Paid plan | n/a | Hyperdrive is unavailable; the account needs the $5/mo plan |

R2 and Workers Paid are already active on this account (`r2_paid`, `workers_paid`).

### Previews without Cloudflare Images

The upload page downscales each photo in the browser (canvas → WebP, max 1600 px, quality 0.82) and
posts it next to the original. The Worker stores it at `photos/previews/<id>.webp` and
`/photos/p/:id` serves that file — so the gallery is fast on the R2 free tier and needs **no**
Images subscription.

If the account later subscribes to Cloudflare Images, add

```jsonc
"images": { "binding": "IMAGES" }
```

and `lib/photoMedia.js` starts transforming the original to arbitrary widths (`?w=400|800|1200|1600|2000`).
Until then `?w=` is ignored and the stored preview is returned.

## Day-to-day

- Upload a photo: open `/photography/upload?authKey=<UPLOAD_AUTH_KEY>` once — the key is kept in
  `sessionStorage` for the rest of the session, like the podcast admin flow.
- Upload an episode: `/podcast?authKey=<UPLOAD_AUTH_KEY>` → *Upload*.
- RSS stays at `/podcast/rss` (iTunes tags included), episodes are ordered by `published_on desc`.

## Verifying a deployment

```bash
curl -s https://blog.ashesborn.cloud/api/photos | head            # [] when empty, 503 when HYPERDRIVE is missing
curl -s https://blog.ashesborn.cloud/api/photo-collections        # [{"collection":"street","count":2}]
curl -s https://blog.ashesborn.cloud/api/podcasts | head
curl -sI "https://blog.ashesborn.cloud/photos/p/<id>?w=800"       # x-photo-source: images-binding | original
curl -s https://blog.ashesborn.cloud/podcast/rss | head -c 400
```

Local checks that need no credentials:

```bash
pnpm test:db                 # schema + both stores against in-process Postgres (PGlite)
pnpm run build               # static export, type-check
npx wrangler deploy --dry-run --outdir .wrangler/dry-run   # bundle + binding wiring
```

## Restoring the pre-2026 episodes

The earlier implementation kept episodes in a Prisma/Postgres database (plus S3 audio) on Vercel;
the R2-metadata rewrite that replaced it never carried the rows over, so `/api/podcasts` currently
returns `[]`. With the old `DATABASE_URL` still available:

```sql
-- old table was "Podcast" (id, title, date, description, duration, audioUrl, author,
-- episodeNumber, season, image, keywords, explicit)
select id, title, date, description, duration, audioUrl, author,
       "episodeNumber", season, image, keywords, explicit
from "Podcast" order by date desc;
```

Each row needs the audio re-uploaded into R2 (or copied from S3 with `rclone`) and then posted to
`/api/podcasts` with that metadata — the API is unchanged, so a small script over the export is
enough. Without the old database the episodes have to be re-uploaded by hand.
