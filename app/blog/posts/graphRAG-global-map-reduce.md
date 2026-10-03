---
title: GraphRAG 全局检索 Map-Reduce 详解
tags: [GraphRAG, Graph RAG, AI, Knowledge Graph, Global Search, Map-Reduce]
p: graphrag
categories: AI
description: 深入解析 Microsoft GraphRAG 全局检索中的 Map-Reduce 流程，说明如何将层级社区摘要按 token 预算分块，通过 LLM 并行生成带有用性评分的中间答案，再排序筛选并综合为全局答案。
description_en: A detailed guide to Microsoft GraphRAG global search Map-Reduce, explaining how hierarchical community summaries are shuffled and split by token budget, mapped into scored intermediate answers, ranked, and reduced into a corpus-level response.
date: 2026-10-03 12:00:00
mathjax: true
keywords: GraphRAG 全局检索 Map-Reduce 流程, GraphRAG global search MapReduce explained, Microsoft GraphRAG community summary map reduce, GraphRAG Map 阶段并行社区答案生成, GraphRAG Reduce 阶段有用性评分排序, GraphRAG token budget context window, GraphRAG 全局答案生成与社区摘要, GraphRAG global search vs local search, Graph RAG query-focused summarization, GraphRAG map reduce TypeScript pseudocode
---

# GraphRAG 全局检索中的 Map-Reduce

> 根据论文《From Local to Global: A GraphRAG Approach to Query-Focused
> Summarization》整理，重点对应 §3.1.5–§3.1.6。论文原文见
> [2404.16130v2.pdf](./2404.16130v2.pdf)，中文稿见
> [2404.16130v2_zh.md](./2404.16130v2_zh.md)。

## 1. 一句话概括

GraphRAG 的全局检索先把一个层级中的**社区摘要**分批交给 LLM，让每批独立产出“与问题有关的中间答案及有用性分数”（Map）；再按分数筛选、排序并装入有限上下文，最后让 LLM 综合这些中间答案生成最终的全局答案（Reduce）。

它解决的核心问题是：语料库和社区摘要总量可能远超单次 LLM 调用的上下文窗口，但全局问题又要求综合多个主题，而不是只找一小段最相似文本。

## 2. 它在 GraphRAG 流程中的位置

论文中的相关处理分为两个阶段，不能把它们混为一谈：

```text
索引阶段
文档 -> 实体/关系/声明 -> 知识图 -> 层级社区 -> 各社区摘要

查询阶段（全局检索）
问题 + 某一社区层级的摘要
  -> Map：分块生成社区答案和有用性分数
  -> Reduce：按分数选取答案并生成全局答案
```

Map 的输入不是原始文档，也不是临时检索出的少量文本块，而是索引阶段已经生成的社区摘要。论文允许针对某一社区层级进行全局答案生成；层级不同，摘要的范围和细节粒度也不同。

此外，索引阶段本身也会逐层生成社区摘要：叶社区基于图元素摘要，高层社区优先使用子社区摘要来适配上下文窗口。这是**社区摘要的层级构建**，与查询阶段对社区摘要执行的 Map-Reduce 是相邻但不同的流程。

## 3. Map 阶段：并行理解各批社区摘要

### 3.1 准备输入

取选定层级的社区摘要，将摘要随机打乱，再按预先设定的 token 上限切分成多个上下文块：

```text
S = shuffle(该层级的社区摘要)
B1, B2, ... Bn = splitByTokenLimit(S, mapContextLimit)
```

随机打乱的目的，是让相关信息尽量分散到不同块中，避免它们集中在少数块、因上下文限制而没有机会参与后续汇总。切块应以 token 数量而非字符数控制，因为实际限制是模型上下文容量。

### 3.2 对每个块独立生成结果

对每个块并行调用 LLM，要求它根据目标问题和该块中的社区摘要：

1. 生成一个中间答案；
2. 评估该答案对回答目标问题的有用程度，给出 0–100 分。

```text
map(query, Bi) -> { answer: Ai, usefulness: Ui }
```

如果某块没有与问题有关的信息，模型可以返回有用性为 0 的答案。论文的流程会丢弃分数为 0 的结果；剩余结果进入 Reduce。

**Map 的要点：**每个调用只处理有限的一批摘要，因此调用可以并行，也不要求模型一次读完整个知识库。它将大量摘要转成较小、以问题为中心的中间答案。

## 4. Reduce 阶段：按有用性预算内合并

将 Map 阶段保留的答案按有用性分数从高到低排序，然后依序加入一个新的上下文，直到达到最终答案生成的 token 限制：

```text
answers = sortDescending(filter(score > 0, mappedAnswers), by=usefulness)
context = []
for answer in answers:
    if fitsTokenBudget(context, answer):
        context.append(answer)
    else:
        stop
finalAnswer = LLM(query, context)
```

最终一次 LLM 调用基于目标问题与选出的中间答案，生成返回给用户的全局答案。论文描述的是按分数排序、逐项装入预算，并未要求对中间答案做精确去重或数值聚合。

## 5. 为什么需要它

### 5.1 控制上下文长度

