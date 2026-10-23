import friends from '@/data/friends.json';

export type FriendLink = {
  id: string;
  name: string;
  url: string;
  blurb: string;
  tags?: string[];
  lang?: 'zh' | 'en' | 'ja' | 'ko' | 'es';
  source: {
    platform: 'v2ex' | 'manual';
    topic?: string;
    floor?: number;
    author?: string;
    collectedAt: string;
  };
  status?: 'published' | 'draft';
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function friendHost(url: string): string {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
}

export function getFriends(): FriendLink[] {
  const entries: unknown = friends;
  if (!Array.isArray(entries)) {
    throw new Error('Invalid friends data: expected an array');
  }

  const ids = new Set<string>();
  const hosts = new Set<string>();
  const published: FriendLink[] = [];

  entries.forEach((entry: unknown, index: number) => {
    const fail = (message: string): never => {
      throw new Error(`Invalid friend at index ${index}: ${message}`);
    };

    if (!isRecord(entry)) return fail('expected an object');
    if (entry.status === 'draft') return;
    if (entry.status !== undefined && entry.status !== 'published') return fail('invalid status');

    for (const field of ['id', 'name', 'url', 'blurb']) {
      if (!isNonEmptyString(entry[field])) return fail(`${field} is required`);
    }

    let url: URL;
    try {
      url = new URL(entry.url as string);
    } catch {
      return fail('url must be a valid HTTP(S) URL');
    }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
      return fail('url must be a valid HTTP(S) URL');
    }

    const id = (entry.id as string).trim();
    const host = friendHost(url.href);
    if (ids.has(id)) return fail(`duplicate id "${id}"`);
    if (hosts.has(host)) return fail(`duplicate host "${host}"`);

    if (entry.tags !== undefined && (!Array.isArray(entry.tags) || !entry.tags.every(isNonEmptyString))) {
      return fail('tags must be an array of non-empty strings');
    }
    if (entry.lang !== undefined && !['zh', 'en', 'ja', 'ko', 'es'].includes(entry.lang as string)) {
      return fail('invalid lang');
    }

    const source = entry.source;
    if (!isRecord(source)) return fail('source is required');
    if (source.platform !== 'v2ex' && source.platform !== 'manual') return fail('invalid source.platform');
    if (!isNonEmptyString(source.collectedAt) || !Number.isFinite(Date.parse(source.collectedAt))) {
      return fail('source.collectedAt must be a valid date');
    }
    for (const field of ['topic', 'author']) {
      if (source[field] !== undefined && typeof source[field] !== 'string') {
        return fail(`source.${field} must be a string`);
      }
    }
    if (source.floor !== undefined && (typeof source.floor !== 'number' || !Number.isInteger(source.floor) || source.floor < 0)) {
      return fail('source.floor must be a non-negative integer');
    }

    ids.add(id);
    hosts.add(host);
    published.push(entry as FriendLink);
  });

  return published.sort((a, b) => Date.parse(b.source.collectedAt) - Date.parse(a.source.collectedAt));
}
