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

Entity resolution decides when mentions refer to the same thing. A GraphRAG system makes that decision during graph construction and again when it interprets a query. The first choice shapes stored graph state and can require a rebuild to correct. The second affects which evidence a single query retrieves. The [graphrag-ts](https://github.com/sadofriod/graphrag-ts) implementation shows how these jobs use different rules, and where its current design leaves a gap.

## Identity at graph construction

An extraction pass returns strings. “pgvector,” “pgvector extension,” and “PGVector” may refer to one product; “Michael Jordan” the basketball player and “Michael Jordan” the statistician are two people who share a name. Write-time resolution decides which strings collapse into a node before the graph is built.

In this codebase, the write-time policy is exact string equality inside a namespace. A normalised name and unique constraint provide a simple key that remains deterministic across rebuilds:

```sql
CREATE TABLE rag_entities (
  id         uuid PRIMARY KEY,
  namespace  text NOT NULL,
  name       varchar(200) NOT NULL,
  description text,
  UNIQUE (namespace, name)
);
```

The insert path uses an upsert keyed on `(namespace, name)` and explicitly handles a unique-violation race:

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

That rule avoids merging two distinct names into one node, while leaving near-duplicates separate. “HNSW index” and “HNSW” can become two nodes with separate edges, so the graph under-counts the topic. The extraction prompt asks for “clear nouns, proper nouns, algorithm names, or component names,” yet it does not require one spelling; variants can arrive. The `namespace` field isolates corpora from each other. It does not establish that two names represent the same entity.

If the write path needs more resolution, the proposed sequence is to normalise case, whitespace, and punctuation, then use an alias table that a person curates. A cheap rule can surface candidate pairs with the same normalised form or edit distance under a small threshold; an LLM can adjudicate those candidates once, with its decision stored for later builds. Persisting the decision keeps a rebuild from silently choosing identity again. There is no fuzzy merge, embedding clustering, or LLM adjudication at ingest time in the current codebase.

## Matching query mentions

A query arrives as a sentence and may use a surface form absent from storage. Read-time resolution asks which existing nodes the query mentions. A wrong match can add irrelevant evidence to one retrieval, while the graph itself remains unchanged.

In `entityMatcher.ts`, the matching ladder applies its cheaper rules first:

| Step | Rule | Score |
|---|---|---|
| exact | the normalised query contains the entity name | 1.0 |
| alias | the query contains a known alias, mapped to its entity | high |
| fuzzy | string similarity above `FUZZY_THRESHOLD = 0.4` | proportional |
| semantic | embedding cosine similarity above `SEMANTIC_THRESHOLD = 0.7` | proportional |

The four result lists are fused with Reciprocal Rank Fusion. Their raw scores are not calibrated against one another: a fuzzy score of 0.6 and a cosine of 0.6 mean different things, while their ranks can be compared. Recall also depends on match type. High-confidence intent entities and exact or alias matches come before query keywords; fuzzy and semantic matches fill the tail, as shown in `keywordSearch.ts`.

`EntityAlias` is available at retrieval time as `{ entityId, alias }`, and the matcher consumes the list supplied by its caller. The codebase has no persisted alias table. “MSFT” therefore matches “Microsoft” only when the caller provides that mapping. Adding persistence is a schema change. Thresholds also depend on language and corpus: 0.4 on a short-string similarity metric is aggressive for three-character Chinese names and conservative for long English product names. Both values are defaults to re-measure for the data in use.

## Measure the different failure costs

When an ingestion run merges distinct entities at write time, the decision is permanent and silent. The GraphRAG summariser can then produce wrong communities, and each downstream summary can inherit the error. When a developer changes an identity rule, the developer has to rebuild the graph before the corrected decision reaches its communities and summaries. When the read-time matcher makes a false match, it adds an irrelevant chunk to one answer; the next query is unaffected. That difference makes the two jobs call for separate measurements.

For write-time quality, inspect a sample of nodes and count how many distinct real-world entities were collapsed into one node, with a target of zero, and how many nodes represent one real entity, with a low target. The first count catches over-merging; the second catches repeated nodes for one entity. A database uniqueness check cannot answer either question by itself, because it only tests the stored key. There is no automatic ground truth for those counts, so the sample requires manual review. For read-time quality, measure recall@k on queries that use a different surface form and the false-match rate when a user names something absent from the graph. The shipped thresholds are implementation defaults, and no benchmark here shows that they outperform an alternative.

Cross-document coreference, such as resolving “the company” to a particular company, is outside both jobs. It requires the surrounding document as well as the entity table. Namespace isolation also does not make two graphs comparable; merging corpora still requires an explicit decision about which names are shared.

## Make identity decisions durable

The first addition I would make is a persisted alias table with `entity_id`, `alias`, `source`, and `confidence`, written by the ingest path and by read-time misses. Every unmatched query mention of a known entity is a free training label. I would also add candidate adjudication for pairs with matching normalised forms or edit distance under a small bound: ask a model once for each pair and store its verdict. Embedding clustering over the full entity set can over-merge and leaves decisions difficult to review.

Finally, I would make rebuilds read identity decisions from the table instead of recomputing them from the current extraction prompt. Otherwise, a prompt change can silently reshape the graph's history. The entity matching thresholds have no benchmark reported here, and identity across corpora still needs an explicit policy. The related GraphRAG comparison reports 12 min 19 s indexing, 22.5 s average query latency through `query_graph`, 10/12 strict hits, and 95.8% combined lexical recall. The implementation work is covered by [retrieval engineering](https://ashesborn.cloud/services/retrieval-engineering), with the rest of the pipeline in [the GraphRAG-in-TypeScript series](/blog/graphrag-in-typescript-the-series-index).
