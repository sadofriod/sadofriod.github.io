#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const blockedHosts = ['v2ex.com', 'v2ex.co', 'ashesborn.cloud', 'x.com', 'twitter.com', 't.me', 'youtube.com'];
const resourceExtension = /\.(?:png|jpe?g|gif|webp|svg|ico|pdf|zip|rar|mp4|mp3|exe)$/i;
const fileExtensionTld = /^(?:php|html|htm|shtml|js|mjs|css|json|xml|txt|md|aspx|asp|jsp|pdf|png|jpg|jpeg|gif|webp|svg|ico|zip|rar|mp4|mp3|exe|apk|dmg)$/i;
const trailingPunctuation = /[.,;:!?()[\]{}<>"'`，。；：！？、（）【】「」『』《》…]+$/u;

function parseArgs(args) {
  const options = { topic: '1251306', out: 'data/friends.json', write: false, maxPages: 20, timeBudget: 180 };
  for (let index = 0; index < args.length; index += 1) {
    const [flag, ...parts] = args[index].split('=');
    if (flag === '--write' && parts.length === 0) {
      options.write = true;
      continue;
    }
    if (!['--topic', '--out', '--max-pages', '--time-budget'].includes(flag)) throw new Error(`Unknown argument: ${args[index]}`);
    const value = parts.length ? parts.join('=') : args[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    const key = { '--max-pages': 'maxPages', '--time-budget': 'timeBudget' }[flag] ?? flag.slice(2);
    options[key] = value;
  }
  if (!/^\d+$/.test(options.topic)) {
    const url = new URL(options.topic);
    if (!['http:', 'https:'].includes(url.protocol) || !/^(?:www\.)?v2ex\.com$/i.test(url.hostname)) {
      throw new Error('--topic must be a V2EX topic ID or URL');
    }
    options.topic = url.pathname.match(/^\/t\/(\d+)(?:\/|$)/)?.[1];
  }
  if (!options.topic || !/^[1-9]\d*$/.test(options.topic)) throw new Error('Invalid topic ID');
  options.maxPages = Number(options.maxPages);
  if (!Number.isSafeInteger(options.maxPages) || options.maxPages < 1) throw new Error('--max-pages must be a positive integer');
  options.timeBudget = Number(options.timeBudget);
  if (!Number.isFinite(options.timeBudget) || options.timeBudget <= 0 || options.timeBudget > Number.MAX_SAFE_INTEGER / 1000) {
    throw new Error('--time-budget must be a positive number of seconds');
  }
  return options;
}

function friendHost(url) {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Keep the published-entry checks in sync with lib/friends.ts#getFriends.
function validateFriends(entries) {
  if (!Array.isArray(entries)) throw new Error('Invalid friends data: expected an array');
  const ids = new Set();
  const hosts = new Set();
  entries.forEach((entry, index) => {
    const fail = (message) => { throw new Error(`Invalid friend at index ${index}: ${message}`); };
    if (!isRecord(entry)) return fail('expected an object');
    if (entry.status === 'draft') return;
    if (entry.status !== undefined && entry.status !== 'published') return fail('invalid status');
    for (const field of ['id', 'name', 'url', 'blurb']) {
      if (!isNonEmptyString(entry[field])) return fail(`${field} is required`);
    }
    let url;
    try {
      url = new URL(entry.url);
    } catch {
      return fail('url must be a valid HTTP(S) URL');
    }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return fail('url must be a valid HTTP(S) URL');
    const id = entry.id.trim();
    const host = friendHost(url.href);
    if (ids.has(id)) return fail(`duplicate id "${id}"`);
    if (hosts.has(host)) return fail(`duplicate host "${host}"`);
    if (entry.tags !== undefined && (!Array.isArray(entry.tags) || !entry.tags.every(isNonEmptyString))) {
      return fail('tags must be an array of non-empty strings');
    }
    if (entry.lang !== undefined && !['zh', 'en', 'ja', 'ko', 'es'].includes(entry.lang)) return fail('invalid lang');
    if (!isRecord(entry.source)) return fail('source is required');
    const source = entry.source;
    if (!['v2ex', 'manual'].includes(source.platform)) return fail('invalid source.platform');
    if (!isNonEmptyString(source.collectedAt) || !Number.isFinite(Date.parse(source.collectedAt))) {
      return fail('source.collectedAt must be a valid date');
    }
    for (const field of ['topic', 'author']) {
      if (source[field] !== undefined && typeof source[field] !== 'string') return fail(`source.${field} must be a string`);
    }
    if (source.floor !== undefined && (!Number.isInteger(source.floor) || source.floor < 0)) {
      return fail('source.floor must be a non-negative integer');
    }
    ids.add(id);
    hosts.add(host);
  });
}

function extractUrls(text) {
  // Consume other schemes and email addresses too, so their domains are not
  // accidentally reinterpreted as bare HTTP links.
  const pattern = /[a-z][a-z\d+.-]*:(?:\/\/)?[^\s<>"'`\u3000-\u303f\u3400-\u9fff\uff00-\uffef]+|(?:[a-z\d._%+-]+@)?(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,63}(?::\d+)?(?:[/?#][^\s<>"'`\u3000-\u303f\u3400-\u9fff\uff00-\uffef]*)?/gi;
  return Array.from(text.matchAll(pattern), (match) => match[0].replace(trailingPunctuation, ''));
}

function normalizeUrl(raw) {
  if ((raw.includes('@') && !raw.includes('://')) || (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw) && !/^[^:/]+\.\w+:\d+(?:[/?#]|$)/.test(raw))) return null;
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    const host = friendHost(url.href);
    if (!/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,63}$/i.test(host)) return null;
    const labels = host.split('.');
    const tld = labels.at(-1);
    if (labels.length < 2 || /^\d+$/.test(tld) || fileExtensionTld.test(tld)) return null;
    if (blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) return null;
    if (resourceExtension.test(decodeURIComponent(url.pathname))) return null;
    return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}${url.search}`;
  } catch {
    return null;
  }
}

function decodeEntities(text) {
  const entities = {
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
    ndash: '–', mdash: '—', hellip: '…', middot: '·', copy: '©', reg: '®',
    lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•', trade: '™',
  };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, value) => {
    if (value[0] !== '#') return entities[value.toLowerCase()] ?? entity;
    const point = value[1].toLowerCase() === 'x' ? parseInt(value.slice(2), 16) : Number(value.slice(1));
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
  });
}

function cleanText(text) {
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  }
  return result;
}

function decodeHtml(bytes, contentType) {
  const preview = new TextDecoder('latin1').decode(bytes);
  const metas = Array.from(preview.matchAll(/<meta\b[^>]*>/gi), (match) => attributes(match[0]));
  const charset = contentType.match(/charset\s*=\s*["']?([^\s;"']+)/i)?.[1]
    ?? metas.find((meta) => meta.charset)?.charset
    ?? metas.find((meta) => /charset\s*=/i.test(meta.content ?? ''))?.content.match(/charset\s*=\s*([^\s;"']+)/i)?.[1]
    ?? 'utf-8';
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': userAgent },
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const html = decodeHtml(await response.arrayBuffer(), response.headers.get('content-type') ?? '');
  const title = cleanText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? '')
    .replace(/(?:\s*[-|｜–—·_:：]\s*(?:首页|主页|博客|个人博客|个人网站|Home|Homepage|Blog))+(?:\s*[-|｜–—·_:：]\s*)?$/i, '')
    .replace(/^[\s|｜–—·_:：-]+|[\s|｜–—·_:：-]+$/g, '');
  const metas = Array.from(html.matchAll(/<meta\b[^>]*>/gi), (match) => attributes(match[0]));
  const description = cleanText(metas.find((meta) => meta.name?.toLowerCase() === 'description' && meta.content?.trim())?.content
    ?? metas.find((meta) => meta.property?.toLowerCase() === 'og:description')?.content ?? '');
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ?? html;
  const text = cleanText(body.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' '));
  const characters = Array.from(text.replace(/\s/g, ''));
  const cjk = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  return { title, description, lang: characters.length && cjk / characters.length > 0.08 ? 'zh' : 'en' };
}

function truncate(text, length) {
  return Array.from(text).slice(0, length).join('');
}

function replyBlurb(content) {
  let text = content;
  for (const url of extractUrls(content)) text = text.replace(url, ' ');
  text = cleanText(text);
  return truncate(text.match(/^.*?[。！？.!?](?=\s|$)/u)?.[0] ?? text.split(/[。！？]/u)[0], 120);
}

async function collectReplies(topic, maxPages, deadline) {
  const replies = [];
  const seenIds = new Set();
  for (let page = 1; page <= maxPages; page += 1) {
    if (performance.now() >= deadline) break;
    const url = `https://www.v2ex.com/api/replies/show.json?topic_id=${topic}&page=${page}`;
    const response = await fetch(url, { headers: { 'User-Agent': userAgent }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`V2EX HTTP ${response.status} (page ${page})`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`V2EX returned a non-array (page ${page})`);
    const previousCount = replies.length;
    for (const reply of data) {
      if (seenIds.has(reply.id)) continue;
      seenIds.add(reply.id);
      replies.push({ ...reply, floor: replies.length + 1 });
    }
    if (replies.length === previousCount || data.length < 100) break;
  }
  return replies;
}

async function fetchCandidates(candidates, deadline) {
  const results = new Array(candidates.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < candidates.length && performance.now() < deadline) {
      const index = nextIndex++;
      try {
        results[index] = { page: await fetchPage(candidates[index].url) };
      } catch {
        results[index] = { failed: true };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, candidates.length) }, () => worker()));
  return results;
}

async function main() {
  const startedAt = performance.now();
  const options = parseArgs(process.argv.slice(2));
  const deadline = startedAt + options.timeBudget * 1000;
  const original = await readFile(options.out, 'utf8');
  const existing = JSON.parse(original);
  validateFriends(existing);
  const seen = new Set(existing.filter((entry) => typeof entry.url === 'string').map((entry) => friendHost(entry.url)));
  const ids = new Set(existing.filter((entry) => typeof entry.id === 'string').map((entry) => entry.id.trim()));
  const replies = await collectReplies(options.topic, options.maxPages, deadline);
  const candidates = [];
  const added = [];
  const failed = [];
  let skipped = 0;
  let timedOut = 0;
  const collectedAt = new Date().toISOString().slice(0, 10);
  for (const reply of replies) {
    const content = typeof reply.content === 'string' ? reply.content : '';
    for (const raw of extractUrls(content)) {
      const url = normalizeUrl(raw);
      if (!url) {
        skipped += 1;
        continue;
      }
      const host = friendHost(url);
      if (seen.has(host)) {
        skipped += 1;
        continue;
      }
      seen.add(host);
      candidates.push({ url, host, reply, content });
    }
  }
  const results = await fetchCandidates(candidates, deadline);
  // Consume results in reply/link order, regardless of request completion order.
  for (const [index, { url, host, reply, content }] of candidates.entries()) {
    const result = results[index];
    if (!result) {
      timedOut += 1;
      continue;
    }
    if (result.failed) {
      failed.push(host);
      continue;
    }
    const { page } = result;
    const blurb = truncate(page.description || replyBlurb(content), 140);
    if (!blurb) {
      skipped += 1;
      continue;
    }
    const baseId = host.replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '');
    let id = baseId;
    for (let suffix = 2; ids.has(id); suffix += 1) id = `${baseId}-${suffix}`;
    ids.add(id);
    added.push({
      id,
      name: truncate(page.title || host, 80),
      url,
      blurb,
      lang: page.lang,
      tags: ['v2ex'],
      group: 'friends',
      source: {
        platform: 'v2ex',
        topic: `https://www.v2ex.com/t/${options.topic}`,
        floor: reply.floor,
        author: typeof reply.member?.username === 'string' ? reply.member.username : '',
        collectedAt,
      },
      status: 'published',
    });
  }
  const merged = [...existing, ...added];
  validateFriends(merged);
  if (options.write) {
    if (await readFile(options.out, 'utf8') !== original) throw new Error('Friends data changed during collection; refusing to overwrite');
    await writeFile(options.out, `${JSON.stringify(merged, null, 2)}\n`);
  }
  for (const entry of added) console.log(`+ ${friendHost(entry.url)}  ${entry.name}  ${entry.source.floor} 楼`);
  const failures = failed.length ? `（${failed.join(', ')}）` : '';
  console.log(`新增 ${added.length} / 已存在或跳过 ${skipped} / 抓取失败 ${failed.length}${failures} / 超时未抓 ${timedOut}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
