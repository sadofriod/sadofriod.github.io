// Next's static export writes the /rss route handler as an extensionless file (`out/rss`), so the
// Worker's asset layer cannot infer a content type and answers with no `content-type` at all.
// Emit `out/rss.xml` with the same bytes: .xml gets an XML media type, feed readers and validators
// stop guessing, and /rss stays as the legacy alias.
import { copyFileSync, existsSync, statSync } from 'node:fs'

const source = 'out/rss'
if (!existsSync(source)) {
  console.error(`copy-feed: ${source} is missing — did \`next build\` run with output: 'export'?`)
  process.exit(1)
}

copyFileSync(source, 'out/rss.xml')
const { size } = statSync('out/rss.xml')
if (size < 500) {
  console.error(`copy-feed: out/rss.xml is only ${size} bytes — refusing to ship a truncated feed`)
  process.exit(1)
}
console.log(`copy-feed: out/rss.xml ${size} bytes`)
