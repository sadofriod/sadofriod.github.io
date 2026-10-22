---
title: GraphRAG 混合检索与证据溯源实现
tags: [GraphRAG, Graph RAG, AI, Knowledge Graph, Hybrid Retrieval, RRF, TypeScript]
p: graphrag
categories: AI
description: 基于 graphrag-ts 检索源码解析 local 与 global GraphRAG 查询：实体和图拓扑召回、向量与关键词混合证据、RRF 社区排序、LLM 过滤，以及带 token 预算和失败重试的全局 Map-Reduce。
description_en: 'A source-based guide to local and global GraphRAG retrieval in graphrag-ts, covering entity and topology recall, hybrid vector and keyword evidence, RRF community ranking, LLM filtering, and token-budgeted global Map-Reduce with retries.'
date: 2026-10-14 12:00:00
mathjax: true
keywords: GraphRAG TypeScript 混合向量关键词检索, GraphRAG local retrieval 实体匹配与两跳扩展, GraphRAG 三路 RRF 社区排序实现, PostgreSQL ILIKE 子块关键词召回, GraphRAG claim 原文证据溯源, GraphRAG global search token budget retry, graphrag-ts local and global retrieval
lang: zh
translationKey: graphrag-hybrid-retrieval
---

# GraphRAG 混合检索与证据溯源实现

> 仓库：[sadofriod/graphrag-ts](https://github.com/sadofriod/graphrag-ts) · npm 包：[@ashes_born/graph-rag-ts](https://www.npmjs.com/package/@ashes_born/graph-rag-ts)

`graphrag-ts` 将查询分成两条路径：local retrieval 以实体、社区和原文证据回答具体问题；global retrieval 则分批分析社区摘要，并综合为语料级答案。两者复用索引数据，但并不是同一种召回策略。

## 1. Local Retrieval：图结构找主题，原文块找证据

[`GraphRAGRetrievalService`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/service/GraphRAGRetrievalService.ts) 先通过 [`parseQuery`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/query/queryParser.ts) 解析实体、关键词和主题，再由 [`entityMatcher`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/entity/entityMatcher.ts) 匹配已索引实体。匹配器支持精确、别名、模糊和语义通道，并通过 Reciprocal Rank Fusion（RRF）融合排序；当前检索服务调用它时传入空别名列表，因此服务路径实际使用精确、模糊与语义匹配。解析出的实体也会与匹配结果合并，避免遗漏模型直接识别出的已知实体。

随后，系统分别构造社区候选和文本证据：

1. 以匹配实体为种子，在图中最多扩展两跳，由 [`communityResolver`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/recall/communityResolver.ts) 召回关联社区；若请求指定层级，则沿社区父级关系解析到指定层级。
2. 通过 [`vectorSearch`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/recall/vectorSearch.ts) 将查询向量与社区摘要向量比较，取得语义候选社区。
3. 对原文子块执行向量检索，同时由 [`keywordSearch`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/recall/keywordSearch.ts) 用实体名和关键词做 PostgreSQL `ILIKE` 子串检索。关键词结果按命中词数、再按块长度排序；合并时优先保留向量召回顺序，并按块 ID 去重。

社区候选由 [`communityRanker`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/ranking/communityRanker.ts) 通过三种排名列表融合：摘要向量语义排名、查询实体与社区成员之间的 Jaccard 重叠率，以及查询实体到社区成员的图边权重总和。RRF 避免直接把不同量纲的相似度、集合比例和权重相加。融合后截取 `topK`，再交给 [`finalSelector`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/selection/finalSelector.ts) 中的 LLM 过滤逻辑判断哪些社区与问题真正相关。

## 2. Local Answer：摘要与可追溯证据分开提供

最终上下文由两部分组成：被选中社区的摘要，以及证据片段。证据既包括向量/关键词命中的子块，也包括 [`evidenceRetriever`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/evidence/evidenceRetriever.ts) 找到的社区 claims；claim 记录保留源文档和源子块 ID，子块证据也带有 chunk ID。[`answerGenerator`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/answer/answerGenerator.ts) 把社区摘要和证据分别标记后交给模型。

这使社区摘要承担主题概括，原文片段和 claim 承担事实支撑。社区排序分数或 LLM 社区过滤结果不是事实置信度；需要审计时，应用还应把返回的证据 ID 映射到原文位置并展示来源。

## 3. Global Retrieval：社区摘要 Map-Reduce

Global retrieval 不先做实体匹配。它默认使用叶社区摘要，也可选择一个指定社区层级。每个被选摘要会附加其后代叶社区的 claims 和可用来源片段，再进入 Map 输入，以便全局分析保留事实与出处线索。

[`summaryBatcher`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.ts) 先打乱摘要，再按估算 token 预算拆分和打包。超长摘要会切成带社区 ID 和分段编号的片段；token 估算是工程近似值，而不是模型 tokenizer 的精确计数。默认 Map/Reduce 预算均为 8000 tokens，并各自预留输出空间；Map 并发默认值为 4，均可通过配置覆盖。

每个 Map 批次由模型生成中间答案和 0–100 有用性分数。输出会进行 JSON 结构及分数范围校验；每批失败会重试一次。分数为 0 的答案不进入 Reduce；其余答案按有用性降序排列，在 Reduce 的 token 预算内逐项选入。超过预算的答案会跳过，后续较短答案仍有机会加入。若部分批次失败但仍有可用答案，结果状态为 `partial`；全部没有可用结果时返回无结果状态。

```mermaid
flowchart LR
    A[分层社区摘要 + 叶级 claims] --> B[打乱并按 token 预算分批]
    B --> C[并发 Map：答案 + 有用性评分]
    C --> D[校验、重试、丢弃 0 分]
    D --> E[按分数装入 Reduce 预算]
    E --> F[生成全局答案]
```

## 4. 两种查询方式如何选择

| 查询目标 | 更合适的路径 | 主要上下文 |
|:---|:---|:---|
| 某实体的关系、局部事实或原文依据 | Local | 图邻域、候选社区、相关子块与 claims |
| 跨主题概括、全语料趋势或综合观点 | Global | 指定层级的社区摘要、后代叶 claims 与 Map 答案 |

Local 路径更容易返回原始片段作为依据；Global 路径扩大主题覆盖，但 Map 阶段已经对摘要做了二次压缩。因此，全局答案中的细节仍应通过保留的社区/claim 来源回查，不宜把 Map 有用性分数解释为准确率。

## 5. 请求隔离与取消

检索服务使用 namespace 上下文隔离数据库查询，并通过异步本地存储传递可选 `AbortSignal`。数据库访问和模型调用前后都会检查取消状态，避免被取消的请求继续推进后续检索阶段。多租户部署应确保每条检索 SQL 和向量查询都继承相同 namespace 范围。

相关阅读源码：[`GraphRAGRetrievalService.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/service/GraphRAGRetrievalService.ts)、[`entityMatcher.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/entity/entityMatcher.ts)、[`communityResolver.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/recall/communityResolver.ts)、[`vectorSearch.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/recall/vectorSearch.ts)、[`keywordSearch.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/recall/keywordSearch.ts)、[`communityRanker.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/ranking/communityRanker.ts)、[`evidenceRetriever.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/evidence/evidenceRetriever.ts)、[`answerGenerator.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/answer/answerGenerator.ts)、[`summaryBatcher.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.ts) 和 [`globalMap.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.ts)。