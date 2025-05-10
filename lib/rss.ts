import { Feed } from 'feed';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import fs from 'fs';
import { getSortedPostsData } from './posts';

export async function generateRssFeed() {
  const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const posts = getSortedPostsData();
  const date = new Date();

  const author = {
    name: 'Your Name',
    email: 'your-email@example.com',
    link: site_url,
  };

  const feed = new Feed({
    title: 'Your Blog Title',
    description: 'Your blog description',
    id: site_url,
    link: site_url,
    language: 'en',
    image: `${site_url}/images/logo.png`,
    favicon: `${site_url}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}`,
    updated: date,
    feedLinks: {
      rss2: `${site_url}/rss/feed.xml`,
      json: `${site_url}/rss/feed.json`,
      atom: `${site_url}/rss/atom.xml`,
    },
    author,
  });
  for (const post of posts) {
    const url = `${site_url}/posts/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt || '',
      author: [author],
      date: new Date(post.date),
    });
  }
  // Ensure directory exists
  fs.mkdirSync('./public/rss', { recursive: true });

  fs.writeFileSync('./public/rss/feed.xml', feed.rss2());
  fs.writeFileSync('./public/rss/atom.xml', feed.atom1());
  fs.writeFileSync('./public/rss/feed.json', feed.json1());
}
