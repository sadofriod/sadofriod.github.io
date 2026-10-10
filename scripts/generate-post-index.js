const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const matter = require('gray-matter');

const postsDirectory = path.join(__dirname, '..', 'app', 'blog', 'posts');
const generatedDirectory = path.join(__dirname, '..', 'lib', 'generated');
const outputPath = path.join(generatedDirectory, 'post-index.json');
const redirectsPath = path.join(generatedDirectory, 'slug-redirects.json');
const redirects = {};

const posts = fs.readdirSync(postsDirectory)
  .filter((fileName) => /\.(md|mdx)$/.test(fileName))
  .map((fileName) => {
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const name = fileName.replace(/\.(md|mdx)$/, '');
    const sourceTags = data.tags || [];
    const legacySlug = encodeURI(name)
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']')
      .replace(/%20/g, ' ');
    const slug = legacySlug.length > 180 || legacySlug.includes('%')
      ? `article-${createHash('sha256').update(name).digest('hex').slice(0, 12)}`
      : legacySlug;

    if (slug !== legacySlug) {
      redirects[`/blog/${legacySlug.replace(/ /g, '%20')}`] = `/blog/${slug}`;
    }

    return {
      slug,
      ...(slug !== legacySlug && { legacySlug }),
      title: data.title || '',
      date: data.date?.toString() || '',
      excerpt: data.excerpt || '',
      tags: Array.isArray(sourceTags) ? sourceTags : [sourceTags],
      category: data.categories || '',
      p: data.p || '',
      keywords: data.keywords || '',
      description: data.description || `${content.slice(0, 100)}...`,
      isHidden: data.isHidden || false,
      summary: data.summary || '',
      image: data.image || '',
      content,
    };
  });

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));
fs.writeFileSync(redirectsPath, JSON.stringify(redirects));