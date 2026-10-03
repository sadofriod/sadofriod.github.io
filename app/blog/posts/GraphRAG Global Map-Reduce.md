---
title: GraphRAG Global Search Map-Reduce Explained
tags: [GraphRAG, Graph RAG, AI, Knowledge Graph, Global Search, Map-Reduce]
p: graphrag
categories: AI
description: A detailed guide to Microsoft GraphRAG global search Map-Reduce, explaining how hierarchical community summaries are shuffled and split by token budget, mapped into scored intermediate answers, ranked, and reduced into a corpus-level response.
date: 2026-10-03 12:00:00
mathjax: true
keywords: GraphRAG global search MapReduce explained, Microsoft GraphRAG community summary map reduce, GraphRAG parallel map stage intermediate answers, GraphRAG reduce stage usefulness ranking, GraphRAG token budget context window, GraphRAG global answer generation from community summaries, GraphRAG global search vs local search, Graph RAG query-focused summarization, GraphRAG Map-Reduce TypeScript pseudocode, LLM map reduce summarization pipeline
---

# GraphRAG Global Search Map-Reduce

> Based on *From Local to Global: A GraphRAG Approach to Query-Focused Summarization*, with a focus on §§3.1.5–3.1.6. See the [original paper](./2404.16130v2.pdf) and [Chinese translation](./2404.16130v2_zh.md).

## 1. In a Nutshell

GraphRAG global search first sends batches of **community summaries** from a selected hierarchy level to an LLM. Each batch independently produces an intermediate answer relevant to the query and a usefulness score (Map). The system then filters and ranks those answers, packs them into a limited context, and asks an LLM to synthesize the final corpus-level response (Reduce).

This addresses a central constraint: a corpus and its community summaries can easily exceed a single LLM call's context window, while global questions require synthesis across multiple topics rather than retrieval of just one highly similar passage.

## 2. Where It Fits in the GraphRAG Pipeline

The paper describes two related but distinct stages:

```text
Indexing
Documents -> entities/relationships/claims -> knowledge graph -> hierarchical communities -> community summaries

Query-time global search
Query + summaries from one community level
  -> Map: generate community answers and usefulness scores per batch
  -> Reduce: select answers by score and synthesize a global response
```

Map operates on community summaries already produced during indexing, not on raw documents or a small set of text chunks retrieved at query time. The paper supports global answer generation over a chosen community level; different levels provide different scopes and degrees of detail.

Indexing also generates community summaries from the leaves upward: leaf summaries are based on graph elements, while higher-level summaries can prioritize child-community summaries to fit within the context window. This hierarchical construction of community summaries is adjacent to, but distinct from, query-time Map-Reduce over those summaries.

## 3. Map: Parallel Analysis of Community Summary Batches

### 3.1 Prepare the Input

Shuffle the summaries at the selected level, then split them into context batches under a predefined token limit:

```text
S = shuffle(community summaries at the selected level)
B1, B2, ... Bn = splitByTokenLimit(S, mapContextLimit)
```

Shuffling helps distribute related information across batches instead of concentrating it in just a few, where context limits could prevent it from contributing to the final synthesis. Batches should be sized by token count rather than character count because model capacity is measured in tokens.

### 3.2 Generate a Result for Each Batch

Call the LLM independently for each batch, asking it to use the target query and that batch's community summaries to:

1. Generate an intermediate answer.
2. Score how useful that answer is for addressing the query, on a 0–100 scale.

```text
map(query, Bi) -> { answer: Ai, usefulness: Ui }
```

If a batch contains no relevant information, the model can return a usefulness score of 0. The paper's process discards zero-scored results and passes the rest to Reduce.

**The key idea:** Each call handles only a bounded set of summaries, so calls can run in parallel and the model does not need to read the entire knowledge base at once. Map turns a large collection of summaries into smaller, query-focused candidate answers.

## 4. Reduce: Rank by Usefulness and Fit the Context Budget

Sort the retained Map answers by usefulness in descending order, then add them to a new context in sequence until the token budget for final answer generation is reached:

```text
answers = sortDescending(filter(score > 0, mappedAnswers), by=usefulness)
context = []
for answer in answers:
    if fitsTokenBudget(context, answer):
        context.append(answer)
    else:
        stop
finalAnswer = LLM(query, context)
```

The final LLM call uses the query and selected intermediate answers to produce the global response. The paper describes ranking by score and adding answers to the budget one at a time; it does not require exact deduplication or numerical aggregation of intermediate answers.

## 5. Why Use Map-Reduce?

### 5.1 Control Context Length

Passing every community summary in one prompt can exceed the model's context limit as the collection grows. Map keeps each call within its own budget; Reduce selects a bounded set of intermediate answers for the final call.

### 5.2 Cover Multiple Topics

