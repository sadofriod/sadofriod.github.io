---
title: 'GraphRAG 撤稿判断（TypeScript）：来源层级、弃权语义与 20 个 DOI 实测'
date: '2026-10-28'
excerpt: '基于引用图谱的撤稿查询：每篇论文三条来源断言、两个层级、四种可能的判定，以及 20 个 DOI 打到接口上的实测结果。包含"空状态列表"为什么不等于"未撤稿"。'
description: 'graphrag-ts 如何把三个来源的行推导成撤稿判定、schema 为什么把每条断言单独成行、四种判定（含弃权）的定义，以及 20 个 DOI 的延迟与来源一致性实测。'
tags: ['GraphRAG', 'TypeScript', 'PostgreSQL', 'research-integrity', 'dataset']
categories: GraphRAG
keywords: 'GraphRAG 撤稿判断, DOI 撤稿状态, 来源层级, Crossref update-to, Retraction Watch, OpenAlex, 弃权, GraphRAG TypeScript'
lang: zh
translationKey: free-doi-retraction-check
---

撤稿状态不是某个数据库里的一个字段。同一篇作品可以同时带 OpenAlex 的标记、Crossref 的
`update-to` 关系、以及 Retraction Watch 的通知记录，三者可能互相矛盾。引用它的 Agent 只会吐出
一个 DOI，矛盾到不了读者面前。

这篇写 `graphrag-ts` 如何把这些行推导成判定，以及接口对 20 个 DOI 实际返回了什么。数字来自
2026-10-28 对单一快照的一次运行。

## 1 图谱里有什么

快照 `ri-20261025-1526`，CC0 发布：

| 表 | 行数 | 关切的列 |
| --- | --- | --- |
| `papers` | 98,868 | `paper_id`(OpenAlex)、`doi`、`title`、`publication_year`、`openalex_is_retracted` |
| `cites` | 144,814 | `citing_id`、`cited_id`、`cited_doi`、`source_tier`、`source_uri` |
| `retraction_status` | 572 | `paper_id`、`source`、`source_tier`、`is_retracted`、`retraction_date` |

`paper_id` 跨快照稳定，增量构建才能只重算变化的部分而不必重新抽取。`cites` 是有向边：
`citing_id` 引用 `cited_id`；参考文献没有 DOI 时 `cited_doi` 为 null，所以只按 DOI join 会丢边。

公开导出是邻域样本：12 篇已撤稿的种子、引用它们的作品、以及这些作品的参考文献表。781 篇作品
至少引用一个种子，共 788 条边；其中 6 篇同时引用两个及以上。

## 2 为什么每条断言单独成行

`retraction_status` 每个 `(paper, source)` 一行。压成一个布尔列会更小，但会丢掉消费者真正需要的
两件事：哪个来源做了这个断言、这个来源给出的日期是什么。层级 A 表示直接登记撤稿的注册库
（Crossref `update-to`、Retraction Watch），层级 C 表示索引派生标记（OpenAlex）。A 行和 C 行
不一致本身是信息，它会被原样带进返回。

Retraction Watch 的"原因/性质"自由文本被排除在数据集之外。撤稿是一个书目事件；把出版方的措辞
一起带走，会让一次状态查询变成数据集本身无法支撑的指控。

## 3 判定怎么推导

四种结果，按顺序判断：

1. `abstained`：返回里带 `abstention_reason`，目前只有 `paper_not_in_snapshot`。论文不在快照内，
   服务拒绝分类。
2. `no_status_rows`：论文在 `papers` 里，但没有任何来源对它给出状态行。这是证据缺失。
3. `retracted`：至少有一个来源断言撤稿。返回里给出有几个来源、涉及哪些层级、以及最早的记录日期。
4. `not_retracted`：所有覆盖该论文的来源都断言相反。

第 1 和第 2 种最容易被读错。`statuses: []` 且 `paper: null` 不是"干净"，`statuses: []` 且论文
存在也不是"干净"。把这两种都映射成"clean"的消费者，等于给出了它并不拥有的保证。

## 4 接口

