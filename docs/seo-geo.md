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

---

## 6. 2026-11-11 收录诊断与修复

### 6.1 基线（Search Console，2026-10-15 → 11-12）

`https://blog.ashesborn.cloud/`：**0 点击 / 17 展示 / 平均排名 1.1**。45 个 sitemap URL 逐个 URL Inspection：

| 状态 | 数量 |
| --- | ---: |
| Submitted and indexed | 3（`/`、`/blog/hello-world`、`/blog/TENNIS_API_DOCUMENTATION`）|
| Discovered - currently not indexed | 30 |
| URL is unknown to Google | 12 |
| Crawled - currently not indexed | 1（`/blog` 本身，2026-07-24 抓取）|

除这 3 个以外，所有 URL 的 `last_crawled` 都是 Never。首页 `/` 已收录而 `/blog` 列表页没有收录，说明
问题不在单个文章质量，而在抓取需求与内部链接结构。

### 6.2 本轮改动

| 问题 | 修复 | 验证 |
| --- | --- | --- |
| 9 篇英文文章 URL 带 `%20` 和大写（`/blog/GraphRAG%20Global%20Map-Reduce…`）| `scripts/generate-post-index.js` 改为 ASCII kebab-case，旧路径写进 `slug-redirects.json` | 旧的 `%20` URL 实测 308 → 新 URL 200；`sitemap.xml` 44 条、`%20` 计数 0 |
| 中文文章 URL 必须保持稳定 | 生成器对 `lang: zh` 保留原 slug 与 `article-<hash>` 目标 | 25 条 `article-` 重定向目标与改动前一致；`/blog/Chinese-anymouns` 不变 |
| 65 篇文章互相之间几乎没有内链 | `components/ArticleMoreLinks.tsx`：同语言 prev/next + 3 篇按 tag 相关 | 65/65 个生成的 HTML 都有 `aria-label="More articles"` |
| 文章正文自带 `#` 标题 → 页面出现 2–5 个 `<h1>` | markdown 渲染器把 `h1` 映射成 `h2` | 全部 65 篇 `<h1>` 计数 = 1 |
| title 超出 SERP 预算（布局追加 `— Ashes Born` 13 字）| 19 篇文章 + 4 个路由页的 title 重写为 ≤ 60 渲染长度 | 82 个导出页全部 ≤ 62 |
| description 200–405 字（frontmatter 原样输出）| `generateMetadata` 增加 `clampDescription`，按词边界截到 155 + `…` | 解码后全部 ≤ 155 |
| `/blog`、`/demo` 没有 canonical 和 og:url | 补 `alternates.canonical` | 线上实测两条 canonical 正确 |
| 遗留的 `TENNIS_API_DOCUMENTATION` 属于站外内容却占了一个收录位 | frontmatter `isHidden: true`（noindex + 出 sitemap + 隐藏列表）| sitemap 44 条不含该 URL |
| 一篇中文文章 frontmatter title 里带 `'# '` | 去掉标题前缀 | 渲染 title 无 `#` |
| Bing/Yandex 从未被通知 | `public/3a57fd31ed0aa0c9f58319951e012aa2.txt` + 44 个 URL 提交 | `api.indexnow.org` 返回 202 |

### 6.3 还没做

- **GSC sitemap 重新提交被拒**：service account 只有 `webmasters.readonly`，提交接口返回 403。
- **GA4 接入**：`mcp-ga4` 容器里的 property id 是占位值，且 service account 无属性权限，两端都要处理。
- 文章正文里的站内链接（Related 段现在由组件生成，正文里的手工链接仍是历史状态）。
- 中文文章的 slug 仍是 `article-<hash>`（保持稳定优先），可读性可以下一轮单独评估。

### 6.4 复查

**2026-11-25**：重跑 45 URL 的 URL Inspection，比较收录数（基线 3）与 `last_crawled` 分布；同时看
Bing Webmaster 是否因为 IndexNow 先行抓取。

---

## 7. 2026-11-11 GEO：markdown 孪生、llms-full.txt、alternate 链接

| 交付 | 实现 | 线上实测 |
| --- | --- | --- |
| 每篇文章的 markdown | `scripts/generate-markdown-exports.mjs`，挂在 `build` 里、`next build` 之后，把源文件原样写进 `out/blog/<slug>.md` | 64 篇 → 64 个文件；`text/markdown; charset=utf-8`，6,773 B 的样例 |
| 整站语料 | `out/llms-full.txt`，按日期倒序，每篇一节，首行是 canonical HTML URL | 249,062 B，`text/plain` |
| 发现路径 | 文章页 `<link rel="alternate" type="text/markdown">`；`llms.txt` 每行追加 `· md: <url>.md`，头部加 `Full corpus as one markdown file` | 链接实测存在；`md:` 32 行（英文主版本）|
| 防重复索引 | `worker.js` 对 `.md` 强制 `text/markdown`；`public/_headers` 同时加 `x-robots-tag: noindex` | 响应头两条都在；隐藏文章 `/blog/tennis-api-documentation.md` 返回 404 |

**顺手修掉的一个隐患**：`GraphRAG Global Map-Reduce.md`（英文）改 slug 后变成
`graphrag-global-map-reduce`，和中文那篇保留的 `graphRAG-global-map-reduce` 只差大小写。在
大小写不敏感的文件系统上两个 md 互相覆盖（64 篇只落 63 个文件），在 CDN 缓存与部分爬虫里也是
同一个键。生成器现在做一遍大小写分组：组内发生冲突时，保留 legacy slug 的那篇（`lang: zh`）
改用 `article-<hash>`，旧路径进 `slug-redirects.json`。实测 `/blog/graphRAG-global-map-reduce`
308 → `/blog/article-179ae567888d`，64 篇 64 个文件。

**为什么不给中文文章也做可读 slug**：`Chinese-anymouns`（简历页）是 28 天内浏览量最高的页面
（554 PV），改 URL 的收益不足以抵消风险；其余中文文章维持 `article-<hash>`，稳定优先。
