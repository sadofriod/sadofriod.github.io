---
title: GraphRAG Global Map-Reduce Query Implementation
tags: [GraphRAG, Graph RAG, AI, Knowledge Graph, Global Search, Map-Reduce, TypeScript]
p: graphrag
categories: AI
description: 'A code-level walkthrough of Global Map-Reduce in graphrag-ts: loading community summaries and descendant-leaf claims, approximate token batching, bounded concurrent Map calls, retries, JSON validation, and usefulness-ranked Reduce packing.'
description_en: 'A code-level walkthrough of Global Map-Reduce in graphrag-ts: loading community summaries and descendant-leaf claims, approximate token batching, bounded concurrent Map calls, retries, JSON validation, and usefulness-ranked Reduce packing.'
date: 2026-10-14 13:30:00
mathjax: true
keywords: GraphRAG Global Map-Reduce token budget implementation, graphrag-ts community summary claims Map input, GraphRAG summaryBatcher oversized Unicode splitting, GraphRAG bounded concurrency Map retries, GraphRAG usefulness score JSON validation, GraphRAG Reduce skip over-budget answers, TypeScript global retrieval partial failures
---

# GraphRAG Global Map-Reduce Query Implementation

> Repository: [sadofriod/graphrag-ts](https://github.com/sadofriod/graphrag-ts) · npm package: [@ashes_born/graph-rag-ts](https://www.npmjs.com/package/@ashes_born/graph-rag-ts)

The existing global-search article explains why GraphRAG applies Map-Reduce to community summaries. This companion follows [`retrieveGlobal`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalSearch.ts) in `graphrag-ts`: how it prepares input, bounds model calls, handles failures, and assembles the final context.

## 1. The Query Entry Resolves Level and Budgets

[`retrieveGlobal`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalSearch.ts) trims the query and rejects an empty one. The community level defaults to `leaf`, or can be set to a non-negative integer. Budgets and concurrency come from request options, [`retrieval defaults`](https://github.com/sadofriod/graphrag-ts/blob/main/src/config/defaults.ts), or fallback defaults. The repository defaults are 8,000 tokens for each of Map and Reduce, output reserves of 512 and 1,024 respectively, and Map concurrency of four.

The prompt-input budgets subtract their output reserves:

$$
MapPromptBudget = MapTokenBudget - MapOutputReserve
$$

$$
ReducePromptBudget = ReduceTokenBudget - ReduceOutputReserve
$$

Budgets must remain positive; budgets and concurrency must be positive integers, while output reserves may be zero. The Map and Reduce prompt skeletons count against their respective budgets, not just the summaries or intermediate answers.

## 2. Global Map Input Includes Summaries, Claims, and Source Excerpts

The implementation loads community summaries in the current namespace. It identifies `leaf` summaries as rows whose IDs are not referenced as another summary's parent. For a numeric level, it loads every non-empty summary at that level.

For each selected summary, the code walks the `parentCommunityId` links to find descendant leaf communities, then loads claims assigned to those leaves. Map text consists of:

- `[Community summary]`: the selected community's summary;
- `[Supporting claims]`: leaf-level claims with subject, optional object, and description;
- `[Source excerpts]`: deduplicated source child-chunk text linked to those claims.

Higher-level summaries can therefore carry leaf-level facts and provenance cues from the communities they cover. This increases input size, so all of it must be budgeted before batching.

## 3. Batching: Shuffle, Then Greedily Pack to the Prompt Budget

[`buildSummaryBatches`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.ts) shuffles summaries by default with Fisher-Yates. It splits each summary into Unicode code-point sequences. For oversized summaries, binary search finds the largest character segment that fits the Map prompt budget; every segment receives a community ID and part number. The segments are then greedily appended in shuffled order. When the next segment does not fit, the current batch is flushed and a new one begins.

Token counting uses [`estimateTokens`](https://github.com/sadofriod/graphrag-ts/blob/main/src/build/detectCommunity/summary/estimateTokens.ts), a lightweight estimate: roughly one token per 1.8 CJK characters or per 4 ASCII characters, rather than a model-specific tokenizer. The prompt skeleton and segment headers count toward the estimate. This is inexpensive and testable, but it can drift for code, mixed-language text, or special tokens. Leave headroom and monitor real model requests in production.

An undersized budget fails before model calls: the builder throws if even the prompt skeleton does not fit, or if an individual summary part cannot fit into an otherwise empty batch. Parts carry source IDs so Map answers can retain the corresponding community set.

## 4. Map Execution: Bounded Workers, Two Attempts, Structured Validation

[`runGlobalMap`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.ts) starts at most `min(concurrency, batchCount)` workers. Workers claim batches through a shared next-index counter, avoiding an unbounded burst of requests for every batch at once. Results are stored at their original batch positions.

Each batch gets at most two attempts: the initial call and one retry. The model must return JSON containing a string `answer` and a finite numeric `usefulness` from 0 to 100. An empty answer is accepted only when usefulness is zero. Both invocation failures and parse/validation failures enter the retry path.

If every batch fails after retry, Map throws an `AggregateError`. If some batches succeed and others fail, successful answers and errors are returned so the caller can report a partial result. Each answer retains the batch's `communityIds` for logging and provenance.

## 5. Reduce Selection Is Not Simple Truncation

[`selectGlobalReduceAnswers`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalReduce.ts) removes answers with usefulness zero, sorts the rest by descending score, and keeps original order for ties. Each candidate is formatted with its usefulness score, community IDs, and intermediate answer, then tested against the remaining Reduce prompt budget:

```text
for answer in usefulness_descending:
    if tokenCount(promptSkeleton + selected + answer) <= reduceBudget:
        selected.append(answer)
```

An answer that does not fit is skipped; the loop does not break. A later, shorter answer can still be selected. If there are no positive-scoring answers, or none fit, the query returns `no_results`. The final Reduce response is also validated as JSON and must contain a non-empty `answer` field.

Usefulness is a relevance-ranking signal for an intermediate answer, not a probability of factual correctness. Because the Reduce input retains community IDs, an application can trace claims back to summaries, claims, and source chunks for verification.

## 6. Status and Observability

Typical global retrieval outcomes include:

| Condition | Outcome |
|:---|:---|
| No usable summaries, no positive Map answers, or no answer fits Reduce | `no_results` |
| Some Map batches fail, but successful answers reach final Reduce | `partial` |
| Map batches succeed and Reduce generates an answer | `completed` |
| Every Map batch fails after retry | Throws an aggregate error |

The implementation logs the community level, summary count, Map batch count, community IDs per batch, Map scores, failed batch count, selected answer count, and estimated Reduce prompt tokens. These signals help distinguish insufficient summary input from invalid Map output, partial model failure, and an overly tight Reduce budget.

Key modules are [`globalSearch.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalSearch.ts), [`summaryBatcher.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.ts), [`globalMap.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.ts), [`globalReduce.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalReduce.ts), and [`estimateTokens.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/build/detectCommunity/summary/estimateTokens.ts). Tests cover oversized-summary splitting, budget errors, Map concurrency and retry, score validation, and continuing past an oversized Reduce answer to consider shorter candidates: [`summaryBatcher.test.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/summaryBatcher.test.ts), [`globalMap.test.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalMap.test.ts), and [`globalReduce.test.ts`](https://github.com/sadofriod/graphrag-ts/blob/main/src/retrieval/global/globalReduce.test.ts).