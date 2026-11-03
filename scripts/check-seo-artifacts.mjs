// Build gate for the generated SEO artefacts. Runs after `next build` + `copy-feed` so a broken
// sitemap, feed or llms.txt fails the deploy instead of shipping (the sitemap shipped raw spaces and
// JS-Date lastmods for months because nothing checked it).
import { existsSync, readFileSync, statSync } from 'node:fs'

const SITE = 'https://blog.ashesborn.cloud'
const problems = []
const check = (ok, message) => {
  if (!ok) problems.push(message)
}

const read = (path) => {
  if (!existsSync(path)) {
    problems.push(`missing artefact: ${path}`)
    return ''
  }
  const body = readFileSync(path, 'utf8')
  check(statSync(path).size > 0, `empty artefact: ${path}`)
  return body
}

const count = (text, needle) => text.split(needle).length - 1
const unescapedAmp = (text) => (text.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g) || []).length

// --- sitemap -------------------------------------------------------------------------------
const sitemap = read('out/sitemap.xml')
if (sitemap) {
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
  check(count(sitemap, '<url>') === count(sitemap, '</url>'), 'sitemap: unbalanced <url> tags')
  check(locs.length >= 10, `sitemap: only ${locs.length} URLs`)
  check(locs.length === count(sitemap, '<url>'), 'sitemap: <loc> count != <url> count')
  for (const loc of locs) {
    if (!(loc === SITE || loc.startsWith(`${SITE}/`))) problems.push(`sitemap: loc outside the site: ${loc}`)
    if (/\s/.test(loc)) problems.push(`sitemap: unencoded whitespace in loc: ${loc}`)
    if (loc.includes('+')) problems.push(`sitemap: raw "+" in loc (307 instead of 200): ${loc}`)
    if (!/^https:\/\/[^\s]+$/.test(loc)) problems.push(`sitemap: loc is not an absolute https URL: ${loc}`)
  }
  const lastmods = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1])
  for (const value of lastmods) {
    if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/.test(value)) {
      problems.push(`sitemap: lastmod is not a W3C datetime: ${value}`)
    }
  }
  check(unescapedAmp(sitemap) === 0, 'sitemap: unescaped & in XML')
}

// --- feed ----------------------------------------------------------------------------------
const rss = read('out/rss')
const rssXml = read('out/rss.xml')
if (rss && rssXml) {
  check(rss === rssXml, 'feed: out/rss and out/rss.xml differ (copy-feed did not run?)')
}
if (rssXml) {
  const items = count(rssXml, '<item>')
  check(items === count(rssXml, '</item>'), 'feed: unbalanced <item> tags')
  check(items >= 1, 'feed: no items')
  check(count(rssXml, '<guid') === items, `feed: ${items} items but ${count(rssXml, '<guid')} guids`)
  check(/<language>[a-z]{2}(?:-[A-Za-z]+)?<\/language>/.test(rssXml), 'feed: no <language>')
  check(
    rssXml.includes(`<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>`),
    'feed: missing atom:link rel=self pointing at /rss.xml'
  )
  check(/<lastBuildDate>[^<]+<\/lastBuildDate>/.test(rssXml), 'feed: no <lastBuildDate>')
  check(unescapedAmp(rssXml) === 0, 'feed: unescaped & in XML')
}

// --- llms.txt ------------------------------------------------------------------------------
const llms = read('out/llms.txt')
if (llms) {
  check(statSync('out/llms.txt').size >= 2000, 'llms.txt: suspiciously small')
  check(llms.startsWith('# '), 'llms.txt: must start with an H1')
  check(llms.includes('## Articles'), 'llms.txt: missing the Articles section')
  const links = [...llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1])
  check(links.length >= 10, `llms.txt: only ${links.length} links`)
  for (const url of links) {
    if (url.includes('+')) problems.push(`llms.txt: raw "+" in link (307 instead of 200): ${url}`)
  }
  if (!llms.includes(`${SITE}/datasets`)) problems.push('llms.txt: missing the datasets surface')
}

// --- robots --------------------------------------------------------------------------------
const robots = read('out/robots.txt')
if (robots) check(robots.includes(`${SITE}/sitemap.xml`), 'robots.txt: does not reference the sitemap')

if (problems.length > 0) {
  console.error(`seo-check: ${problems.length} problem(s)`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}
console.log('seo-check: sitemap, feed, llms.txt and robots.txt OK')
