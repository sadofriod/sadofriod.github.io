#!/usr/bin/env node
/**
 * Build the public graph payload for the dataset pages from the published JSONL.
 *
 * Downloads the three .jsonl.gz files from the Hugging Face dataset, keeps the
 * 12 retracted seeds with the most citing works, and writes:
 *   public/data/retraction-graph.json   — nodes/edges for the canvas rendering
 *   data/retraction-graph-meta.json     — seed table + counts used by the page copy
 *
 * Deterministic: no timestamps, sorted ids, fixed seed ordering.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const REPO = 'ashesborn6/integrity-citation-retraction-graph';
const BASE = `https://huggingface.co/datasets/${REPO}/resolve/main`;
const FILES = ['data/papers.jsonl.gz', 'data/cites.jsonl.gz', 'data/retraction_status.jsonl.gz'];
const CACHE = path.join('.cache', 'hf-integrity');

async function fetchGz(rel) {
  const dest = path.join(CACHE, path.basename(rel));
  try {
    return await readFile(dest);
  } catch {
    // not cached yet
  }
  const res = await fetch(`${BASE}/${rel}`);
  if (!res.ok) throw new Error(`${rel}: HTTP ${res.status}`);
  await mkdir(CACHE, { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return readFile(dest);
}

async function readJsonl(rel) {
  const gz = await fetchGz(rel);
  const raw = await new Promise((resolve, reject) => {
    const chunks = [];
    const gunzip = createGunzip();
    gunzip.on('data', (chunk) => chunks.push(chunk));
    gunzip.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    gunzip.on('error', reject);
    gunzip.end(gz);
  });
  return raw.split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

const [papers, cites, statuses] = await Promise.all(FILES.map(readJsonl));
const paperById = new Map(papers.map((p) => [p.paper_id, p]));

const retracted = new Map();
for (const row of statuses) {
  if (!row.is_retracted) continue;
  const entry = retracted.get(row.paper_id) ?? { date: null };
  if (!entry.date && row.retraction_date) entry.date = String(row.retraction_date).slice(0, 10);
  retracted.set(row.paper_id, entry);
}

const citersBySeed = new Map();
for (const edge of cites) {
  if (!retracted.has(edge.cited_id)) continue;
  const set = citersBySeed.get(edge.cited_id) ?? new Set();
  set.add(edge.citing_id);
  citersBySeed.set(edge.cited_id, set);
}

const seeds = [...citersBySeed.entries()]
  .sort((a, b) => b[1].size - a[1].size || (a[0] < b[0] ? -1 : 1))
  .slice(0, 12)
  .map(([id, citers]) => ({ id, citers }));

const seedIds = new Set(seeds.map((s) => s.id));
const citerSeeds = new Map();
for (const seed of seeds) {
  for (const citer of citersBySeed.get(seed.id)) {
    const list = citerSeeds.get(citer) ?? [];
    list.push(seed.id);
    citerSeeds.set(citer, list);
  }
}

const nodes = [];
const index = new Map();
const add = (id, kind) => {
  if (index.has(id)) return index.get(id);
  const paper = paperById.get(id) ?? {};
  index.set(id, nodes.length);
  nodes.push({
    i: id,
    t: String(paper.title ?? '').slice(0, 120),
    y: paper.publication_year ?? null,
    k: kind,
    ...(kind === 'c' ? { n: citerSeeds.get(id).length } : {}),
  });
  return index.get(id);
};

const seedTable = seeds.map((seed) => {
  const paper = paperById.get(seed.id) ?? {};
  add(seed.id, 's');
  return {
    id: seed.id,
    doi: paper.doi ?? null,
    title: paper.title ?? null,
    year: paper.publication_year ?? null,
    retraction_date: retracted.get(seed.id)?.date ?? null,
    citers: seed.citers.size,
  };
});

const citerIds = [...citerSeeds.keys()].sort();
for (const id of citerIds) add(id, 'c');

const edges = [];
for (const id of citerIds) {
  for (const seed of citerSeeds.get(id).filter((s) => seedIds.has(s))) {
    edges.push([index.get(id), index.get(seed)]);
  }
}

const dist = {};
for (const list of citerSeeds.values()) dist[list.length] = (dist[list.length] ?? 0) + 1;

const payload = {
  snapshot: 'ri-20261025-1526',
  nodes,
  edges,
  seeds: seedTable,
  stats: {
    seed_count: seedTable.length,
    citer_count: citerIds.length,
    edge_count: edges.length,
    multi_citers: Object.entries(dist).filter(([k]) => Number(k) > 1).reduce((sum, [, v]) => sum + v, 0),
    dist,
  },
};

await mkdir('public/data', { recursive: true });
await writeFile('public/data/retraction-graph.json', JSON.stringify(payload));
await writeFile(
  'data/retraction-graph-meta.json',
  `${JSON.stringify({ snapshot: payload.snapshot, stats: payload.stats, seeds: payload.seeds }, null, 1)}\n`
);
console.log(JSON.stringify(payload.stats));
