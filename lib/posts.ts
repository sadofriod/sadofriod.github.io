// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from 'fs';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from 'path';
import matter from 'gray-matter';
import { filenameToSlug, slugToFilename } from './utils';

const postsDirectory = path.join(process.cwd(), 'app', 'blog', 'posts');

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
};

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map(fileName => {
    const slug = filenameToSlug(fileName);
    const postData = getPostData(slug);
    return {
      ...postData,
      slug: filenameToSlug(fileName)
    };
  });
}

export function getPostData(slug: string) {
  // Convert the slug back to a filename
  const decodedName = slugToFilename(slug);
  // Try to find the file with .md extension
  let fullPath = path.join(postsDirectory, `${decodedName}.md`);

  if(fullPath.includes('firebase-messaging-sw')) {
    return {
      content: '',
      title: 'Favicon',
      date: '',
      excerpt: '',
      tags: [],
      categories: [],
      p: '',
      keywords: '',
      slug: 'favicon.ico',
    }
  }

  // If the file doesn't exist, try with .mdx extension
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${decodedName}.mdx`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  return {
    content: matterResult.content,
    ...convertMatterToPostMetadata(matterResult)
  };
}

function convertMatterToPostMetadata(matterResult: matter.GrayMatterFile<string>): Omit<PostMetadata, 'slug'> {
  const sourceTags = matterResult.data.tags || [];
  const tags = Array.isArray(sourceTags) ? sourceTags : [sourceTags];
  return {
    title: matterResult.data.title || '',
    date: matterResult.data.date?.toString() || '',
    excerpt: matterResult.data.excerpt || '',
    tags,
    category: matterResult.data.categories || '',
    p: matterResult.data.p || '',
    keywords: matterResult.data.keywords || '',
    content: matterResult.content,
    description: matterResult.data.description || `${matterResult.content.slice(0, 100)}...` || '',
  };
}

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    // Create slug from filename (with Chinese character support)
    const slug = filenameToSlug(fileName);

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    console.log('fullPath',fullPath);
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the slug
    return {
      slug,
      ...convertMatterToPostMetadata(matterResult),
    };
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}

export function getPostBySlug(slug: string): { content: string; metadata: PostMetadata } {
  const fullPath = path.join(postsDirectory, `${slugToFilename(slug)}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  const { content } = matterResult;

  const metadata: PostMetadata = {
    slug: slugToFilename(slug),
    ...convertMatterToPostMetadata(matterResult),
  };
  
  return { content, metadata };
}