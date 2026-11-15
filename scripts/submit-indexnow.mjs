import { readFile } from 'node:fs/promises'

const SITEMAP_PATH = 'out/sitemap.xml'
const MAX_URLS = 10000
const HOST = 'blog.ashesborn.cloud'
const KEY = '3a57fd31ed0aa0c9f58319951e012aa2'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`

let sitemap
try {
  sitemap = await readFile(SITEMAP_PATH, 'utf8')
} catch (error) {
  console.error(`IndexNow error: unable to read ${SITEMAP_PATH}: ${error.message}`)
  process.exit(1)
}

const allUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
if (allUrls.length === 0) {
  console.error('IndexNow error: no URLs found in sitemap')
  process.exit(1)
}

if (allUrls.length > MAX_URLS) {
  console.log(`IndexNow: found ${allUrls.length} URLs; truncating to ${MAX_URLS}`)
}
const urls = allUrls.slice(0, MAX_URLS)

if (process.argv.includes('--dry-run')) {
  console.log(`DRY RUN: ${urls.length} urls`)
  console.log(`First: ${urls[0]}`)
  console.log(`Last: ${urls[urls.length - 1]}`)
} else {
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
    })
    const body = await response.text()
    if (response.status === 200 || response.status === 202) {
      console.log(`IndexNow accepted (${response.status}) for ${urls.length} urls`)
    } else {
      console.warn(`IndexNow warn: ${response.status} ${body}`)
    }
  } catch (error) {
    console.warn(`IndexNow warn: network error ${error.message}`)
  }
}
