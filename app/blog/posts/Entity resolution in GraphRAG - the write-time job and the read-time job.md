---
title: 'Entity resolution in GraphRAG: the write-time job and the read-time job'
date: '2026-11-18'
excerpt: 'Two different problems get called entity resolution in a knowledge-graph RAG stack: deciding at build time that two mentions are the same node, and deciding at query time that a user meant a node you already have. They need different tools, different tolerances and different failure costs.'
description: 'A practical guide to entity resolution in GraphRAG: write-time identity (normalisation, unique keys, alias adjudication) versus read-time matching (exact, alias, fuzzy, semantic, RRF), with the thresholds and schema choices graphrag-ts actually uses, and the failure modes each one leaves behind.'
tags: ['GraphRAG', 'Entity Resolution', 'Knowledge Graph', 'TypeScript', 'PostgreSQL', 'Retrieval']
categories: GraphRAG
keywords: 'entity resolution, entity resolution graphrag, entity resolution knowledge graph, identity resolution graph, graphrag deduplication, knowledge graph entity matching, graphrag typescript'
lang: en
translationKey: entity-resolution-graphrag
---

**Entity resolution is deciding when two mentions refer to one thing.** In a GraphRAG pipeline that decision happens in two places that look similar and are not: while you build the graph, where the choice is permanent, and while you answer a query, where the choice is cheap to get wrong. Most write-ups treat them as one problem and then pick a tool that is wrong for one half of it.

