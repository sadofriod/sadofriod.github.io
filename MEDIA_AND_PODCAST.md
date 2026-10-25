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

Schema: `migrations/0001_podcasts_and_photos.sql`, `0002_podcast_video.sql`, and
`0003_photo_metadata.sql`, and `0004_photo_watermark.sql`. SQL lives in `lib/photoStore.js` and `lib/podcastStore.js`, and is
exercised against an in-process SQLite by `node scripts/test-db-stores.mjs` (32 assertions) and
`node scripts/test-worker-routes.mjs` (45 assertions, including metadata persistence and geocode-cache
coverage). The hand-written EXIF parser has 15 fixture assertions in `node scripts/test-photo-metadata.mjs`.

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

## The episode that was already in R2

`ashesborn-podcasts` already held the files, at the bucket root:

| Key | Size | Type |
| --- | --- | --- |
| `S01E01.mp3` | 45,515,673 B | audio/mpeg (MPEG-1 L3, 256 kbps CBR, 44.1 kHz → 23:42) |
| `S01E01.mp4` | 233,144,891 B | video/mp4 |

They are registered in D1 as one episode (season 1, episode 1) and nothing was moved or
re-uploaded: `audio_key = 'S01E01.mp3'`, `video_key = 'S01E01.mp4'`.

`/podcast-media/<key>` now serves **only keys an episode actually references** (one indexed lookup
against `audio_key` / `cover_key` / `video_key`), which is also why root-level keys are fine — the
old prefix allowlist would have rejected them. Without a DB binding it falls back to the upload
prefixes.

Video is optional per episode: `video_key` / `video_size` / `video_type` columns, exposed as
`metadata.videoUrl`, rendered as a `<video controls>` above the audio player. Set it from the admin
UI by pasting an existing R2 key (the Worker `head()`s the object, so a typo is a 400, not a broken
player). Video is deliberately **not** uploaded through the Worker — a 200 MB multipart body is not
something a request should carry; put the file in R2 and reference it.

## Uploading

- Photo: `/photography/upload?authKey=<UPLOAD_AUTH_KEY>` (key kept in `sessionStorage`, like the
  podcast admin flow). Select multiple images and upload them without entering manual fields;
  capture metadata automatically assigns each photo to its `YYYY-MM` collection (`undated` when
  no date is present). The page downscales to a 1600 px WebP in the browser and posts both files,
  so the gallery never serves a 12 MB original and **no image-optimisation product is needed**.
  Each frame gets up to three upload attempts with exponential backoff and jitter; HTTP `Retry-After`
  is honoured for rate limits. The pending file-level queue, including parsed metadata and resolved
  place, is saved in IndexedDB and restored after reload. A stopped batch resumes from its unfinished
  frames when you press Upload again. Each file is one multipart POST (up to 30 MB); byte-range
  resumption within a file is not supported and would require a chunked-upload Worker endpoint and
  R2 multipart state.
- Episode: `/podcast?authKey=<UPLOAD_AUTH_KEY>` → *Upload*.
- RSS: `/podcast/rss` (iTunes tags, ordered by `published_on desc`).

## Photo metadata

The upload page parses JPEG, PNG, and WebP EXIF in the browser for capture date, GPS,
camera/lens/exposure details, and keywords. GPS coordinates are reverse-geocoded; new coordinates in
a batch are resolved serially at least one second apart, and repeated rounded coordinates reuse the
same lookup. Place details and metadata are stored in the `photos` columns from
`migrations/0003_photo_metadata.sql`. Reverse-geocode responses are cached in `photo_geocodes`, keyed
to rounded coordinates and refreshed after 90 days. Set `GEOCODE_PROVIDER` to `nominatim` (default),
`bigdatacloud`, or `off` for local/offline use.

Nominatim requires a descriptive User-Agent and must not be queried repeatedly for the same location;
the D1 cache limits traffic and follows the OpenStreetMap Nominatim usage policy. The Worker falls
back to BigDataCloud when the selected provider is unavailable.

```bash
curl -s 'https://blog.ashesborn.cloud/api/photo-geocode?lat=30.2741&lon=120.1551&lang=en'
curl -s 'https://blog.ashesborn.cloud/api/photos'
```

## Watermark

Each uploaded preview contains an invisible 88-bit DCT payload: an 8-byte ID derived from the first
2 MB of the original file plus `ashesborn-photo`, a CRC-16/CCITT checksum, and a version byte. The
watermark is applied to the 1600 px WebP preview only; the downloadable original remains byte-for-byte
untouched. At the measured strength the prototype reached 37.1 dB PSNR and survived WebP/JPEG
re-encoding and rescaling.

Existing photos can be backfilled after configuring `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` (the default bucket is `ashesborn-photos`):

```bash
node --experimental-strip-types scripts/watermark-backfill.mjs --local
node --experimental-strip-types scripts/watermark-backfill.mjs --remote --dry-run
```

The backfill keeps prior preview objects and updates D1 to a versioned preview key. Verify an image
from the command line with `node --experimental-strip-types scripts/watermark-verify.mjs photo.webp`,
or use the public browser verifier at `/photography/verify`. A valid ID can also be looked up at
`/api/photos?watermark=<16-hex-id>`. The watermark is robust to re-encoding and rescaling, but does
not survive heavy cropping or deliberate watermark removal.

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
