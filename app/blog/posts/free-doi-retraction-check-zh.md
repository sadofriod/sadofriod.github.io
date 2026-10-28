---
title: '任何一个 DOI 是否被撤稿：免费查，并且给出每一处出处'
date: '2026-10-28'
excerpt: '撤稿信息散落在 Crossref、Retraction Watch 和索引级标记三处，且互相不一致。我们把三者合并成一张 CC0 图谱，并开放了单 DOI 查询：约 1.6 秒返回，每个判定都标出来源与层级。下面是实测数字、三种最容易被误读的返回，以及调用方式。'
description: '免费的单 DOI 撤稿查询，背后是 CC0 的引用与撤稿图谱：98,868 篇论文、144,814 条引用边、572 条撤稿状态记录；20 个 DOI 实测，中位 1,595 毫秒，每个撤稿判定都有三个来源。'
tags: ['GraphRAG', 'research-integrity', 'dataset', 'MCP', 'TypeScript']
categories: GraphRAG
keywords: 'DOI 撤稿查询, 免费撤稿接口, Retraction Watch 数据, Crossref update-to, 引用图谱数据集, 学术诚信工具, CC0 数据集'
lang: zh
translationKey: free-doi-retraction-check
---

Agent 引用了一篇被撤稿的论文时，它不会自己说。它会写一段很确定的文字，末尾挂一个 DOI，而这个 DOI 恰好是 1998 年那篇 Wakefield，或者 2020 年那篇羟氯喹试验——两篇都已撤稿，两篇至今仍被上千篇文献引用。

能抓住这件事的信息其实存在，只是散在三处，而且三处互相不一致：

- **Crossref** 在出版方发布撤稿声明时记录一条 `update-to` 关系；
- **Retraction Watch** 维护通知级别的记录，带日期；
- **OpenAlex** 在作品本身带一个索引派生的撤稿标记。

只查其中任一来源都会漏。所以我们把三者合并成一张图，以 CC0 发布，并在前面开放了免费查询。这篇文章给的是账目：数据里有什么、接口实际返回什么、以及一组你可以自己重跑的实测数字。

## 发布了什么

数据集是 Hugging Face 上的 `ashesborn6/integrity-citation-retraction-graph`，快照 `ri-20261025-1526`：

- **98,868 篇论文**——OpenAlex 作品 ID、DOI、标题、年份；
- **144,814 条引用边**——`citing_id → cited_id`，并记录这条边来自哪个源；
- **572 条撤稿状态记录**——每条是 *(论文, 来源)* 的一条断言，各自带来源层级。

最后这个设计决定是整件事的关键。撤稿不是一个来自单一权威的布尔值，而是一组可能互相矛盾的断言；schema 把它们分开保留，而不是压成一个下游读者无法审计的 `is_retracted` 字段。层级 **A** 表示直接记录撤稿的注册库（Crossref `update-to`、Retraction Watch）；层级 **C** 表示索引派生的标记（OpenAlex）。

Retraction Watch 的"原因与性质"自由文本被刻意排除在外。撤稿是一个书目事件；把出版方的措辞一起带走，会让一次查询变成一次指控。

## 调用返回什么

```
GET https://pay.ashesborn.cloud/api/v1/judge/paper?doi=10.1016/S0140-6736(97)11096-0
```

```json
{
  "paper": { "paper_id": "W2117847125", "doi": "10.1016/s0140-6736(97)11096-0", "year": 1998, "source_tier": "C" },
  "statuses": [
    { "source": "openalex",         "source_tier": "C", "is_retracted": true, "retraction_date": null },
    { "source": "retraction_watch", "source_tier": "A", "is_retracted": true, "retraction_date": "2010-02-06" }
  ]
}
```

不需要 key、不需要注册，`access-control-allow-origin: *`，所以浏览器、脚本、以及[在线查询页](/datasets)都能直接调。返回里没有任何模型生成的内容——同一个 DOI 在同一个快照下返回同样的字节，这是它能被放进 Agent 流水线、而不是只能放在旁边的性质。

## 实测：20 个 DOI

20 个 DOI，逐个 GET，串行、不重试：**20/20 返回 200**，中位 **1,595 毫秒**，最慢 5,318 毫秒（空闲后冷启动），16 个撤稿判定每一个都有**三个**来源一致。完整表格、方法与可复现的 shell 循环在[基准页](/benchmark)。

真正有意思的不是延迟，而是三种返回形态——朴素的 `is_retracted ? "撤稿" : "干净"` 会把它们全部读错：

1. **弃权（abstained）**：DOI 不在快照内时返回 `abstention_reason: "paper_not_in_snapshot"` 和空状态列表。它拒绝判定。把这种结果报成"干净"，就是检查工具在制造虚假的安全感。
2. **无状态记录（no status rows）**：论文在图里，但没有任何来源对它表态。这也不是"干净"，是证据缺失——在我们的返回里，它是一个与"弃权"不同的独立判定。
3. **来源冲突**：层级 A 与层级 C 的记录可能矛盾。悄悄采信 A 的记录会掩盖冲突；我们把它报出来。

## 图谱渲染

公开子集是邻域采样：12 篇已撤稿的种子论文、引用它们的作品、以及这些作品各自的参考文献表。在这个样本里，**781 篇不同的论文至少引用了一篇撤稿种子**，共 788 条边——其中 **6 篇引用了两篇及以上**。这 6 篇正是"这是图问题、不是查询问题"的原因：一个结论若同时建立在两个独立的撤稿地基上，风险与只压一个不是一回事，而这件事只有沿边走才看得见。

[数据集走读页](/datasets/retraction-integrity)上可以悬停查看真实渲染——1,039 个节点，由 115 KB 的节点/边数据在浏览器端画出，没有图表库。

## 免费与付费的界线

这条界线必须说清楚，因为它决定了一个产品是工具还是诱饵：

- **免费**：单 DOI 的论文级撤稿状态，无需 key。它回答的是"这篇论文被撤稿了吗"。
- **付费 $0.02**：撤稿**传播**判断——给定一篇论文，它的论证地基里是否含撤稿工作、深度多少、各来源是否一致、有无冲突标记。
- **付费 $0.10**：完整证据审计——证据路径、层级、确定性解释。
- **数据**：CC0-1.0。下载下来做你自己的东西，回链是欢迎而不是义务。

付费调用走 Base 上的 x402，也就是一个程序可以按次付费，不需要订阅、不需要 API key、也不需要先来一轮销售沟通。判断引擎是确定性的：每次调用 0 个 LLM token。

## 明确的局限

- 公开图谱是**邻域样本**，不是整个学术记录：12 个种子，每个最多 60 篇引用作品。
- 撤稿日期来自记录它的那个来源；`null` 的意思是"该来源没有给出日期"，不是"撤稿日期未知"。
- 572 条状态记录很小。这是一个刻意选择的起始子集，而快照 ID 会随每次返回一起走，所以你能判断一个答案什么时候开始过时。
- `mcp.ashesborn.cloud/mcp` 目前需要凭证，MCP 客户端还不能匿名连接。上面那个 HTTP 查询是不需要凭证的那部分。

## 试一个

把你本来就不太相信的 DOI 粘进[查询页](/datasets)。如果返回的形状对你有用，同样的形状可以程序化调用，而背后的数据一次 `curl` 就能拿到：

```bash
curl -sL https://huggingface.co/datasets/ashesborn6/integrity-citation-retraction-graph/resolve/main/data/retraction_status.jsonl.gz | gunzip | head
```
