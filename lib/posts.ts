import { slugToFilename } from './utils';
import postIndex from './generated/post-index.json';

export type PostMetadata = {
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

export function getSortedPostsData() {
  return [...indexedPosts].sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}

export function getPostBySlug(slug: string): { content: string; metadata: PostMetadata } {
  const post = getPostData(slug);
  const { content, ...metadata } = post;

  return { content, metadata };
}