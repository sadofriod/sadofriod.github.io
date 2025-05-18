import { baseUrl } from '../sitemap'
import { getBlogPosts } from '../blog/utils'

// Define the BlogPost type inline
type BlogPost = {
  metadata: {
    title: string;
    date: string;
    summary: string;
    image?: string;
  };
  slug: string;
  content: string;
};

export async function GET() {
  const allBlogs = await getBlogPosts()

  const itemsXml = allBlogs
    .sort((a: BlogPost, b: BlogPost) => {
      if (new Date(a.metadata.date) > new Date(b.metadata.date)) {
        return -1
      }
      return 1
    })
    .map(
      (post: BlogPost) =>
        `<item>
          <title>${post.metadata.title}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${post.metadata.summary || ''}</description>
          <pubDate>${new Date(
            post.metadata.date
          ).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>My Portfolio</title>
        <link>${baseUrl}</link>
        <description>This is my portfolio RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
