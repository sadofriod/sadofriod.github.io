import { getAllPostIds } from "../lib/posts"

export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud'

export const dynamic = 'force-static';

// A <loc> must be a percent-encoded URL. Post slugs are titles, so they contain spaces and "+":
// raw spaces make the sitemap entry invalid, and a raw "+" is decoded as a space by the asset
// layer, which answers 307 to the encoded path instead of 200.
const postUrl = (slug: string) => `${baseUrl}/blog/${encodeURIComponent(slug)}`

// <lastmod> must be a W3C datetime. gray-matter parses some front-matter dates to JS Dates, and
// Date#toString() ("Sat Aug 21 2021 19:11:33 GMT+0000 (Coordinated Universal Time)") is not one.
const isoDate = (value: unknown): string | undefined => {
  if (!value) return undefined
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export default async function sitemap() {
  const blogs = getAllPostIds()
    // one URL per article: the canonical (English) copy, with hreflang links
    .filter((post) => !post.isHidden && post.isPrimary !== false)
    .map((post) => {
      const alternates = post.alternates ?? {};
      const languages: Record<string, string> = Object.fromEntries(
        Object.entries(alternates).map(([lang, slug]) => [
          lang === 'zh' ? 'zh-CN' : lang,
          postUrl(slug),
        ])
      );

      // A hreflang pair is only valid when each page also lists itself.
      const selfLang = post.lang === 'zh' ? 'zh-CN' : (post.lang ?? 'en');
      if (Object.keys(languages).length > 0 && !languages[selfLang]) {
        languages[selfLang] = postUrl(post.slug);
      }

      const lastModified = isoDate(post.date);

      return {
        url: postUrl(post.slug),
        ...(lastModified ? { lastModified } : {}),
        ...(Object.keys(languages).length > 1 ? { alternates: { languages } } : {}),
      };
    })

  // Static routes carry no lastModified: `new Date()` stamped every page with the build date on
  // each deploy, which tells crawlers every page changed when none did.
  const routes = ['', '/blog', '/about', '/photography', '/podcast', '/friends', '/datasets', '/datasets/retraction-integrity', '/benchmark', '/demo', '/demo/ldo', '/demo/audits'].map((route) => ({
    url: `${baseUrl}${route}`,
  }))

  return [...routes, ...blogs]
}
