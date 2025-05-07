// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from 'fs';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), '_posts');

export type PostMetadata = {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  categories?: string[];
  p?: string;
  keywords?: string;
  slug: string;
  content?: string;
};

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(postsDirectory, fileName), 'utf8'));
      return {
        slug,
        ...data,
      };
    });
    return allPostsData as PostMetadata[];
}

export function getPostBySlug(slug: string): { content: string; metadata: PostMetadata } {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  const metadata: PostMetadata = {
    slug,
    title: data.title || '',
    date: data.date?.toString() || '',
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    categories: data.categories || [],
    p: data.p || '',
    keywords: data.keywords || '',
  };
  
  return { content, metadata };
}

export function getAllPosts(): PostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const { metadata } = getPostBySlug(slug);
      return metadata;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}
