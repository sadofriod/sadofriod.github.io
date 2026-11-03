import { baseUrl } from '../sitemap'
import { getBlogPosts } from '../blog/utils'

export const dynamic = 'force-static';

// Define the BlogPost type inline
type BlogPost = {
  metadata: {
    title: string;
    date: string;
    summary: string;
    image?: string;
    isPrimary?: boolean;
  };
  slug: string;
  content: string;
};

// Titles and summaries are author text: an unescaped "&" or "<" makes the feed unparseable.
const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const postUrl = (slug: string) => `${baseUrl}/blog/${encodeURIComponent(slug)}`

export async function GET() {
  const allBlogs = (await getBlogPosts())
    .filter((post) => post.metadata.isPrimary !== false)
    .sort((a: BlogPost, b: BlogPost) => {
      const left = new Date(a.metadata.date).getTime()
      const right = new Date(b.metadata.date).getTime()
      return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left)
    })

  const itemsXml = allBlogs
    .map((post: BlogPost) => {
      const url = postUrl(post.slug)
      const date = new Date(post.metadata.date)
      const pubDate = Number.isNaN(date.getTime())
        ? ''
        : `\n          <pubDate>${date.toUTCString()}</pubDate>`
      return `<item>
          <title>${esc(post.metadata.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description>${esc(post.metadata.summary || '')}</description>${pubDate}
        </item>`
    })
    .join('\n')

  const newest = allBlogs
    .map((post) => new Date(post.metadata.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Ashes Space — Ashes Born</title>
        <link>${baseUrl}</link>
        <description>Long-form notes on GraphRAG, retrieval infrastructure and frontend engineering.</description>
        <language>en</language>
        <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
        ${newest ? `<lastBuildDate>${newest.toUTCString()}</lastBuildDate>` : ''}
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
