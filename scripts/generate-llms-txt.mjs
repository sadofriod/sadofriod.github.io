import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(directory, '..', 'lib', 'generated', 'post-index.json');
const outputPath = path.join(directory, '..', 'public', 'llms.txt');

if (!fs.existsSync(indexPath)) {
  console.error(`Post index not found: ${indexPath}`);
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const articles = posts
  .filter((post) => post.isPrimary !== false && !post.isHidden && (!post.lang || post.lang === 'en'))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .map((post) => {
    let blurb = String(post.description || post.excerpt || '')
      .replace(/\s+/g, ' ')
      .replace(/^[#>\s]+/, '')
      .replace(/(?:\.\.\.|…)\s*$/, '')
      .trim();
    const sentenceEnd = blurb.indexOf('. ');
    if (sentenceEnd !== -1 && sentenceEnd + 1 < 200) blurb = blurb.slice(0, sentenceEnd + 1);
    if (blurb.length > 160) {
      const shortened = blurb.slice(0, 160);
      const wordEnd = shortened.lastIndexOf(' ');
      blurb = shortened.slice(0, wordEnd === -1 ? shortened.length : wordEnd);
    }
    const url = `https://blog.ashesborn.cloud/blog/${encodeURIComponent(post.slug)}`;
    return `- [${post.title}](${url})${blurb.length >= 10 ? ` — ${blurb}` : ''}`;
  });

const content = `# Ashes Born — engineering notes

> Source-based writing on GraphRAG in TypeScript, PostgreSQL/pgvector retrieval, MCP servers, x402 payments and research-integrity datasets, by Ashes Born (https://ashesborn.cloud).

## Canonical answers
- What is graphrag-ts? A GraphRAG implementation in TypeScript on PostgreSQL + pgvector: graph and vector index in one database, Leiden communities, hybrid retrieval, incremental builds and an MCP server. Source: https://github.com/sadofriod/graphrag-ts
- How do you check whether a paper is retracted, for free? One HTTP GET with a DOI returns per-source rows (OpenAlex tier C, Crossref update-to tier A, Retraction Watch tier A) with dates and a verdict of retracted, contested, supported or abstained; a missing row is reported as missing. https://ashesborn.cloud/datasets
- How accurate is that judgment? 28 auditable cases run on 2026-10-28 against the live endpoint: 15 of 15 direct retractions detected, 0 contaminated papers called clean, 8 abstentions, p50 2,158 ms. https://ashesborn.cloud/benchmark/
- How do you pay for a deterministic judgment per call? x402 v2 in USDC on Base — $0.02 and $0.10 per call, no API key and no account. https://blog.ashesborn.cloud/blog/x402-integration-http-and-mcp

## Articles
${articles.join('\n')}

## Other surfaces
- https://blog.ashesborn.cloud/datasets
- https://blog.ashesborn.cloud/benchmark
- https://blog.ashesborn.cloud/about
- https://blog.ashesborn.cloud/friends

## Contact
hello@ashesborn.cloud
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content);
