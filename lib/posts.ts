import { slugToFilename } from './utils';
import postIndex from './generated/post-index.json';

export type PostMetadata = {
  /** Source markdown file name, e.g. `remote-work-after-four-years.md`. */
  file?: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  p?: string;
  keywords?: string;
  slug: string;
  content?: string;
  description?: string;
  isHidden?: boolean;
  summary?: string;
  image?: string;
  legacySlug?: string;
  /** `zh` or `en`; empty for posts that predate the tagging. */
  lang?: string;
  /** Same value on every language version of one article. */
  translationKey?: string;
  /** lang → slug for the sibling versions (including this one). */
  alternates?: Record<string, string>;
  /** The English copy when one exists, else the first in the group. */
  isPrimary?: boolean;
};

type IndexedPost = PostMetadata & {
  content: string;
};

const indexedPosts = postIndex as IndexedPost[];

export function getAllPostIds() {
  return indexedPosts.map(({ content: _content, legacySlug: _legacySlug, ...metadata }) => metadata);
}

export function getPostData(slug: string) {
  const normalizedSlug = slugToFilename(slug);
  const post = indexedPosts.find((entry) => slugToFilename(entry.slug) === normalizedSlug);

  if (!post) {
    throw new Error(`Blog post not found: ${normalizedSlug}`);
  }

  return post;
}

/**
 * Every language version of one article, as `{ lang: slug }`.
 * The language switcher uses the generated JSON client-side; this is the server
 * counterpart used by metadata and the sitemap.
 */
export function getAlternates(slug: string): Record<string, string> {
  const post = indexedPosts.find((entry) => entry.slug === slug || slugToFilename(entry.slug) === slugToFilename(slug));
  return post?.alternates ?? {};
}

/** One entry per article, in the requested language when that version exists. */
export function getListingPosts(locale: string): PostMetadata[] {
  const groups = new Map<string, PostMetadata[]>();

  for (const post of getAllPostIds()) {
    const key = post.translationKey || post.slug;
    const group = groups.get(key);
    if (group) group.push(post);
    else groups.set(key, [post]);
  }

  return Array.from(groups.values()).map(
    (group) => group.find((post) => post.lang === locale) ?? group.find((post) => post.isPrimary) ?? group[0]
  );
}

export function getSortedPostsData() {
  return [...indexedPosts].sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}

/**
 * Resolve a post by its source file name.
 * The profile data references posts this way because non-ASCII file names get
 * hashed slugs in the generated index.
 */
export function getPostByFile(file: string): PostMetadata {
  const target = file.trim();
  const post = indexedPosts.find((entry) => entry.file?.trim() === target);

  if (!post) {
    throw new Error(`profile reference not found: ${target}`);
  }

  const { content: _content, legacySlug: _legacySlug, ...metadata } = post;
  return metadata;
}

export function getPostBySlug(slug: string): { content: string; metadata: PostMetadata } {
  const post = getPostData(slug);
  const { content, ...metadata } = post;

  return { content, metadata };
}