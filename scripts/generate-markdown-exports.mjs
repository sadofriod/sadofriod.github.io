import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(directory, '..');
const outputDirectory = path.join(root, 'out');

if (!fs.existsSync(outputDirectory)) {
  console.log('md-exports: out/ does not exist; skipping');
  process.exit(0);
}

const indexPath = path.join(root, 'lib', 'generated', 'post-index.json');
const postsDirectory = path.join(root, 'app', 'blog', 'posts');
const posts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const published = posts.filter((post) => post.isHidden !== true);
const blogDirectory = path.join(outputDirectory, 'blog');
fs.mkdirSync(blogDirectory, { recursive: true });

for (const post of published) {
  const sourcePath = path.join(postsDirectory, post.file);
  const outputPath = path.join(blogDirectory, `${post.slug}.md`);
  fs.writeFileSync(outputPath, fs.readFileSync(sourcePath, 'utf8'));
}

const canonicalPosts = published
  .filter((post) => post.isPrimary !== false)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
const sections = [];

for (const post of canonicalPosts) {
  const source = fs.readFileSync(path.join(postsDirectory, post.file), 'utf8');
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
  if (!body.trim()) {
    console.log(post.slug);
    continue;
  }

  const date = new Date(post.date).toISOString().slice(0, 10);
  const language = post.lang || 'en';
  const canonicalUrl = `https://blog.ashesborn.cloud/blog/${encodeURIComponent(post.slug)}`;
  sections.push(`## ${post.title}\n${canonicalUrl} · published ${date} · language ${language}\n\n${body}`);
}

const fullCorpus = `# Ashes Born — full corpus\n> Complete markdown of every published article, newest first. Each section is one article; its\n> canonical HTML URL is on the first line. Index: https://blog.ashesborn.cloud/llms.txt\n\n---\n\n${sections.join('\n\n---\n\n')}\n`;
const fullCorpusPath = path.join(outputDirectory, 'llms-full.txt');
fs.writeFileSync(fullCorpusPath, fullCorpus);
console.log(`md-exports: ${published.length} posts, llms-full.txt ${Buffer.byteLength(fullCorpus, 'utf8')} bytes`);
