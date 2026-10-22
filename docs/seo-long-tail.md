# Long-tail keyword plan for the non-GraphRAG posts

Method, data and the changes that came out of it. GraphRAG posts are deliberately
out of scope here — they already rank on a specific, uncrowded technical phrase.

## How the data was gathered

- **Google Trends** (`trends.google.com/trends/api/explore` → `widgetdata/relatedsearches`),
  worldwide, `today 5-y`. The keyless API returns `429` from a datacenter IP, so the
  requests were made from an authenticated browser session; the browser session is the
  only thing that makes this data reachable here.
- **Google autocomplete** (`suggestqueries.google.com/complete/search?client=firefox`)
  for the exact phrasing people type. This is the useful signal for the topics where
  Trends has no related-queries widget, which is most of this blog: niche terms sit
  below Trends' reporting threshold, and that absence is itself information — there is
  no head term to fight for, only long tails.

## What the data says

### micro frontends — the only topic with real volume

Trends, related queries (relative interest):

| Query | Interest |
| --- | --- |
| micro frontend react | 100 |
| micro frontend angular | 81 |
| micro frontend architecture | 70 |
| what is micro frontend | 25 |
| micro frontend framework | 18 |
| nx micro frontend | 13 |
| micro frontends | 13 |

Rising: **`nx micro frontend` +350 %**, `what is micro frontend` +60 %.

Read: the demand is "how do I do this in React" and "architecture", and Nx is the
fastest-growing qualifier. The CRA→micro-frontend article should target
`micro frontend react` + `micro frontend architecture` in the title/meta, and keep
`nx micro frontend` and `module federation` in the body — not chase "micro frontend"
alone.

### hexo — a polluted head term

Trends for `hexo`: the top queries are `hexo stock (100)`, `hexo stock price (22)`,
`hexo corp`, `hexo canada` — the HEXO Corp ticker — plus Havells "hexo" appliances.
Rising noise: `havells hexo (+Breakout)`, `odkurzacz hexo`, `faber castell hexo`.

The only relevant signal is `hexo github (+200 %)`, and `hexo tsx (17)` which is the
React "tsx" phrasing, not Hexo.

Read: never optimise for bare "hexo". Own the qualifiers instead —
`hexo latex mathjax`, `hexo seo`, `hexo table of contents`, `hexo rss`. These posts are
2021-era and should be treated as long-tail support, not traffic drivers.

### Everything else — autocomplete only

Trends returns no related queries for `react dynamic form`, `monorepo`, `end to end
testing`, `self hosted proxy` at the volume these posts live at. The autocomplete
phrases are the target list:

| Topic | Phrases people actually type |
| --- | --- |
| E2E selection | `playwright run only changed tests`, `cypress incremental`, `e2e test suite too slow` |
| Dynamic forms | `react dynamic form builder`, `react dynamic form from json`, `json schema form react`, `react dynamic form generator`, `react json schema form rjsf` |
| Micro frontend | `micro frontend react example github`, `micro frontend react module federation`, `nx monorepo microfrontend`, `micro frontend react interview questions` |
| Functional JS | `functional programming javascript example`, `point free style javascript`, `fp-ts vs ramda`, `functional reactive programming javascript` |
| RN loading | `react native loading component`, `react native lazy loading component` |
| Bezier | `cubic bezier curve css`, `distance to bezier curve` |
| KVM/NAS | `proxmox add nas storage to vm`, `proxmox mount nas storage`, `connect nas storage to proxmox` (Proxmox dominates this intent — say "Proxmox/KVM" in the body even though the post is KVM-first) |

## Changes applied in this pass

`keywords` frontmatter rewritten for the 13 non-GraphRAG posts (these feed the
`<meta name="keywords">` tag and give the writers' brief for titles):

- `remote-work-after-four-years` → 远程工作/远程办公/远程协作缺点/失业复盘 + `remote work engineer`
- `增量运行E2E测试` → 增量E2E测试/E2E测试太慢/playwright 只跑改动的测试/AST 分析 测试选择
- `动态表单设计` → React 动态表单/低代码表单引擎/表单渲染引擎/JSON Schema 表单/图灵完备表单
- `monorepo结构下启动react项目局部热更新` → monorepo 热更新/HMR 失效/React 共享实例/微前端本地开发
- `从CRA将react项目迁移成微前端项目-1` → CRA 微前端/微前端迁移/qiankun/module federation/micro frontend architecture
- `JS开发中函数式编程的一些经验` → 函数式 React/纯函数/柯里化/point-free
- `在React Native中函数式的控制Loading Component` → React Native Loading/加载组件/HOC
- `绘制平滑的三次贝塞尔曲线` → 三次贝塞尔曲线/canvas 平滑曲线/曲线拟合/鼠标轨迹平滑
- `将KVM的虚拟机存储到NAS上` → KVM NAS/Proxmox NAS/qcow2/NFS 虚拟机
- `hexo-seo-优化`, `Hexo…目录以及RSS订阅`, `Hexo…渲染Latex公式` → qualified `hexo *` phrases only
- `Reality 在 AWS 上搭建并使用 Cloudflare 进行转发` → reality 协议/xray reality/vless reality

Titles rewritten to match the phrase people search for (Chinese titles; the English
versions of these posts carry the English phrases):

| Post | New title |
| --- | --- |
| CRA → micro frontend | `CRA 项目迁移成微前端（一）：React 微前端架构与接入` |
| KVM → NAS | `Proxmox / KVM 虚拟机存储到 NAS：qcow2 与 NFS 实战` |
| Dynamic forms | `React 动态表单设计（一）：从 JSON Schema 到表单引擎` |
| monorepo HMR | `monorepo 下 React 局部热更新：共享实例与 HMR 修复` |
| Functional JS | `JS 函数式编程实践：纯函数、柯里化与 React` |
| React Native loading | `React Native 用函数式方式控制 Loading 组件` |
| Bezier | `绘制平滑的三次贝塞尔曲线：算法与 canvas 实践` |
| Hexo SEO | `Hexo SEO 优化：sitemap、收录与结构化数据` |
| Hexo TOC/RSS | `Hexo 增强：目录（TOC）与 RSS 订阅` |
| Hexo LaTeX | `Hexo 渲染 LaTeX 公式：MathJax 与 KaTeX` |
| Reality on AWS | `AWS 上搭建 Reality 并用 Cloudflare 转发` |

Internal linking: every article's bottom callout now points at About, Photography and the
writing index (one component, so it covers old and new posts in both languages).

## Next (not done)

1. **One new post per gap** the autocomplete data reveals but the blog does not cover:
   `react dynamic form from json` (the existing post is design-level, not a how-to),
   `playwright run only changed tests` (the E2E post is Cypress-only), `proxmox add nas
   storage to vm`.
2. Re-run the Trends pull quarterly; `nx micro frontend` at +350 % is the curve to watch.