若直接把所有社区摘要放进一个提示，摘要数量增加后就可能超过模型上下文限制。分块使 Map 调用各自保持在预算以内；Reduce 再从中间答案中挑选有限内容供最终调用使用。

### 5.2 覆盖多个主题

全局问题通常涉及语料库的多个部分。Map 让不同摘要块都能独立提供候选观点，避免全局回答只依赖一次相似度检索命中的少数内容。随机打乱也有助于分散相关内容，而非让它们固定落在某一批。

### 5.3 并行扩展

每个 Map 块之间相互独立，适合并行执行。增加语料规模主要会增加 Map 批次数，而不必把所有信息塞进单个超长请求。

### 5.4 让有限预算优先容纳相关答案

Reduce 使用 Map 生成的有用性分数排序，而不是简单按社区或文件顺序截断。这样有限的最终上下文优先容纳模型判断更能回答问题的结果。

## 6. 与局部检索及经典 Map-Reduce 的区别

| 对比点 | GraphRAG 全局 Map-Reduce | 常见局部/向量检索 |
|---|---|---|
| 目标 | 汇总语料库层面的主题、趋势和多方观点 | 找到与问题最相似的少量片段 |
| Map 输入 | 选定层级的社区摘要分块 | 通常是已召回的文档片段 |
| Map 输出 | 面向问题的答案，并带 LLM 有用性分数 | 召回内容或局部回答 |
| Reduce | 按分数排序，预算内选中间答案，再生成综合答案 | 将检索片段直接交给生成模型 |
| 汇总性质 | 语义提炼与选择，不是精确数值聚合 | 通常偏向局部证据拼接 |

因此，这里的 Map-Reduce 是一种 **LLM 驱动的查询聚焦摘要流程**。它借用了 Map-Reduce 的“分块并行、再汇总”形态，但中间结果是自然语言答案与模型评分，不是可交换、可结合的精确统计值。

## 7. 工程实现时的关键决策

### 7.1 先选社区层级

不同层级在摘要粒度和全局覆盖之间有取舍：较高层级的摘要通常更概括，较低层级的摘要通常保留更多细节。系统应把所选层级作为明确的查询参数或策略，而不是把不同层级的所有摘要不加区分地混成一组。

### 7.2 分开设置 token 预算

至少需要区分：

- **Map 输入预算**：每次 Map 调用可容纳的社区摘要 token 数；
- **Reduce 输入预算**：最终生成调用可容纳的中间答案 token 数；
- **输出预留**：为 Map 答案或最终答案保留的生成 token。

实际打包时还要为系统提示、问题文本和格式指令留出空间，不能把模型的完整上下文窗口都当作摘要预算。

### 7.3 并行时控制吞吐

Map 请求可以并行，但应设置并发上限，并明确处理超时、限流和失败重试。对于大批量任务，可持久化每批结果，以便失败后从未完成的块继续，而不是重跑全部调用。

### 7.4 评分是排序信号，不是事实置信度

0–100 分表示模型认为中间答案对目标问题有多大帮助，论文用它筛除 0 分答案并排序。它**不等价于答案正确率、证据可信度或事实置信区间**。需要事实可靠性时，应同时保留来源社区/证据引用，并对最终陈述做证据核验。

### 7.5 注意确定性与可观测性

随机打乱、LLM 生成和评分都会影响最终选中的上下文。生产实现可记录随机种子、选定社区层级、每批摘要 ID、模型版本、各 Map 输出与分数、Reduce 入选项和 token 用量，以便复现和排查。

## 8. 简化伪代码

```ts
type MapAnswer = {
  answer: string;
  usefulness: number; // 论文要求 0–100
  communityIds: string[];
};

async function globalSearch(
  query: string,
  summaries: Array<{ communityId: string; text: string }>,
): Promise<string> {
  const shuffled = shuffle(summaries);
  const batches = splitByTokenBudget(shuffled, MAP_INPUT_TOKEN_BUDGET);

  const mapped: MapAnswer[] = await mapWithConcurrencyLimit(batches, (batch) =>
    generateCommunityAnswer(query, batch),
  );

  const ranked = mapped
    .filter((item) => item.usefulness > 0)
    .sort((a, b) => b.usefulness - a.usefulness);

  const selected = packUntilTokenBudget(ranked, REDUCE_INPUT_TOKEN_BUDGET);
  return generateGlobalAnswer(query, selected);
}
```

这是表达论文数据流的伪代码，不是论文规定的具体 SDK 或函数签名。真实实现还应校验模型返回的分数范围和结构，对没有有效 Map 答案的情况显式处理，并将社区来源附在中间答案上，便于最终答案追溯。

## 9. 流程小结

```text
社区摘要（某一层级）
  -> 打乱并按 token 限制分块
  -> 各块并行生成中间答案 + 有用性分数
  -> 丢弃 0 分结果
  -> 按有用性降序并在 token 预算内选择
  -> LLM 综合生成全局答案
```

核心思想不是“把整个图一次交给模型”，而是先让模型从各个摘要块中提炼与问题相关的候选答案，再用有限上下文预算完成跨主题综合。它适合全局性问题，但中间分数只能用于相关性排序；答案的事实准确性仍需依赖可追溯证据和验证机制。
