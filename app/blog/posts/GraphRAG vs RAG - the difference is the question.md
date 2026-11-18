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

**Vector RAG retrieves the passages most similar to the question. GraphRAG retrieves entities and relationships, then answers from the connections between them.** The first is better for "what does this document say about X". The second is what you need for "how is X connected to Y" and "what does the whole corpus say", and it costs an extraction pass, a graph, and latency to get there.

Most comparisons stop at accuracy. This one starts with what each pipeline builds, then what it costs, then which questions each one can answer at all — because in practice the choice is made on question shape, not on a points difference.

## The two pipelines, side by side

| | Vector RAG | GraphRAG |
|---|---|---|
| Build | chunk → embed → store vectors | chunk → LLM extracts entities, relationships, claims → graph + communities + summaries |
| Retrieve | top-k by vector similarity (often + keyword BM25) | entity/topology recall → hybrid vector/keyword/graph → community scoring → optional Map-Reduce over summaries |
| Answer unit | a passage | a claim with its source, plus the entities it connects |
| Fails when | the answer is spread across documents, or needs a hop | the corpus has no entity structure worth extracting (see the cost section) |
| Cost profile | one embedding pass, cheap to rebuild | extraction tokens at build time, longer builds, slower queries |

The important line is "answer unit". A vector chunk tells you what a passage says; it does not tell you *which entity the passage is about* in a way you can filter, group or walk. That is the whole difference, and everything else follows from it.

## What it actually costs

From the [graphrag-ts MCP benchmark](https://github.com/sadofriod/graphrag-ts/blob/main/examples/output/final-benchmark-report.en.md), a five-chapter corpus (Alice chapters I and VII, Frankenstein chapters 5, 12, 13), Docker Compose with PostgreSQL/pgvector, DeepSeek for slicing and judging, a 768-dimension local embedding model:

- **Indexing: about 12 min 19 s** for those five sections.
- **Query latency: 22.5 s average** through the MCP `query_graph` tool.
- Per-section graph size: 83–90 child chunks, 45–58 claims, 21–41 edges per section.

A vector-only index over the same five chapters is an embedding batch measured in seconds, and a query is one ANN lookup plus an LLM call. So the honest summary is: GraphRAG buys you a different class of answer, and you pay for it in build time, query latency, and extraction tokens on every rebuild.

If your product needs sub-second answers or you re-index hourly, that latency is a design constraint, not a detail. It is also the reason incremental builds matter: re-extracting the whole corpus on every edit is where GraphRAG projects die. The write-up for that is [GraphRAG incremental build in TypeScript](/blog/graphrag-incremental-build-in-typescript-diffing-updates-and-pruning).

## Where GraphRAG wins

**1. Multi-hop questions.** "Which suppliers of the company that was acquired in 2023 also appear in the 2024 filing?" A vector index returns passages containing each of those words; the join happens in your prompt, if it happens at all. A graph performs the join as a traversal, and the evidence for each hop stays attached.

**2. Corpus-level questions.** "What are the main risks discussed across these 40 documents?" Vector top-k can only return k passages out of 40 documents, so the answer is a sample. GraphRAG's community summaries exist to answer exactly this: map over summaries, reduce into one answer. In the same benchmark, the two cross-community Map-Reduce queries scored 100% map entity/phrase recall, with final reduce recall of 80% and 100% on the two runs.

**3. Evidence you can audit.** In the benchmark, the in-corpus run reached **10/12 strict hits** and **95.8% combined lexical recall** over 12 questions, and every returned result carries the source excerpt it came from. If the product promise is "every claim points at its page", the graph is not decorative — it is how you know which claim belongs to which document.

## Where vector RAG wins

- **Single-fact lookups**: "what is the refund window" — one chunk is the answer, the graph adds a hop and nothing else.
- **Short documents with little entity structure**: FAQ pages, product manuals, release notes. Extraction produces a thin graph and you paid for it.
- **Latency-sensitive UX** (autocomplete, chat that must feel instant): 22 s is not a candidate.
- **Corpora that change constantly**: unless you have incremental builds working, every edit re-runs extraction.
- **When you cannot afford a rebuild**: vector indexes are disposable; a graph is state you now have to keep correct, including its entity resolution (see [the write-time and read-time job](/blog/entity-resolution-in-graphrag-the-write-time-job-and-the-read-time-job)).

## The decision table I actually use

| Question you need to answer | Start with |
|---|---|
| "What does this document say about X?" | vector RAG |
| "Find the passage that mentions X" | vector RAG (+ keyword) |
| "How is X connected to Y in this corpus?" | GraphRAG |
| "What are the main themes across all documents?" | GraphRAG (community summaries / Map-Reduce) |
| "Answer with the exact page each claim came from" | GraphRAG, claims with anchors |
| "Answer in under a second" | vector RAG |
| "We re-index every hour" | vector RAG until incremental builds are proven |

A hybrid is legitimate and often correct: graph for recall and evidence assembly, vector for the first-pass similarity filter. That is what the pipeline in this blog does — entity and topology recall first, hybrid vector/keyword evidence second, RRF to fuse the ranks.

## What I am not claiming

I have **not** run the same 12 questions through a vector-only stack, so I will not quote a points difference between the two. The benchmark numbers above describe how one GraphRAG implementation behaves on one small corpus, with lexical entity and ordered-phrase matching as the recall measure — not human semantic grading, and not a cross-project comparison. Anyone quoting a single accuracy gap between "RAG" and "GraphRAG" across corpora is quoting a corpus, a judge, and a prompt.

What the numbers do support: the latency and build costs are real, the corpus-level and multi-hop shapes are the ones graph retrieval is built for, and evidence assembly is a property you get from the data model rather than from the prompt.

## The 30-minute test

Before committing a rebuild pipeline, do this on your own corpus:

1. Write **20 questions** and split them by shape: 8 single-fact lookups, 6 multi-hop, 6 corpus-level.
2. Answer them with your current vector RAG and record: hit / partial / miss, and whether the returned evidence actually contains the claim.
3. Index the same corpus with a graph pipeline and run the same 20.
4. Compare **per shape**, not overall. A single overall number hides the only thing that matters here: vector RAG will win the single-fact block, and that is fine.
5. Decide on the block that carries your product's value. If that block is multi-hop or corpus-level, the build and latency costs are the price of the feature, not an inefficiency.

If you would rather have this built and measured than run it yourself, that is [retrieval engineering](https://ashesborn.cloud/services/retrieval-engineering); the implementation, in order, is [the GraphRAG-in-TypeScript series](/blog/graphrag-in-typescript-the-series-index).
