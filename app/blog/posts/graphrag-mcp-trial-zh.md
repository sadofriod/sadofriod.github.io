---
title: 'GraphRAG-ts MCP 免费试用：先看一条带出处的答案，再申请开通'
date: '2026-10-23'
excerpt: '面向 TypeScript + PostgreSQL 团队的 GraphRAG MCP。先读一段跨文档、带来源片段的真实返回，再申请小规模托管试用；不需要自己部署数据库或模型服务。'
description: 'graphrag-ts MCP 托管试用说明：一个跨四份文档的关系型问题、对应的来源原文、申请方式、试用边界，以及不能承诺的部分。'
tags: ['GraphRAG', 'MCP', 'TypeScript', 'PostgreSQL', 'Agent']
categories: GraphRAG
keywords: 'GraphRAG MCP, TypeScript GraphRAG, PostgreSQL pgvector, Agent 检索, 带出处回答, MCP 试用'
lang: zh
translationKey: graphrag-mcp-trial
---

大多数 Agent 项目的检索问题不是"找不到文档"，而是"找到三份文档，却没有一份说明当初为什么这么定、影响了哪些模块"。`graphrag-ts` 是我用 TypeScript + PostgreSQL 做的解法，并以 MCP server 的形式暴露，让 Agent 当成一个工具来查。

我正在开放小规模托管试用。先看下面这个例子，如果答案的形状对你有用，回复**一个客户端名 + 一个问题**就够了。

## 一个问题，四份文档

语料来自仓库里虚构、MIT 许可的演示数据（[`examples/project-history`](https://github.com/sadofriod/graphrag-ts/tree/main/examples/project-history/corpus)）：

> Harbor 为什么把浏览器 session 从 Redis 换成 PostgreSQL？影响了哪些模块？

四份文档分别是 ADR、架构概览、变更记录、上线 runbook。答案只可能横跨它们：ADR 给出决策与理由，架构文档说明哪些模块共享数据库，变更记录写负责人，runbook 定义上线检查。

服务要返回的内容，以及每一部分的出处：

- **决策与理由** —— ADR-007：*"Harbor moved browser sessions from Redis to PostgreSQL. The motivation was to make session revocation and account suspension commit in the same database transaction."* 同一份文档还记录了被否掉的替代方案：给 Redis 删除加重试队列只能做到 *"eventual rather than transactional revocation"*。
- **受影响模块** —— 架构概览：*"The gateway delegates session lookup to the Session Repository. The Account Service owns account state and invokes the same repository for transactional revocation."* 再加上 ADR 范围一节里的 Background Cleanup Worker。
- **上线责任** —— 在变更记录和 runbook 里，不在 ADR 里。
- **最容易被答错的边界** —— Redis 并没有消失：发现链路仍然用它缓存公开目录推荐，且这个缓存 *"is not an authentication failure"*。

上面的引文都可以在仓库语料里逐字核对，不需要先相信我的答案。托管返回的是同样的结构：答案正文 + 每条证据的 `source` 与 `excerpt` + 产出这次答案的 `index_version`。这个版本号决定了"重试是否可比"：同一语料、同一快照、同一答案。

关于来源要说清楚：这些是为演示虚构的文档，不是客户的生产设施；我也不在这里宣称对纯向量检索取得了 benchmark 优势。仓库里的 comparison fixture 覆盖了五条这类跨文档问题，把它们当作**预期**，而不是准确率证明。

## 试用具体是什么

- **一个 MCP 客户端**，用你已经在用的那个，并确认具体版本。我会先确认客户端和最小配置，再决定是否开通；现在不会说"所有客户端一键可用"。
- **一个预索引 workspace**，装的就是这套公开语料。你不用装 PostgreSQL、不用跑构建、不用准备模型 API key。
- **只读查询权限**，14 天、累计最多 30 次局部查询。索引、写入和高成本的全局 map-reduce 默认关闭，需要时单独评估。
- **明确的鉴权边界**：接口要我用 bearer 凭证放行，域名还有一层邮箱白名单。两层是故意的，代价是首分钟不是零摩擦：你回复、我授权、你连接。目前这一步是人工的，通常一个工作日内处理——我宁愿直说，也不包装成"即时开通"。
- **不接私密语料**。在真正有租户隔离之前，只用公开或合成数据。

不能承诺的：SLA、匿名无限查询、所有客户端一键安装、或者替代你自己的文档管道。

## 如何申请

发邮件到 [justlikeashes@gmail.com](mailto:justlikeashes@gmail.com)，写清三件事：

1. 你打算用哪个 MCP 客户端、什么版本；
2. 一个你真正需要跨多份文档回答的问题；
3. 需要加白名单的邮箱（如果和发件邮箱不同）。

我会先判断演示语料能不能回答它，再决定是否开通。如果答不了，这也是有用的结论——它说明不了是不是匹配需求。

## 想自己部署

`graphrag-ts` 是 MIT 许可的，Bun 或 Node + PostgreSQL/pgvector 都能跑：

```sh
git clone https://github.com/sadofriod/graphrag-ts
cd graphrag-ts && pnpm install
```

真正的门槛是模型：需要一个 chat endpoint，以及一个输出**严格 768 维**的 embedding endpoint（schema 是 `vector(768)`，维度不符会表现为构建失败）。MCP 服务、访问策略和样例语料都在
[`integrations/mcp`](https://github.com/sadofriod/graphrag-ts/tree/main/integrations/mcp) 里有说明。

另外有一个面向 Agent 的付费接口：`POST /api/v1/query`，单次局部查询 $0.02，走 x402 在 Base 上以 USDC 结算——不用注册、不用申请、不用开票。它跑在独立的域名上，和上面的试用入口分开；客户端从 `402` 响应里就能读到价格和输入结构，不需要提前配置任何东西。

公开的是接口、发现用的元数据和仓库里的自托管路径；部署方自己的配置不公开。只有答案产出之后才会结算，查询失败或超时不会扣买家一分钱。
