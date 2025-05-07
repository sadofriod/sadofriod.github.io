// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const fs = require('fs');
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const path = require('path');
const matter = require('gray-matter');
const { Feed } = require('feed');

const postsDirectory = path.join(process.cwd(), 'posts');

async function generateRssFeed() {
  const feed = new Feed({
    title: 'My Blog',
    description: 'This is my blog',
    id: 'https://yourdomain.com/',
    link: 'https://yourdomain.com/',
    language: 'en',
    image: 'https://yourdomain.com/logo.png',
    favicon: 'https://yourdomain.com/favicon.ico',
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: new Date(),
    feedLinks: {
      rss2: 'https://yourdomain.com/rss.xml',
    },
    author: {
      name: 'Your Name',
      email: 'your.email@example.com',
      link: 'https://yourdomain.com',
    },
  });

  // Get all posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });

  // Sort posts by date
  const sortedPosts = allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });

  // Add each post to the feed
  for (const post of sortedPosts) {
    const url = `https://yourdomain.com/posts/${post.id}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description || '',
      content: post.excerpt || '',
      author: [
        {
          name: 'Your Name',
          email: 'your.email@example.com',
          link: 'https://yourdomain.com',
        },
      ],
      date: new Date(post.date),
    });
  };

  // Write the RSS feed to public/rss.xml
  fs.mkdirSync('./public', { recursive: true });
  fs.writeFileSync('./public/rss.xml', feed.rss2());
  console.log('RSS feed generated!');
}

generateRssFeed();
