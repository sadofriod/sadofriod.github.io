---
title: '前端工程师 / Agent 开发工程师简历 | TypeScript、React、GraphRAG'
date: '2026-10-19'
excerpt: '拥有京东、Compass 与 Yellow 工作经历的前端工程师，专注 TypeScript、React、微前端、低代码平台及 GraphRAG / Agent 应用开发。'
description: '前端工程师与 Agent 开发工程师求职简历，包含京东低代码平台、Compass 微前端与 Salesforce 规则引擎、Yellow Web3 交易平台，以及 TypeScript GraphRAG 项目经验。'
tags: ['前端工程师简历', 'Agent 开发', 'TypeScript', 'React', 'GraphRAG', '微前端']
categories: 简历
keywords: '前端工程师简历, Agent开发工程师简历, TypeScript前端开发工程师, React前端工程师, GraphRAG项目经验, AI Agent应用开发, 微前端架构优化, 低代码平台开发, Salesforce规则引擎开发, Web3交易平台前端开发, 前端工程师求职简历, 京东前端开发经验'
---

# 前端工程师 / Agent 开发工程师简历

邮箱：justlikeashes@gmail.com | 电话：xxxxxx  
GitHub：[sadofriod](https://github.com/sadofriod) | 个人博客：[Ashes Born's Blog](https://blog.ashesborn.cloud/)

## 求职方向

Agent 开发 / 前端开发

## 教育经历

**内蒙古工业大学** | 软件工程学士 | IMUT, ON | Sep 2015 - Jul 2019

## 工作经历

**[Yellow](https://www.yellow.org/)（欧洲 Web3 公司）** | 前端工程师 | Remote | Sep 2025 - Jul 10, 2026

- 参与 Web3 交易平台从 0 到 1 开发，负责交易流程及 Wallet 接入；平台覆盖现货、永续合约等主流交易场景。

**Compass Inc.（NYSE: COMP）** | 前端工程师 | Remote, ON | Jun 2022 - Sep 2025

- 负责微前端架构优化，降低 E2E 测试运行时间并提升开发体验。
- 开发 Salesforce 规则引擎与 UI 渲染引擎，实现 Auth 功能迁移。
- 提升系统 E2E 测试和单元测试覆盖率。

**JD** | 前端工程师 | 北京, ON | Jul 2019 - Mar 2022

- 负责低代码开发平台核心模块开发，支持京东 11.11/6.18 大促公关及内部数据看板、京东健康和商户数据看板建设。
- 构建平台 CI/CD 流程，参与静态资源服务开发与缓存策略设计。
- 使用平台搭建可视化大屏。

## 项目经历

**[graphrag-ts](https://github.com/sadofriod/graphrag-ts)** | TypeScript, Bun, PostgreSQL, Prisma, pgvector, MCP

- 作者并持续开发面向 Markdown 文档的 TypeScript GraphRAG 项目，构建知识图谱并提供检索问答能力。
- 实现 Markdown 文档摄取、实体/关系/声明抽取、Leiden 社区检测及增量构建，支持复用未变化的社区摘要。
- 构建向量、关键词与图结构混合检索流程，基于检索到的来源证据生成回答，并提供 MCP 服务接入。
- **GraphRAG 技术文章：** [索引管道与增量更新](https://blog.ashesborn.cloud/blog/article-48439fbce06b) | [检索实现说明](https://blog.ashesborn.cloud/blog/article-41f472d98d25) | [增量构建实现](https://blog.ashesborn.cloud/blog/article-e98105d779d1) | [Global Map-Reduce 查询实现](https://blog.ashesborn.cloud/blog/article-9b49bb9ddfb1)

**[京东视界低代码数据可视化平台](https://jdv.jd.com)** | TypeScript, React, Redux, three.js, D3.js

- **场景：** 支持京东 11.11/6.18 大促公关及内部数据看板、京东健康和商户数据看板建设。
- **职责：** 设计并开发平台核心功能与数据可视化组件，包括状态管理、历史记录、组件分组、第三方接口数据结构转换、可视化组件配置项开发方式优化，以及拖拽和实时数据接入性能优化。
- **实现：** 使用 Hooks 缓存部分状态，采用分层缓存管理历史记录，以堆栈加速分组查找，并通过递归遍历配置文件生成组件配置表单。

**Salesforce 规则/UI 引擎开发** | TypeScript, React, Redux

- **场景：** 为 Compass Inc. 全部用户迁移 Salesforce 鉴权系统，将原平台中的用户权限业务迁移到新开发的规则/UI 引擎。
- **职责：** 开发 Salesforce 配置规则引擎与 UI 渲染引擎。
- **实现：** 以有限状态机（FSM）为设计思路解析并渲染 Salesforce 规则，抽象规则节点并统一前后端数据协议；使用 PEG.js 将 [Salesforce 方言](https://help.salesforce.com/s/articleView?id=sf.customize_functions.htm&type=5) 转译为 AST，并在自建 sandbox 中运行。

**[微前端优化](https://github.com/sadofriod)** | TypeScript, webpack, Cypress

- **场景：** CI 中较高的 E2E 覆盖率导致运行时间过长；现有架构无法支持 React 局部热更新，影响开发效率。
- **职责：** 开发 E2E 增量测试能力，并支持 MonoRepo 结构下 React 项目的局部热更新。
- **实现：** 对比 Git 历史记录定位变更文件，使用 PEG.js 分析 AST 并追踪两层关联用例，筛选需运行的测试；通过共享 React 实例并调整依赖外置加载方式，解决子项目热更新失效问题。
- **技术文章：** [增量运行 E2E 测试](https://sadofriod.github.io/%E5%A2%9E%E9%87%8F%E8%BF%90%E8%A1%8CE2E%E6%B5%8B%E8%AF%95.html) | [MonoRepo 结构下启动 React 项目局部热更新](https://sadofriod.github.io/%20monorepo%E7%BB%93%E6%9E%84%E4%B8%8B%E5%90%AF%E5%8A%A8react%E9%A1%B9%E7%9B%AE%E5%B1%80%E9%83%A8%E7%83%AD%E6%9B%B4%E6%96%B0.html)

## 技能

- **语言：** 熟悉 JavaScript、TypeScript、Bash。
- **框架和库：** 熟悉 React、React Hooks、ExtJS、Node.js、Jest、Puppeteer、D3.js、Cypress。
- **其他：** 熟悉 Git、Docker、函数式编程。

## 荣誉与专利

- 基于 React 的图灵完备表单渲染系统（Patent ID: 202110043108.9）
- 基于 Headless-Desktop 的 Web 应用自动监控系统
- JD 2020 年闪耀新星