This is what the two jobs actually cost, using the implementation in [graphrag-ts](https://github.com/sadofriod/graphrag-ts) as the worked example — including the part it does not solve yet.

## The short version

- **Write-time**: decide identity once, with a key. Deterministic, cheap, and it decides the shape of the graph. Fixing a mistake here means re-running a build.
- **Read-time**: decide whether the query mentions a node you already have, with a matching ladder. Tolerant, throw-away, and it decides whether the right evidence is recalled.
- Do the first with the smallest rule that cannot merge two different things, and put the expensive judgement in the second, where a mistake costs an answer rather than a graph.

## Job 1: write-time identity

Every extraction pass hands you strings. "pgvector", "pgvector extension", "PGVector" are one product; "Michael Jordan" the basketball player and "Michael Jordan" the statistician are two people with the same string. Write-time resolution is the choice of which of those you collapse before they become nodes.

The cheapest version — the one that survives a rebuild without human review — is a normalised name plus a unique constraint:

```sql
CREATE TABLE rag_entities (
  id         uuid PRIMARY KEY,
  namespace  text NOT NULL,
  name       varchar(200) NOT NULL,
  description text,
  UNIQUE (namespace, name)
);
```

The insert path is then an upsert keyed on `(namespace, name)`, with the unique-violation race guarded explicitly:

```ts
const upsertRagEntity = async (namespace: string, name: string, description?: string) => {
  const where = { namespace_name: { namespace, name } };
  try {
    return await prismaClient.rAGEntity.upsert({ where, update: { description }, create: { namespace, name, description } });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const existing = await prismaClient.rAGEntity.findUnique({ where, select: { id: true } });
      if (existing) return existing;
    }
    throw error;
  }
};
```

That is the whole write-time policy in this codebase: **exact string equality inside a namespace**. No fuzzy merge, no embedding clustering, no LLM adjudication at ingest time. Three consequences worth stating plainly:

- **It never merges two different things.** Over-merging is the expensive error, and a `UNIQUE` constraint cannot make it.
- **It splits near-duplicates.** "HNSW index" and "HNSW" become two nodes, each with its own edges, and the graph under-counts the topic. The extraction prompt asks for "clear nouns, proper nouns, algorithm names, or component names" but nothing forces one spelling, so variants do arrive.
- **`namespace` is isolation, not resolution.** It keeps two corpora from contaminating each other; it does not tell you that two names are the same entity.

If you need more at write time, the order that keeps risk low is: normalise (case, whitespace, punctuation) → an alias table you curate → adjudicate only the candidate pairs a cheap rule surfaced (same normalised form, or edit distance under a small threshold) with an LLM call whose answer is stored, not re-derived. The point of storing the decision is that a rebuild must not silently re-decide identity.

## Job 2: read-time matching

A query arrives as a sentence. Nothing guarantees it contains the exact string you stored. Read-time resolution asks a narrower question — *which existing nodes does this query mention?* — where a wrong answer costs one retrieval, not the graph.

The ladder in `entityMatcher.ts` runs cheapest first:

| Step | Rule | Score |
|---|---|---|
| exact | the normalised query contains the entity name | 1.0 |
| alias | the query contains a known alias, mapped to its entity | high |
| fuzzy | string similarity above `FUZZY_THRESHOLD = 0.4` | proportional |
| semantic | embedding cosine similarity above `SEMANTIC_THRESHOLD = 0.7` | proportional |

The four lists are fused with Reciprocal Rank Fusion rather than by score, because the four signals are not calibrated against each other: a fuzzy score of 0.6 and a cosine of 0.6 mean different things, but their *ranks* are comparable. Recall then leans on the match type — high-confidence intent entities and exact/alias matches go in ahead of query keywords, and fuzzy/semantic matches fill the tail (`keywordSearch.ts`).

Two design notes that matter more than the thresholds:

- **Aliases are an input, not a table.** `EntityAlias` exists at retrieval time (`{ entityId, alias }`), and the matcher consumes whatever list you pass. In this codebase there is no persisted alias table, so "MSFT" only matches "Microsoft" if the caller supplies that mapping. That is the clearest gap in the current design, and it is a schema addition, not a model problem.
- **The thresholds are per-language and per-corpus.** 0.4 on a short-string similarity metric is aggressive on three-character Chinese names and conservative on long English product names. Treat both numbers as defaults to re-measure, not constants.

## Why tolerance belongs at read time

Write-time merging is permanent and silent: a rebuilt graph with a wrong merge produces confidently wrong communities, and every summary downstream inherits it. Read-time matching is reversible: a false match adds an irrelevant chunk to one answer, and the next query is unaffected.

That asymmetry is the whole argument for keeping write-time rules dumb and putting judgement where it is cheap. It also means the two jobs need different metrics:

- write-time: **how many distinct real-world entities did I collapse into one node?** (target: zero) and **how many nodes share one real entity?** (target: low, measured on a sample)
- read-time: **recall@k on queries that use a different surface form**, and the false-match rate when a user names something you do not have

Measuring the first requires reading nodes by hand; there is no automatic ground truth. That is exactly why the expensive machinery belongs on the second.

## What I would add, in order

1. **A persisted alias table** (`entity_id`, `alias`, `source`, `confidence`) written by the ingest path and by read-time misses. Every unmatched query mention of a known entity is a free training label.
2. **Candidate adjudication, not clustering.** Take pairs whose normalised forms match or whose edit distance is under a small bound, ask a model once per pair, store the verdict. Embedding clustering over the whole entity set is the version that over-merges and cannot be reviewed.
3. **A rebuild guarantee**: identity decisions are read from the table, never recomputed from the current extraction prompt. Otherwise a prompt tweak silently reshapes history.

## What this does not solve

- No benchmark is reported here. The numbers above are the thresholds this implementation ships with, not evidence that they beat an alternative.
- Cross-document coreference ("the company" → which company) is out of scope for both jobs: it needs the surrounding document, not the entity table.
- Namespace isolation does not make two graphs comparable; merging two corpora still requires an explicit decision about which names are shared.

If you are building this and would rather not rebuild it, that is the kind of work [retrieval engineering](https://ashesborn.cloud/services/retrieval-engineering) covers; the rest of the pipeline is written up in [the GraphRAG-in-TypeScript series](/blog/graphrag-in-typescript-the-series-index).
