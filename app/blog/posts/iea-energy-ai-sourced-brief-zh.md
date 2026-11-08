---
title: '一份带出处的简报长什么样：IEA《Energy and AI》里的三条结论'
date: '2026-11-06'
excerpt: '把 IEA《Energy and AI》执行摘要喂进 graphrag-ts，问三个投研问题。每条结论都带回了它在原文里的那一段——同时有一个问题被系统拒答。两半都写在这里。'
description: '一份完整可复现的带溯源情报简报：IEA《Energy and AI》的三条可核验结论，各自附原文与 chunk id，以及那个被系统拒答的问题和原因。'
tags: ['GraphRAG', 'TypeScript', 'PostgreSQL', '检索', '评测']
categories: GraphRAG
keywords: '带出处的简报, GraphRAG 证据, 结论溯源, IEA Energy and AI, 数据中心用电, 检索拒答, TypeScript GraphRAG'
lang: zh
translationKey: iea-energy-ai-sourced-brief
---

> **给买家。** 只返回一段话的检索系统，等于让你把研究重做一遍。这篇就是完整产物：三条结论、每条背后的原文、chunk id，以及一个被系统拒答的问题。你可以拿源 PDF 逐行核对，几分钟能核完。

没有段落出处的答案不是研究，只是一句听起来对的话。所以我检查任何检索系统的第一件事，不是答案像不像真的，而是**能不能点回产生它的那句话**。

下面是今天跑的一份完整简报，原文照录，包括失败的那部分。

## 索引了什么

- **语料**：IEA《Energy and AI》（2025-04-10）执行摘要，CC BY 4.0，可以引用和转载。
- **体量**：18,776 字符，单文档。
- **索引耗时**：6 分 25 秒（抽取、建图、发布快照）。
- **快照**：`781a5cad`，workspace `iea-energy-ai-2025`。
- **检索**：本地混合检索 —— 向量相似度 + 关键词 + 图邻域，每个问题取前 6 段。

## 三条结论，各自附原文

| # | 结论 | 原文段落 | chunk |
|---|---|---|---|
| 1 | 2030 年数据中心用电翻倍以上，约 945 TWh | "Data centre electricity consumption is set to more than double to around 945 TWh by 2030. This is slightly more than Japan's total electricity consumption today." | `cmw4m2dv80022s3019chn8bil` |
| 2 | 2035 年情景区间 700–1,700 TWh | "By 2035, the range of data centre electricity demand across our cases spans from 700 to 1 700 TWh." | `f97ebb48` |
| 3 | 约 20% 规划中的数据中心项目面临延期风险 | "unless these risks are addressed, around 20% of planned data centre projects could be at risk of delays" | `a23d935f` |
| 4 | 精炼镓约 99% 来自中国 | "China currently accounts for around 99% of global refined gallium supply." | `cmw4m2e39002es3012uyq3skd` |

有意思的不是这些数字——它们本来就在报告里。有意思的是**真正的约束是并网，不是发电**：

- 发达经济体新建输电线要 **4–8 年**；
- 变压器与电缆的等待时间**三年内翻倍**；
- 燃气轮机交付要**数年**，可能把投产推过 2030。

这条链条讲的是设备与并网服务的投资逻辑，不是电力的。一个会把段落丢掉的摘要器，能给我 945 TWh 的标题数字，却不会给我这个约束。

## 图谱抽出的关系图

```
数据中心需求 ──驱动──> AI 训练 / 推理
     ├─ 满足(50%) ──────> 可再生能源
     ├─ 满足(+175 TWh) ─> 天然气（主要美国）
     ├─ 满足(≈+175 TWh) ─> 核电（中/日/美，首批 SMR 约 2030）
     └─ 受制于 ─────────> 并网排队 / 变压器 / 电缆 / 燃气轮机
                 └─ 导致 ─> 约 20% 规划项目延期风险
AI 数据中心 ──资本强度是──> 铝冶炼厂的 10 倍
镓 ──供应集中──> 中国约 99%
```

## 报告自己标注的不确定性

- 2035 年跨度为 **700–1,700 TWh**，取决于 AI 采纳速度、能效改进和瓶颈解除速度。
- 高效情景下 2035 需求比基准**低 20%**。
- 天然气增量在 Lift-Off 情景是 Headwinds 情景的**4 倍**，核电的弹性更大。
- 这些是 IEA 的模型输出与咨询结论，不是实测值。引用时应标注为"估计"。

一个只返回"2030 年 945 TWh"、把区间丢掉的系统，技术上没错，实践上会误导。

## 它拒答的那个问题

我问：**「哪些瓶颈可能让数据中心项目延期？涉及哪些具体设备、交付周期和比例数字？」**

它答：**「根据检索到的证据，报告没有说明哪些瓶颈会导致数据中心项目延期，也没有给出具体设备交付周期或延期比例。」**

这个回答在"那段话确实存在"的意义上是错的。但它是检索失败的诚实回答：那一段没进召回集，模型要给出那些数字就只能编。它没有编。

我把同一个问题换成报告里的字面术语重问 —— `20% ... four to eight years ... transformers and cables ... turbine deliveries several years` —— 一次命中，原文照引。

所以失败模式很具体，值得命名：**抽象提问会漏召回，字面提问能命中**。这是检索权重问题，不是推理问题，也是我下一步要调的。我不会改的是**拒答行为**：语料里没有的段落，编出来比说"无法确认"危险得多——说"无法确认"，我知道要换个问法；编得理直气壮，我根本不知道要换。

## 怎么复现

```bash
# 1. 索引（单文档，单 workspace）
graphrag remember_text --workspace iea-energy-ai-2025 \
  --source "IEA Energy and AI (2025) Executive Summary"

# 2. 提问
graphrag query_graph --workspace iea-energy-ai-2025 \
  --query "2030 与 2035 年数据中心用电需求、区域分布，以及由哪些能源满足" \
  --max-results 6
```

每条结果都带 chunk id。上面那个 `cmw4m2dv80022s3019chn8bil` 是库里真实的一行——结论、原文和引用是同一个对象，不是三份靠人工同步的东西。

## 这是什么，不是什么

它是一条能用的流水线：把一份公开报告变成可以逐行审计的简报，索引约 6 分钟一份文档，查询成本可计量。

它不是分析师。它找出了报告里写的约束，但它没有判断市场是否已经为这些约束定价。那个判断仍然是我的，我也希望一直是。

## 相关

- [graphrag-ts（GitHub）](https://github.com/sadofriod/graphrag-ts) — MIT，可自行部署在 Bun 或 Node 上
- [托管 MCP 试用](https://blog.ashesborn.cloud/blog/graphrag-mcp-trial) — 先读一条带出处的答案，再申请
- [免费 DOI 撤稿查询](https://ashesborn.cloud/datasets) — 同一套栈回答另一个问题