Global questions often span many parts of a corpus. Map lets different batches independently contribute candidate perspectives, rather than relying only on a few passages returned by one similarity search. Shuffling also helps distribute relevant material instead of fixing it in a single batch.

### 5.3 Scale Through Parallelism

Map batches are independent and can be processed concurrently. As the corpus grows, the system mainly adds Map batches instead of putting all information into one oversized request.

### 5.4 Prioritize Useful Answers Within a Limited Budget

Reduce ranks answers using the usefulness scores produced during Map, rather than truncating in community or file order. The limited final context can therefore prioritize answers the model judges more helpful for the query.

## 6. GraphRAG Global Map-Reduce vs. Local Retrieval and Classic MapReduce

| Aspect | GraphRAG global Map-Reduce | Common local/vector retrieval |
|---|---|---|
| Goal | Synthesize corpus-level themes, trends, and perspectives | Find a small number of passages most similar to the query |
| Map input | Batches of community summaries at a selected level | Usually retrieved document passages |
| Map output | Query-focused answers with LLM usefulness scores | Retrieved content or local answers |
| Reduce | Rank answers, fit selected candidates to a budget, then synthesize | Pass retrieved passages directly to a generation model |
| Nature of synthesis | Semantic distillation and selection, not exact numerical aggregation | Often combines local evidence |

This is an **LLM-driven query-focused summarization pipeline**. It borrows the MapReduce shape of parallel processing followed by aggregation, but its intermediate values are natural-language answers and model scores, not exact statistics that are necessarily commutative or associative.

## 7. Key Engineering Decisions

### 7.1 Choose the Community Level First

Community levels trade off summary granularity and global coverage: higher-level summaries are usually more abstract, while lower-level summaries preserve more detail. Make the selected level an explicit query parameter or strategy instead of mixing summaries from every level indiscriminately.

### 7.2 Set Separate Token Budgets

At minimum, distinguish:

- **Map input budget**: community-summary tokens allowed in each Map call.
- **Reduce input budget**: intermediate-answer tokens allowed in the final generation call.
- **Output reserve**: generation tokens reserved for Map answers or the final answer.

Leave room for system prompts, the query, and formatting instructions. The model's full context window is not available solely for summaries.

### 7.3 Control Throughput Under Parallel Load

Map requests can run concurrently, but implementations should cap concurrency and define timeout, rate-limit, and retry behavior. For large jobs, persist batch results so a failure can resume from incomplete batches rather than rerunning everything.

### 7.4 Treat Scores as Ranking Signals, Not Confidence

A score from 0 to 100 represents how useful the model considers an intermediate answer for the target query. The paper uses it to discard zero-scored answers and rank the rest. It is **not** the probability that an answer is correct, evidence reliability, or a statistical confidence interval. For factual reliability, retain source-community or evidence references and verify final claims against them.

### 7.5 Plan for Reproducibility and Observability

Shuffling, LLM generation, and scoring can all affect which context is selected. A production system can record the random seed, selected community level, summary IDs per batch, model version, Map outputs and scores, Reduce selections, and token usage for reproducibility and debugging.

## 8. Simplified Pseudocode

```ts
type MapAnswer = {
  answer: string;
  usefulness: number; // The paper specifies 0–100.
  communityIds: string[];
};

async function globalSearch(
  query: string,
  summaries: Array<{ communityId: string; text: string }>,
): Promise<string> {
  const shuffled = shuffle(summaries);
  const batches = splitByTokenBudget(shuffled, MAP_INPUT_TOKEN_BUDGET);

  const mapped: MapAnswer[] = await mapWithConcurrencyLimit(batches, (batch) =>
    generateCommunityAnswer(query, batch),
  );

  const ranked = mapped
    .filter((item) => item.usefulness > 0)
    .sort((a, b) => b.usefulness - a.usefulness);

  const selected = packUntilTokenBudget(ranked, REDUCE_INPUT_TOKEN_BUDGET);
  return generateGlobalAnswer(query, selected);
}
```

This pseudocode expresses the paper's data flow; it does not prescribe a particular SDK or function signature. A production implementation should also validate the model's output structure and score range, handle the case where no valid Map answers remain, and attach community provenance to intermediate answers so the final response can be traced.

## 9. Workflow Summary

```text
Community summaries (one selected level)
  -> shuffle and split by token limit
  -> parallel intermediate answers and usefulness scores per batch
  -> discard zero-scored results
  -> rank by usefulness and select within the token budget
  -> synthesize a final global answer with an LLM
```

The core idea is not to send the entire graph to a model in one call. Instead, the model first distills query-relevant candidate answers from batches of summaries, then uses a bounded context to synthesize across topics. This is useful for corpus-level questions, but the intermediate scores only support relevance ranking; factual accuracy still depends on traceable evidence and verification.