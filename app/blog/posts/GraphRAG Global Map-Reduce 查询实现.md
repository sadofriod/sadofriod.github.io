---
title: 'GraphRAG Global Map-Reduce 查询实现'
tags: [GraphRAG, Graph RAG, AI, Knowledge Graph, Global Search, Map-Reduce, TypeScript]
p: graphrag
categories: AI
description: 深入 graphrag-ts 的 Global Map-Reduce 查询代码，说明社区摘要与后代叶 claims 的装载、近似 token 预算分批、有界并发 Map、重试和 JSON 校验，以及按有用性跳过装入 Reduce 上下文的实现。
description_en: 'A code-level walkthrough of Global Map-Reduce in graphrag-ts: loading community summaries and descendant-leaf claims, approximate token batching, bounded concurrent Map calls, retries, JSON validation, and usefulness-ranked Reduce packing.'
date: 2026-10-14 13:30:00
mathjax: true
keywords: GraphRAG Global Map-Reduce token budget 实现, graphrag-ts 社区摘要 claims Map 输入, GraphRAG summaryBatcher 超长摘要 Unicode 分段, GraphRAG bounded concurrency Map retry, GraphRAG usefulness score JSON 校验, GraphRAG Reduce 跳过超预算答案, TypeScript global retrieval partial failure
---

# GraphRAG Global Map-Reduce 查询实现

