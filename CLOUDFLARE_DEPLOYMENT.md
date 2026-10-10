# Cloudflare Workers Deployment

This project statically exports Next.js pages and serves them from Cloudflare Workers Static Assets. Article Markdown and React rendering happen at build time, so requests do not consume the Free plan's 10 ms Worker CPU budget. Podcast audio, covers, and metadata use Cloudflare R2; the former database-backed tobacco-record feature remains removed.

## Deploy

1. Install dependencies with `pnpm install`.
2. In the `ashesborn.cloud` Cloudflare DNS zone, keep the existing `blog` CNAME target (`cname.vercel-dns.com`) and set its proxy status to **Proxied**. The Worker route is configured for `blog.ashesborn.cloud/*`; DNS-only records bypass Worker routes.
3. Create the `ashesborn-podcasts` R2 bucket if it does not already exist: `pnpm exec wrangler r2 bucket create ashesborn-podcasts`. The `PODCASTS` binding is already configured in `wrangler.jsonc`.
4. Set the upload secret with `pnpm exec wrangler secret put UPLOAD_AUTH_KEY`.
5. Set `NEXT_PUBLIC_SITE_URL=https://blog.ashesborn.cloud` in the build environment.
6. Run `pnpm run preview` to test locally, then `pnpm run deploy` to publish.

## Local Worker Preview

Use `pnpm run preview` to build and serve the static export locally with Wrangler. Wrangler provides a local R2 emulator for podcast tests; production uploads require the `UPLOAD_AUTH_KEY` Worker secret.

## GitHub Actions

`.github/workflows/deploy-cloudflare.yml` builds pull requests targeting `master`, deploys pushes to `master`, and can also be started with **Actions → Deploy Cloudflare Worker → Run workflow**. Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`: a token with Workers Scripts Edit, Workers Routes Edit, and Account Settings Read permissions.
- `CLOUDFLARE_ACCOUNT_ID`: the account ID that owns the `ashesborn.cloud` zone and `ashesborn-podcasts` bucket.

The `UPLOAD_AUTH_KEY` remains a Worker secret and is not needed by the build job.

## Notes

- The standard `pnpm dev` command remains available for Next.js development.
- Pages, articles, categories, RSS, sitemap, and robots are generated during `pnpm run build` and served as static assets.
- Podcast audio, cover images, and per-episode metadata are stored in the `ashesborn-podcasts` R2 bucket. Audio is streamed through the Worker with byte-range support.
- Existing podcast rows/files from the former database/S3 setup are not imported automatically; the previous stores remain unchanged.
- The latest dry run measured about 1.5 KiB compressed Worker code; static assets are uploaded separately. Check after changes with `pnpm exec wrangler deploy --dry-run`.
- The long legacy article URL redirects to a stable short slug to avoid filesystem path limits during static export.
- Cloudflare account authentication is required before running `pnpm run deploy`.