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

## Next (not done yet)

1. **Titles/H1** for the micro-frontend piece: lead with `micro frontend react`, keep
   `architecture`; mention `nx` and `module federation` in the first 100 words.
2. **One new post per gap** that autocomplete reveals but the blog does not cover:
   `react dynamic form from json` (the existing post is design-level, not a how-to),
   `playwright run only changed tests` (the E2E post is Cypress-only), `proxmox add nas
   storage to vm`.
3. **Internal links** from the E2E and micro-frontend posts into the two profile pages
   (About / Projects) — the profile pages need the link equity more than the old posts do.
4. Re-run the Trends pull quarterly; `nx micro frontend` at +350 % is the one curve worth
   watching.
