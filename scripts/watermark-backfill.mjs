#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { buildPayload, embedWatermark, scanWatermark } from '../lib/watermark.ts';

const dryRun = process.argv.includes('--dry-run');
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const bucket = process.env.PHOTOS_BUCKET || 'ashesborn-photos';
// `wrangler r2 object` has no --local mode, so a local run could read D1 but never the objects.
// Backfill exists for the deployed bucket; local development re-uploads through the admin page.
if (process.argv.includes('--local')) {
  console.error('Backfill only supports --remote: `wrangler r2 object` cannot read the local dev bucket. Re-upload locally instead.');
  process.exit(2);
}
const mode = '--remote';
if (!account || !token) throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required (token value is never printed)');

function wrangler(args, { capture = false } = {}) {
  const scopedEnv = { ...process.env, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account };
  const result = spawnSync('npx', ['wrangler', ...args], { encoding: 'utf8', env: scopedEnv });
  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || `wrangler exited ${result.status}`).replaceAll(token, '[redacted]');
    throw new Error(details);
  }
  return capture ? result.stdout : '';
}

const jsonText = wrangler(['d1', 'execute', 'ashesborn-blog', mode, '--json', '--command', 'select id, preview_key, original_key, watermark_id, preview_size from photos'], { capture: true });
let parsed;
try { parsed = JSON.parse(jsonText); } catch { throw new Error('Could not parse wrangler D1 JSON response'); }
const rows = Array.isArray(parsed)
  ? parsed.flatMap((entry) => entry.results || entry?.[0]?.results || [])
  : parsed.results || [];
const pending = rows.filter((row) => !row.watermark_id);
if (!pending.length) { console.log('No photos need watermark backfill.'); process.exit(0); }
if (dryRun) {
  console.log(`Dry run: ${pending.length} photo(s) would be watermarked in ${bucket} (${mode}).`);
  for (const row of pending) console.log(`${row.id}  ${row.preview_key || '(no preview)'} -> photos/previews/${row.id}-wm.webp`);
  process.exit(0);
}

const workdir = await mkdtemp(path.join(tmpdir(), 'watermark-backfill-'));
const report = [];
let failed = 0;
try {
  for (const row of pending) {
    const originalPath = path.join(workdir, 'original');
    const previewPath = path.join(workdir, 'preview.webp');
    try {
      wrangler(['r2', 'object', 'get', `${bucket}/${row.original_key}`, '--file', originalPath, mode]);
      const original = new Uint8Array(await readFile(originalPath));
      const id = Buffer.from(createHash('sha256').update(original.subarray(0, 2 * 1024 * 1024)).update('ashesborn-photo').digest().subarray(0, 8)).toString('hex');
      const { data, info } = await sharp(original).resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      embedWatermark(data, info.width, info.height, info.channels, buildPayload(Uint8Array.from(id.match(/.{2}/g), (part) => Number.parseInt(part, 16))));
      const encoded = await sharp(data, { raw: info }).webp({ quality: 82 }).toBuffer();
      await writeFile(previewPath, encoded);
      const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const verified = scanWatermark(decoded.data, decoded.info.width, decoded.info.height, decoded.info.channels);
      if (!verified.crcOk || verified.idHex !== id) throw new Error('encoded preview failed watermark CRC verification');
      const newKey = `photos/previews/${row.id}-wm.webp`;
      wrangler(['r2', 'object', 'put', `${bucket}/${newKey}`, '--file', previewPath, mode, '--content-type', 'image/webp', '--cache-control', 'public, max-age=31536000, immutable']);
      const escapedKey = newKey.replaceAll("'", "''");
      wrangler(['d1', 'execute', 'ashesborn-blog', mode, '--command', `update photos set preview_key = '${escapedKey}', preview_size = ${encoded.length}, watermark_id = '${id}' where id = '${String(row.id).replaceAll("'", "''")}'`]);
      report.push({ id: row.id, old: row.preview_size || 0, size: encoded.length, crc: 'ok' });
    } catch (error) {
      failed += 1;
      report.push({ id: row.id, old: row.preview_size || 0, size: 'FAILED', crc: error instanceof Error ? error.message : String(error) });
    }
  }
} finally {
  await rm(workdir, { recursive: true, force: true });
}
console.log('id | old preview bytes | new preview bytes | crc ok');
for (const row of report) console.log(`${row.id} | ${row.old} | ${row.size} | ${row.crc}`);
if (failed) process.exitCode = 1;
