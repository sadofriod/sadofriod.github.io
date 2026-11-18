---
title: 'GraphRAG in TypeScript: the build, in the order you build it'
date: '2026-11-18'
excerpt: 'Eleven articles on building a GraphRAG system in TypeScript on PostgreSQL: design, ingest, index, incremental updates, communities, retrieval, global Map-Reduce, and shipping it as an MCP server. Read them in this order.'
description: 'The reading order for the TypeScript GraphRAG series: PostgreSQL schema design, multi-document ingest, indexing pipeline, incremental builds, Leiden communities, hybrid retrieval, global Map-Reduce, and the MCP server. Each entry says what the article actually shows.'
tags: ['GraphRAG', 'TypeScript', 'PostgreSQL', 'pgvector', 'MCP', 'Retrieval']
categories: GraphRAG
keywords: 'graphrag typescript, graphrag postgresql, graphrag indexing pipeline, incremental graphrag, leiden community detection graphrag, graphrag retrieval, graphrag global search map reduce, graphrag mcp server'
lang: en
translationKey: graphrag-series-index
---

Most GraphRAG material is written for Python and assumes you can read the paper first. This blog took the other route: a working TypeScript implementation on one PostgreSQL database, written up as it was built. Eleven posts is enough that the order matters more than any single one, so this page is the order.

Everything below is implemented in [graphrag-ts](https://github.com/sadofriod/graphrag-ts) — graph, embeddings, communities and citations in the same Postgres instance, with pgvector for the vector side. Nothing here is pseudo-code dressed up as a tutorial; where an article says "the pipeline does X", X is in the repository.

## 1. Design the schema before you write the extractor

- [GraphRAG on PostgreSQL + TypeScript: design](/blog/graphrag-postgresql-typescript-implementation-design) — the DDL shape, how relation edge weights are calculated and accumulated, the community detection and hierarchical summarisation pipeline, and where each GraphRAG concept lands as a table.

Read this one first even if you plan to change everything in it. Most of the later articles assume the tables described here.

## 2. Get documents in, and decide how they split

- [GraphRAG multi-document input: architecture](/blog/graphrag-multi-document-input-processing-architecture-and-directory-structure) — multi-format ingestion, cross-document chunking, entity-resolution deduplication, the project directory layout, and the incremental update path.

The section-parent matching described here is what makes step 4 possible, so do not skip the chunking rules.

## 3. Index: extraction, edges, communities, summaries

- [GraphRAG indexing pipeline in TypeScript](/blog/graphrag-typescript-indexing-pipeline-and-incremental-updates) — adaptive chunking, structured LLM extraction with a fallback path, weighted edge aggregation, recursive Leiden communities, summary persistence, and content-hash-based incremental updates.

## 4. Rebuild only what changed

- [GraphRAG incremental build in TypeScript](/blog/graphrag-incremental-build-in-typescript-diffing-updates-and-pruning) — title and SHA-256 diffing, Markdown section-parent matching, the order updates must be applied in, explicit deletion semantics, and how edge weights accumulate across runs.

This is the article that separates a demo from something you can keep running daily. The failure mode it avoids — a small input change reshuffling every community — is the reason the diffing is this explicit.

## 5. Understand the community layer

- [Understanding the Community Concept in GraphRAG](/blog/understanding-the-community-concept-in-graphrag) — what a community is, how Leiden finds them, the hierarchical community tree (root, intermediate, leaf), query-focused summarisation, and candidate answer aggregation.

Read it before tuning anything in steps 6–7: the global answer quality is bounded by the summaries here, not by the prompt.

## 6. Retrieval: local, then hybrid

- [GraphRAG Retrieval Implementation Guide](/blog/graphrag-retrieval-implementation-guide) — query intent parsing, multi-channel entity retrieval with Reciprocal Rank Fusion, neighbour expansion, community scoring, LLM filtering, and final answer synthesis.
- [GraphRAG hybrid retrieval in TypeScript](/blog/graphrag-hybrid-retrieval-and-evidence-grounding-in-typescript) — the shipped version: entity and topology recall, hybrid vector and keyword evidence, RRF community ranking, and evidence grounding in the returned result.

The second article is the one to copy from. The first is the map of the decisions that got there.

## 7. Global questions: Map-Reduce over communities

- [GraphRAG Global Search Map-Reduce Explained](/blog/graphrag-global-map-reduce) — how community summaries are shuffled and split by token budget, mapped into scored intermediate answers, ranked, and reduced into a corpus-level answer.
- [GraphRAG Global Map-Reduce Query Implementation](/blog/graphrag-global-map-reduce-query-implementation) — the code-level version in graphrag-ts: approximate token batching, bounded concurrent Map calls, retries, JSON validation, and usefulness-ranked Reduce packing.

Token-budget arithmetic and retry semantics are the two places this step quietly breaks at scale; both articles spend their time there rather than on the prompt.

## 8. Ship it to an agent

- [GraphRAG MCP server trial: one sourced answer](/blog/graphrag-mcp-trial) — the same retrieval exposed over MCP, returning the source excerpt with every answer, plus a hosted trial you can apply for.

An agent that receives an answer without evidence will assert it. Returning the excerpt is the design decision that makes the MCP surface usable rather than decorative.

## A worked case end to end

- [PDF to knowledge graph, with page anchors](/blog/annual-report-anchored-claims) — PDF blocks keep their page and bounding box, entities and claims land in PostgreSQL, retrieval walks the graph, and every fact in the finished brief either hits the PDF text layer or fails the build.

If you only read one article on this blog to judge whether the approach is useful, read that one. It is the pipeline pointed at a real document type with a verification step at the end.

## Before you build any of it

- [GraphRAG vs RAG: the difference is the question, not the accuracy](/blog/graphrag-vs-rag-the-difference-is-the-question) — what each pipeline builds, what it costs (12m 19s to index five chapters, 22.5s per query in this implementation's own benchmark), the question shapes each one wins, and the 30-minute test that settles the choice on your corpus.

## One decision that runs through all of it

- [Entity resolution in GraphRAG: the write-time job and the read-time job](/blog/entity-resolution-in-graphrag-the-write-time-job-and-the-read-time-job) — the two places identity gets decided (the `UNIQUE (namespace, name)` upsert at build time, the exact → alias → fuzzy → semantic ladder at query time), why tolerance belongs on the query side, and the alias table this implementation still owes you.

## What this series does not cover

- No benchmark comparison against naive vector RAG. The case article above shows a verification result on one document class; it is not an evaluation across corpora, and this blog has not run one.
- Single-node PostgreSQL only. Nothing here is about sharding the graph or running the pipeline across several writers.
- The Python implementations (Microsoft's and others) are referenced where the concepts overlap, but the code is TypeScript throughout.

## Where it runs

- [graphrag-ts on GitHub](https://github.com/sadofriod/graphrag-ts) — the implementation every article is based on.
- [Retrieval engineering](https://ashesborn.cloud/services/retrieval-engineering) on the company site — the engagement side, if you want this built rather than read.
- [The HSK 3.0 migration map](https://hsk.ashesborn.cloud/) — a published dataset page, useful as an example of how far the output layer can be pushed.