| 接口 | 成本 | 返回 |
| --- | --- | --- |
| `GET /api/v1/judge/paper?doi=` | 免费、无需 key | 论文级状态行及其层级 |
| MCP `integrity_paper_status` | 免费、无需 key | 同一份 payload，走 Streamable HTTP |
| MCP `retraction_propagation` | $0.02/次 | 判定、置信度、撤稿根、覆盖度 |
| MCP `integrity_evidence_audit` | $0.10/次 | 上述内容 + 证据路径与层级分布 |

免费 HTTP 路由返回 `access-control-allow-origin: *`，浏览器可以直接调用，数据集页面就是这么做的。
付费调用走 Base 上的 x402 结算；MCP 服务对 `initialize` 与 `tools/list` 匿名开放，客户端可以先看
工具清单，再决定是否为调用付费。

返回体里带着产出它的快照：

```json
{
  "paper": { "paper_id": "W2117847125", "doi": "10.1016/s0140-6736(97)11096-0", "year": 1998 },
  "statuses": [
    { "source": "openalex",         "source_tier": "C", "is_retracted": true, "retraction_date": null },
    { "source": "retraction_watch", "source_tier": "A", "is_retracted": true, "retraction_date": "2010-02-06" }
  ]
}
```

## 5 20 个 DOI 的实测

方法：从 `retraction_status` 里取 16 个带撤稿日期的 DOI（不是挑有名的案例），加 3 个预期未被撤稿的
对照、1 个故意写错的 DOI。每个 DOI 一次 GET，串行、间隔 350 ms、带浏览器 UA，不重试。延迟是从
容器经公网打到 Cloudflare 的墙钟时间（请求发出到响应体解析完成）。

| 指标 | 结果 |
| --- | --- |
| HTTP 200 | 20 / 20 |
| 中位延迟 | 1,595 ms |
| 均值 / 最大 | 1,965 ms / 5,318 ms |
| 撤稿 | 16 |
| 未撤稿 | 1 |
| 无状态行 | 2 |
| 弃权 | 1 |

16 个撤稿 DOI 全部被三个来源一致确认（OpenAlex C、Crossref A、Retraction Watch A）。引擎自身的耗时
在 `server-timing` 头里：重复调用得到 `app;dur=6.1`、`6.4`、`3.9` ms，一次离群 104.2 ms。其余
墙钟时间花在网络与 TLS 上。

## 6 数字怎么读

5,318 ms 那个最大值是空闲后的第一次请求，冷启动主导了它；均值被这一个样本拉高，做容量估算应该用
中位数。

真正值得看的是那两个"无状态行"的对照。两篇论文都在图里，但没有任何来源对它们的撤稿状态表态。
把"无行"映射成 `retracted: false` 的检查器，会报出两篇它其实担保不了的"干净"论文。返回里把这种
情况和弃权分开，就是为了不产生这个歧义。

写错的 DOI 返回 `abstention_reason: paper_not_in_snapshot`、空状态列表、HTTP 200。没有错误码，也
没有猜测。

## 7 这组数字不能说明什么

- **n = 20，单一快照、单一出口。** 这是一台机器在一小时内对一个端点的测量，不是负载下的吞吐，也不是
  与其他服务的比较。
- **说明召回，不说明精确率。** 16 个样本取自状态表，所以这组数据能说明"已知撤稿能被找到"；它说明不了
  干净文献上的误报率，因为快照里没有同等规模的干净对照组。
- **是书目状态，不是学术不端认定。** 原因文本被刻意排除。
- **邻域样本不是学术记录。** 12 个种子和它们的引用者，支撑不了任何关于某领域撤稿率的结论。

## 8 复现

```bash
for doi in 10.1001/jama.293.14.1727 10.1038/nature14581 10.9999/not-in-snapshot; do
  enc=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=""))' "$doi")
  curl -s -o /tmp/out.json -w "%{http_code} %{time_total}s $doi\n" \
    -A "Mozilla/5.0 (compatible; bench/1.0)" \
    "https://pay.ashesborn.cloud/api/v1/judge/paper?doi=$enc"
  python3 -m json.tool < /tmp/out.json | head -20
  sleep 0.35
done
```

数据集与装载脚本在 Hugging Face（`ashesborn6/integrity-citation-retraction-graph`）。
`/datasets/retraction-integrity` 上渲染的引用邻域由博客仓库的
`scripts/build-retraction-graph.mjs` 生成，它从三份公开 JSONL 重新计算种子选择，而不是硬编码一份
布局。
