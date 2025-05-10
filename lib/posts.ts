// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from 'fs';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from 'path';
import matter from 'gray-matter';
import { filenameToSlug, slugToFilename } from './utils';

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

  // If the file doesn't exist, try with .mdx extension
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${decodedName}.mdx`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    ...(matterResult.data as { title: string; date: string; excerpt: string })
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
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the slug
    return {
      slug,
      ...(matterResult.data as { date: string; title: string; excerpt: string })
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
