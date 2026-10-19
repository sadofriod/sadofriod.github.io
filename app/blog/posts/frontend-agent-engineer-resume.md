---
title: 'Frontend and Agent Engineer Resume | TypeScript, React, GraphRAG'
date: '2026-10-19'
excerpt: 'Frontend engineer with experience at JD, Compass, and Yellow, specializing in TypeScript, React, micro-frontends, low-code platforms, and GraphRAG / AI agent development.'
description: 'Resume for a frontend and AI agent engineer featuring experience building JD low-code platforms, optimizing Compass micro-frontends and Salesforce rule engines, developing a Yellow Web3 trading platform, and creating a TypeScript GraphRAG project.'
tags: ['Frontend Engineer Resume', 'AI Agent Development', 'TypeScript', 'React', 'GraphRAG', 'Micro-Frontends']
categories: Resume
keywords: 'frontend engineer resume, AI agent developer resume, TypeScript React frontend engineer, GraphRAG project experience, AI agent application development, micro frontend architecture optimization, low-code data visualization platform development, Salesforce rules engine development, Web3 trading platform frontend development, JD frontend engineer experience, JavaScript TypeScript developer, frontend engineer job application resume'
---

# Frontend and Agent Engineer Resume

Email: justlikeashes@gmail.com | Phone: xxxxxx  
GitHub: [sadofriod](https://github.com/sadofriod) | Personal Blog: [Ashes Born's Blog](https://blog.ashesborn.cloud/)

## Target Roles

AI Agent Development / Frontend Engineering

## Education

**Inner Mongolia University of Technology** | B.Eng. in Software Engineering | IMUT, ON | Sep 2015 - Jul 2019

## Work Experience

**[Yellow](https://www.yellow.org/) (European Web3 Company)** | Frontend Engineer | Remote | Sep 2025 - Jul 10, 2026

- Contributed to building a Web3 trading platform from scratch, owning trading workflows and wallet integrations across major use cases, including spot trading and perpetual futures.

**Compass Inc. (NYSE: COMP)** | Frontend Engineer | Remote, ON | Jun 2022 - Sep 2025

- Optimized the micro-frontend architecture, reducing E2E test runtime and improving the developer experience.
- Built a Salesforce rules engine and UI rendering engine to support the migration of authentication functionality.
- Increased E2E and unit test coverage across the system.

**JD** | Frontend Engineer | Beijing, ON | Jul 2019 - Mar 2022

- Developed core modules for a low-code development platform, supporting JD 11.11 and 6.18 promotional communications, internal dashboards, and data dashboards for JD Health and merchants.
- Built the platform's CI/CD pipeline and contributed to static asset serving and cache strategy design.
- Used the platform to build large-screen data visualizations.

## Selected Projects

**[graphrag-ts](https://github.com/sadofriod/graphrag-ts)** | TypeScript, Bun, PostgreSQL, Prisma, pgvector, MCP

- Created and continue to develop a TypeScript GraphRAG project for Markdown documents, building a knowledge graph and providing retrieval-augmented question answering.
- Implemented Markdown ingestion, entity, relationship, and claim extraction, Leiden community detection, and incremental builds that reuse summaries for unchanged communities.
- Built a hybrid retrieval pipeline combining vectors, keywords, and graph structure; answers are grounded in retrieved source evidence. Also provides MCP integration.
- **GraphRAG articles:** [Indexing Pipeline and Incremental Updates](https://blog.ashesborn.cloud/blog/article-48439fbce06b) | [Retrieval Implementation Guide](https://blog.ashesborn.cloud/blog/article-41f472d98d25) | [Incremental Build Implementation](https://blog.ashesborn.cloud/blog/article-e98105d779d1) | [Global Map-Reduce Query Implementation](https://blog.ashesborn.cloud/blog/article-9b49bb9ddfb1)

**[JD Vision Low-Code Data Visualization Platform](https://jdv.jd.com)** | TypeScript, React, Redux, three.js, D3.js

- **Context:** Supported JD 11.11 and 6.18 promotional communications, internal dashboards, and data dashboards for JD Health and merchants.
- **Role:** Designed and developed core platform features and visualization components, including state management, history, component grouping, third-party API data transformation, a streamlined workflow for configuring visualization components, and performance improvements for drag-and-drop and real-time data ingestion.
- **Implementation:** Used Hooks to cache selected state, layered caching to manage history, and a stack to speed up group lookups. Recursively traversed configuration files to generate component configuration forms.

**Salesforce Rules and UI Engine** | TypeScript, React, Redux

- **Context:** Migrated Salesforce authentication for all Compass users, moving user-permission workflows from the existing platform to a newly developed rules and UI engine.
- **Role:** Developed the Salesforce configuration rules engine and UI rendering engine.
- **Implementation:** Designed the rule parser and renderer around a finite-state machine (FSM), abstracted rule nodes, and standardized the frontend-backend data contract. Used PEG.js to parse the [Salesforce formula language](https://help.salesforce.com/s/articleView?id=sf.customize_functions.htm&type=5) into an AST and execute it in a custom sandbox.

**[Micro-Frontend Optimization](https://github.com/sadofriod)** | TypeScript, webpack, Cypress

- **Context:** High E2E coverage made CI runs slow, while the existing architecture could not support React hot module replacement (HMR) for individual applications, slowing development.
- **Role:** Developed incremental E2E test selection and enabled application-level React HMR in a monorepo.
- **Implementation:** Compared Git history to identify changed files, used PEG.js to parse ASTs and trace related tests across two dependency levels, then selected the tests to run. Fixed broken HMR in subprojects by sharing the React instance and adjusting how external dependencies were loaded.
- **Technical articles:** [Running E2E Tests Incrementally](https://sadofriod.github.io/%E5%A2%9E%E9%87%8F%E8%BF%90%E8%A1%8CE2E%E6%B5%8B%E8%AF%95.html) | [Enabling React HMR for Individual Apps in a Monorepo](https://sadofriod.github.io/%20monorepo%E7%BB%93%E6%9E%84%E4%B8%8B%E5%90%AF%E5%8A%A8react%E9%A1%B9%E7%9B%AE%E5%B1%80%E9%83%A8%E7%83%AD%E6%9B%B4%E6%96%B0.html)

## Skills

- **Languages:** JavaScript, TypeScript, Bash.
- **Frameworks and Libraries:** React, React Hooks, ExtJS, Node.js, Jest, Puppeteer, D3.js, Cypress.
- **Other:** Git, Docker, functional programming.

## Honors and Patents

- Turing-complete form rendering system based on React (Patent ID: 202110043108.9)
- Headless-desktop-based web application automated monitoring system
- JD 2020 Rising Star Award