> 仓库：[sadofriod/graphrag-ts](https://github.com/sadofriod/graphrag-ts) · npm 包：[@ashes_born/graph-rag-ts](https://www.npmjs.com/package/@ashes_born/graph-rag-ts)

现有的全局检索概念文章解释了为什么要对社区摘要做 Map-Reduce。本文继续向实现层走一步，沿着 [`retrieveGlobal`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalSearch.ts) 拆解 `graphrag-ts` 实际如何准备输入、限制模型调用、处理失败并装配最终上下文。

## 1. 查询入口先解析预算与社区层级

[`retrieveGlobal`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalSearch.ts) 先去除 query 首尾空白，空问题直接报错。社区层级默认为 `leaf`，也可以指定非负整数层级。预算和并发来自请求参数、[`retrieval defaults`](https://github.com/sadofriod/graphrag-ts/blob/main/src/config/defaults.ts) 或兜底默认值；仓库默认 Map/Reduce 预算为 8000 tokens、Map/Reduce 输出预留为 512/1024、Map 并发数为 4。

真正可用于提示输入的预算会先扣除输出预留：

$$
MapPromptBudget = MapTokenBudget - MapOutputReserve
$$

$$
ReducePromptBudget = ReduceTokenBudget - ReduceOutputReserve
$$

预算必须为正，预算和并发必须是正整数，输出预留允许为零。Map/Reduce 的 prompt skeleton 也会计入各自预算，而非只计算摘要或中间答案本身。

## 2. Global Map 输入包含摘要、claim 与原文摘录

实现先加载当前 namespace 的社区摘要。默认 `leaf` 通过“没有子社区引用该 summary ID 为 parent”的方式识别；选择数字层级时，则装载该层级所有非空摘要。

对于每个选中的摘要，代码沿 parentCommunityId 关系找到其后代叶社区，再加载这些叶社区关联的 claims。Map 文本由三部分组成：

- `[Community summary]`：被选社区的摘要；
- `[Supporting claims]`：叶级 claims，包含主语、可选宾语和描述；
- `[Source excerpts]`：claims 关联的子块原文，去重后附加。

因此高层摘要也可以获得它覆盖范围内的叶级事实与出处线索；这会增加输入长度，必须在打包前一起预算。

## 3. 摘要分批：先打乱，再按提示预算贪心装箱

[`buildSummaryBatches`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.ts) 默认用 Fisher-Yates shuffle 打乱摘要。每个摘要按 Unicode code point 拆分，超长内容用二分搜索找到在当前 Map prompt budget 内能容纳的最大字符片段；每片加上 community ID 和 part 编号。之后按打乱后的顺序把片段贪心追加到当前批次，放不下则 flush 当前批并开始下一批。

预算由 [`estimateTokens`](https://github.com/sadofriod/graphrag-ts/blob/main/src/build/detectCommunity/summary/estimateTokens.ts) 轻量近似估算：大约每 1.8 个 CJK 字符或每 4 个 ASCII 字符算一个 token，而不是调用模型专用 tokenizer。提示骨架和片段标题也计入长度。这个实现成本低且可测试，但对代码、混合语言或特殊 token 的估算可能偏差；生产环境应留出余量，并用真实模型调用监测超限情况。

过小预算会在模型调用前失败：连 prompt skeleton 都放不下时抛出预算错误；某个摘要片段连单独一批都装不下时，也会抛出带社区 ID 的错误。摘要分段带有来源 ID，使后续 Map answer 能保留对应社区集合。

## 4. Map 执行：有界 worker、两次尝试、结构化校验

[`runGlobalMap`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.ts) 创建最多 `min(concurrency, batchCount)` 个 worker。worker 通过共享的下一个批次索引领取工作，因此不会一次性为所有批次创建无界模型请求；结果写回对应批次位置。

每批最多尝试两次，也就是首次调用失败后重试一次。模型返回 JSON 必须包含字符串 `answer` 和有限数值 `usefulness`，分数范围为 0 到 100；只有 usefulness 为 0 时才允许 answer 为空。解析失败和模型调用失败都会进入重试。

全部批次最终失败时，Map 阶段抛出 `AggregateError`。若有批次成功、也有批次失败，则保留成功答案和错误列表供上层标记部分成功。每个答案同时携带批次涉及的 `communityIds`，便于日志和结果追溯。

## 5. Reduce 选择不是简单截断

[`selectGlobalReduceAnswers`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalReduce.ts) 首先丢弃 usefulness 为 0 的答案，按分数降序排列，同分时保持原顺序。每条候选会格式化为“有用性分数 + 社区 ID + 中间答案”，再将它逐条试装进 Reduce prompt budget：

```text
for answer in usefulness_descending:
    if tokenCount(promptSkeleton + selected + answer) <= reduceBudget:
        selected.append(answer)
```

不适配当前剩余预算的答案会被跳过，而不是触发 `break`。后续较短答案仍可能进入上下文。若最终没有任何正分答案，或没有答案能装入预算，就返回 `no_results`。最终 Reduce 的模型输出还需通过 JSON 校验，并包含非空 `answer` 字段。

有用性是模型给中间答案的相关性排序信号，不是事实正确概率。Reduce 输出包含答案及社区 ID，应用可用这些 ID 回到摘要、claims 和 source chunks 做来源核验。

## 6. 状态与可观测性

Global retrieval 的典型结果状态包括：

| 条件 | 结果 |
|:---|:---|
| 没有可用社区摘要、无正分 Map 答案或 Reduce 无法选入答案 | `no_results` |
| Map 部分失败，但仍有答案成功进入最终 Reduce | `partial` |
| Map 批次均成功且 Reduce 生成答案 | `completed` |
| 所有 Map 批次在重试后都失败 | 抛出聚合错误 |

实现会记录社区层级、摘要数、Map 批次数、各批社区 ID、Map 分数、失败批次数、入选答案数和 Reduce prompt token 估算。排查全局答案时，这些数据可以区分“召回摘要不足”“Map 输出格式错误”“部分模型失败”和“Reduce 预算不足”。

关键代码：[`globalSearch.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalSearch.ts)、[`summaryBatcher.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.ts)、[`globalMap.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.ts)、[`globalReduce.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalReduce.ts) 和 [`estimateTokens.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/build/detectCommunity/summary/estimateTokens.ts)。对应测试覆盖超长摘要分段、预算错误、Map 并发上限与重试、输出分数校验，以及 Reduce 跳过过长答案后继续装入较短答案：[`summaryBatcher.test.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.test.ts)、[`globalMap.test.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.test.ts) 和 [`globalReduce.test.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalReduce.test.ts)。