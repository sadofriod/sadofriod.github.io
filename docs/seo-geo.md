# SEO + GEO for the 2026-10/11 posts

Scope: the four articles published between 2026-10-23 and 2026-11-01 (annual-report case,
DOI retraction check, x402 integration, MCP trial, each with a zh sibling), plus the blog's
own machine-readable surfaces (`robots.txt`, `llms.txt`, `BlogPosting` schema).

Method and the keyword data live in `seo-long-tail.md` for the older posts; this file covers
the new ones and the generative-engine layer.

## 1. Demand data (2026-11-02)

Google Trends was unreachable via the keyless endpoints until the cause was found: `/trends/api/explore`
answers **429 whenever the `NID` cookie is missing** — the warm request to `/trends/explore` also 429s
but still sets the cookie, so a `CookieJar` plus one throwaway request is enough. Scripts:
`company-site/docs/seo-data/trends.py` and `trends2.py`.

12-month worldwide means (relative 0–100 index):

| Term | Mean | Last quarter | Peak | Reading |
| --- | ---: | ---: | ---: | --- |
| x402 | 57.7 | 40.4 | 100 | rising; related: coinbase (100), what is x402 (59), http 402 (28), x402 facilitator (26), stripe x402 (+400%) |
| retraction watch | 51.8 | — | — | related: retraction watch database (100, +70%), what is retraction watch (+200%) |
| graphrag | 49.1 | 22.0 | 100 | owned by microsoft/neo4j; related: microsoft graphrag (100), graphrag github (41) |
| rag evaluation | 48.1 | 21.5 | 100 | frontier is vendor docs |
| annual report pdf | 41.8 | 23.2 | 100 | **wrong intent** — autocomplete is all "free download" |
| retracted paper | 39.2 | — | — | only related query is `retracted papers` |
| doi retraction | 29.8 | — | — | below the related-queries threshold |
| rag benchmark | 22.9 | 10.0 | 55 | autocomplete: datasets / leaderboard / metrics |
| graphrag typescript | 0.0 | 0.0 | 0 | zero volume, stable in autocomplete → uncontested long tail |

Autocomplete (700 queries: 39 seeds × 18 modifiers, 874 unique suggestions) produced the phrases
that actually shaped the titles:

- `how to check if a paper is retracted`, `how to find retracted papers`, `what happens when a paper is retracted`
- `retraction watch database` + `database free` / `api` / `download` / `by country`, `crossref retraction watch`
- `pdf to knowledge graph`, `how to extract data from annual report to excel`
- `x402 mcp server`, `x402 api`, `x402 protocol cloudflare`, `x402 for agents`
- `graphrag mcp server`, `graphrag typescript`
- zh (hl=zh-CN): `撤稿数据库`, `撤稿观察`, `期刊 撤稿`, `graphrag 实践 / 教程 / 详解`

SERP triage said the retraction-intent queries are winnable (small tools, GitHub, one Harvard lab),
`x402 …` queries are vendor-owned (docs.x402.org, Cloudflare), and `annual report pdf` is a different
audience entirely.

## 2. What changed in the posts

| Post | Title change | Target |
| --- | --- | --- |
| annual-report-anchored-claims | `graphrag-ts in practice: three annual reports…` → `Annual report PDFs to a graph with page-anchored claims` | pdf to knowledge graph |
| free-doi-retraction-check | `GraphRAG Retraction Judgment in TypeScript…` → `How to check if a paper is retracted (measured on 20 DOIs)` | the literal question people type |
| graphrag-mcp-trial | → `GraphRAG MCP server trial: one sourced answer, then access` | graphrag mcp server |
| x402-integration-http-and-mcp | unchanged | already carries the right phrase |
| zh siblings | 撤稿判断 → `怎么查一篇论文是否被撤稿…`；年报 → `三份年报 PDF 到一张图…` | 撤稿数据库 / 年报解析 知识图谱 |

Each post also got: `keywords` rewritten (they feed `<meta name="keywords">` and the writer's brief),
a `description` capped at ~155 chars (it now wins over `excerpt` in `generateMetadata`), and a
**Key facts** blockquote immediately after the frontmatter.

## 3. GEO layer (generative engine optimization)

What answer engines need, and where it now comes from:

- **A quotable summary at the top.** The `Key facts` blocks carry the numbers with a date and the unit:
  29 of 29 facts verified (2026-11-01); 20/20 HTTP 200, median 1,595 ms, 16 retracted, 2 with no status
  rows (2026-10-28); $0.02 / $0.10 in atomic units; 14 days, 30 queries.
- **Explicit negatives.** "A missing row is returned as missing, never as 'not retracted'" — an engine
  summarising the post cannot invert the claim.
- **Machine-readable surfaces.** `robots.txt` now names GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
  Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot and meta-externalagent.
  `public/llms.txt` is generated at build time (`scripts/generate-llms-txt.mjs`) from the post index and
  opens with four canonical answers (what graphrag-ts is, how to check a retraction for free, how
  accurate the judgment is, how per-call payment works), each with the URL that proves it.
- **Schema.** `BlogPosting` now carries `publisher` (Ashes Born + logo), `author.url`, `keywords`,
  `inLanguage`, `articleSection`, `isPartOf` and an image fallback; `generateMetadata` always emits a
  canonical, `og:article` (`publishedTime`), Twitter card and `max-image-preview:large`.
- **Entity consistency.** Every post's `publisher` points at the company site, and every new post links
  to `ashesborn.cloud/datasets` and `/benchmark` — the blog previously had zero links to the company
  domain, so the two properties read as unrelated to a crawler.

## 4. Verification

- `pnpm build` in the container: compiled + exported, 0 errors.
- Rendered HTML checked for four posts: title/description lengths, canonical, `og:article`,
  `robots` meta (`index, follow, max-image-preview:large, max-snippet:-1`), and a parsed `BlogPosting`
  block with all the new fields.
- `out/robots.txt` lists every agent; `out/llms.txt` has 4 sections + 31 article lines, no raw markdown
  leaking into list items.

## 5. Not done

- No Search Console / Bing property for `blog.ashesborn.cloud`; indexing is organic only.
- No internal link from old posts to the new ones yet — the Related sections only point at the company
  site and the repo.
- Chinese titles are optimised on autocomplete only; Google Trends for zh-CN is too thin to measure.
