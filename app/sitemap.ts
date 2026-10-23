import { getBlogPosts } from "./blog/utils"

export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud' 

export const dynamic = 'force-static';

export default async function sitemap() {
  const blogs = getBlogPosts()
    // one URL per article: the canonical (English) copy, with hreflang links
    .filter((post) => post.metadata.isPrimary !== false)
    .map((post) => {
      const alternates = post.metadata.alternates ?? {};
      const languages = Object.fromEntries(
        Object.entries(alternates).map(([lang, slug]) => [
          lang === 'zh' ? 'zh-CN' : lang,
          `${baseUrl}/blog/${encodeURI(slug)}`,
        ])
      );

      return {
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.metadata.date,
        ...(Object.keys(languages).length > 1 ? { alternates: { languages } } : {}),
      };
    })

  const routes = ['', '/blog', '/about', '/photography', '/podcast', '/friends'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
