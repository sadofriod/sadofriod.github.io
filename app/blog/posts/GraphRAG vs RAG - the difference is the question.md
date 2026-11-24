---
title: 'GraphRAG vs RAG: the difference is the question, not the accuracy'
date: '2026-11-18'
excerpt: 'Vector RAG answers "what does this passage say"; GraphRAG answers "how are these things connected" and "what does the corpus say overall". The costs are real — in my own run, indexing five chapters took 12 minutes and a query took 22 seconds — so the choice should be made on question shape and evidence needs, not on a benchmark leaderboard.'
description: 'A practical comparison of GraphRAG and vector RAG: what each pipeline actually builds, what it costs (indexing time, query latency, extraction tokens), which question shapes each one wins, and the 30-minute test that settles it on your own corpus. Numbers quoted are from the graphrag-ts MCP benchmark, with its limits stated.'
tags: ['GraphRAG', 'RAG', 'Retrieval', 'TypeScript', 'PostgreSQL', 'Architecture']
categories: GraphRAG
keywords: 'graphrag vs rag, graph rag vs rag, graphrag vs naive rag, graphrag vs vector rag, when to use graphrag, graph rag comparison, rag architecture choice'
lang: en
translationKey: graphrag-vs-rag
---

Vector RAG gives you passages whose wording resembles the question. GraphRAG builds entities and relationships from the corpus, then uses those connections to assemble an answer. For “what does this document say about X,” a passage may be enough. For “how is X connected to Y” or “what does the whole corpus say,” the graph provides a different retrieval unit. That difference comes with an extraction pass, a graph to maintain, and extra query latency.

## Start with the answer unit

The two pipelines make different things available to the answering step:

| | Vector RAG | GraphRAG |
|---|---|---|
| Build | chunk → embed → store vectors | chunk → LLM extracts entities, relationships, claims → graph + communities + summaries |
| Retrieve | top-k by vector similarity (often + keyword BM25) | entity/topology recall → hybrid vector/keyword/graph → community scoring → optional Map-Reduce over summaries |
| Answer unit | a passage | a claim with its source, plus the entities it connects |
| Fails when | vector retrieval cannot connect evidence spread across documents or requiring a hop | GraphRAG has little value when the corpus has no entity structure worth extracting |
| Cost profile | one embedding pass, cheap to rebuild | extraction tokens at build time, longer builds, slower queries |

A vector chunk tells you what a passage says. It does not identify which entity that passage concerns in a form you can filter, group, or traverse. GraphRAG makes that relationship explicit, so the answer can follow links across passages and keep evidence attached to each step. For a question that needs one fact from one chunk, those connections may add work without improving the answer.

## The cost in one run

The [graphrag-ts MCP benchmark](https://github.com/sadofriod/graphrag-ts/blob/main/examples/output/final-benchmark-report.en.md) used a five-chapter corpus: Alice chapters I and VII, and Frankenstein chapters 5, 12, 13. It ran with Docker Compose and PostgreSQL/pgvector, DeepSeek for slicing and judging, and a 768-dimension local embedding model. Indexing those sections took 12 min 19 s. Average query latency through the MCP `query_graph` tool was 22.5 s / 22,513 ms. Each section produced 83-90 child chunks, 45-58 claims, and 21-41 edges.

I recorded 10/12 strict hits, or 83.3%, and 95.8% combined lexical recall over 12 questions in the in-corpus run. Every returned result carries the source excerpt it came from. These results describe one GraphRAG implementation on one small corpus. I did not run the same 12 questions through a vector-only stack, so this run cannot establish an accuracy gap between the approaches. Its recall measure is lexical entity and ordered-phrase matching; human semantic grading and cross-project comparison were not part of this benchmark.

In the same benchmark, two cross-community Map-Reduce queries reached 100% map entity/phrase recall. Their final reduce recall was 80% and 100%. Those numbers illustrate how the community summaries support corpus-level questions; they do not establish how another corpus or judge would score. A vector top-k result from 40 documents is still a selection of k passages, while GraphRAG can map over summaries and reduce the results into one answer to “What are the main risks discussed across these 40 documents?”

The same tradeoff appears in multi-hop questions. “Which suppliers of the company that was acquired in 2023 also appear in the 2024 filing?” asks the system to connect entities and evidence from different passages. A vector index may retrieve passages containing the relevant words, while the join then has to happen in the prompt. A graph performs that join as a traversal, with evidence for each hop attached. If the product needs every claim tied to its source page, that evidence assembly is a property of the data model. The related entity-resolution implementation uses `upsertRagEntity` for writes, and the read-time matcher applies `FUZZY_THRESHOLD = 0.4` and `SEMANTIC_THRESHOLD = 0.7`; `EntityAlias` is an input to that matching step.

A vector-only index over the same five chapters is an embedding batch measured in seconds, and a query is one ANN lookup plus an LLM call. GraphRAG therefore carries real build-time extraction tokens, longer builds, and slower queries on every rebuild. When a product needs sub-second answers or the corpus is re-indexed hourly, that latency constrains the design. Incremental builds matter because re-extracting the whole corpus on every edit is where GraphRAG projects die; [GraphRAG incremental build in TypeScript](/blog/graphrag-incremental-build-in-typescript-diffing-updates-and-pruning) describes that work.

## Match the retrieval to the question

Single-fact lookups such as “what is the refund window” usually need one chunk; the graph adds a hop without adding useful evidence. FAQ pages, product manuals, and release notes may contain too little entity structure to justify extraction, leaving a thin graph. Autocomplete and chat that must feel instant have a different latency requirement from a query taking 22 s. For corpora that change constantly, each edit reruns extraction unless incremental builds are working. A vector index can be discarded and rebuilt more simply; graph state also has to keep its entity resolution correct. The [write-time and read-time job](/blog/entity-resolution-in-graphrag-the-write-time-job-and-the-read-time-job) explains that part.

For “What does this document say about X?” or “Find the passage that mentions X,” start with vector RAG, adding keyword search when useful. For “How is X connected to Y in this corpus?” and “What are the main themes across all documents?”, GraphRAG can use its graph and community summaries with Map-Reduce. If each claim needs the exact page it came from, claims with anchors make GraphRAG a fit. If the requirement is an answer in under a second or re-indexing every hour before incremental builds are proven, vector RAG is the practical starting point.

A hybrid can combine graph recall and evidence assembly with vector similarity as the first-pass filter. The pipeline described in this blog uses entity and topology recall first, hybrid vector/keyword evidence second, and RRF to fuse the ranks.

## Test against your corpus

Before committing to a rebuild pipeline, spend 30 minutes writing 20 questions from your own corpus: 8 single-fact lookups, 6 multi-hop questions, and 6 corpus-level questions. Run them through the current vector RAG and record hit, partial, or miss, along with whether the returned evidence contains the claim. Index the same corpus with a graph pipeline, then run those same 20 questions. Compare the results per shape, since an overall score can hide the single-fact advantage vector RAG may have while obscuring gains on multi-hop or corpus-level questions. Choose according to the question block that carries the product’s value; if that block needs multi-hop or corpus-level retrieval, the build and latency costs buy that capability. The implementation is covered by [retrieval engineering](https://ashesborn.cloud/services/retrieval-engineering), with the pipeline steps in [the GraphRAG-in-TypeScript series](/blog/graphrag-in-typescript-the-series-index).
