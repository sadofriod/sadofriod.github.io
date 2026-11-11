---
title: 'Three findings from the IEA Energy and AI report'
date: '2026-11-06'
excerpt: 'I fed the IEA Energy and AI executive summary into graphrag-ts and asked three investor-style questions. Every claim came back with the paragraph it came from — and one question came back as "cannot confirm". Both halves are in here.'
description: 'A complete, reproducible sourced-intelligence brief: three verifiable findings from the IEA Energy and AI report, each with its source paragraph and chunk id, plus the one query the system refused to answer and why.'
tags: ['GraphRAG', 'TypeScript', 'PostgreSQL', 'Retrieval', 'Evaluation']
categories: GraphRAG
keywords: 'sourced brief, GraphRAG evidence, claim provenance, IEA Energy and AI, data centre electricity demand, retrieval abstain, TypeScript GraphRAG'
lang: en
translationKey: iea-energy-ai-sourced-brief
---

> **For buyers.** A retrieval system that only returns prose makes you re-do the research. This post is the whole artifact: three claims, the paragraph behind each one, the chunk id, and one query the system refused to answer. You can check every line against the source PDF in a couple of minutes.

An answer without a paragraph is not research — it is a plausible sentence. So the first thing I check in any retrieval system is not whether the answer sounds right, but whether I can click back to the sentence that produced it.

Below is a complete brief I ran today, unedited, including the part that failed.

## What was indexed

- **Source**: IEA, *Energy and AI* (10 April 2025), Executive Summary — CC BY 4.0, so it can be quoted and republished.
- **Size**: 18,776 characters, one document.
- **Time to index**: 6 minutes 25 seconds (extraction, graph build, snapshot publish).
- **Snapshot**: `781a5cad`, workspace `iea-energy-ai-2025`.
- **Retrieval**: local hybrid — vector similarity, keyword match, and graph neighbourhood, top 6 passages per question.

## Three findings, each with its source

| # | Claim | Source paragraph | Chunk |
|---|---|---|---|
| 1 | Data centre electricity use more than doubles to ~945 TWh by 2030 | "Data centre electricity consumption is set to more than double to around 945 TWh by 2030. This is slightly more than Japan's total electricity consumption today." | `cmw4m2dv80022s3019chn8bil` |
| 2 | By 2035 the range is 700–1,700 TWh | "By 2035, the range of data centre electricity demand across our cases spans from 700 to 1 700 TWh." | `f97ebb48` |
| 3 | ~20% of planned data centre projects are at risk of delay | "unless these risks are addressed, around 20% of planned data centre projects could be at risk of delays" | `a23d935f` |
| 4 | Refined gallium is ~99% Chinese | "China currently accounts for around 99% of global refined gallium supply." | `cmw4m2e39002es3012uyq3skd` |

The interesting part is not the numbers — they are in the report. It is that the binding constraint is **grid interconnection, not generation**:

- new transmission lines take **four to eight years** in advanced economies;
- wait times for transformers and cables have **doubled in three years**;
- gas turbine deliveries now face lead times of **several years**, pushing commissioning past 2030.

That sequence is an investment thesis about equipment and interconnection services, not about electricity. A summariser that drops the paragraph would have given me the 945 TWh headline and none of the constraint.

## The relation map the graph produced

```
Data centre demand ──driven by──> AI training / inference
     ├─ met (50%) ──────> renewables
     ├─ met (+175 TWh) ─> natural gas (mostly US)
     ├─ met (~+175 TWh) ─> nuclear (CN/JP/US, first SMRs ~2030)
     └─ constrained by ─> interconnection queues / transformers / cables / turbines
                 └─ causes ─> ~20% of planned projects at risk of delay
AI data centre ──10x capital intensity of──> aluminium smelter
Gallium ──supply concentration──> China ~99%
```

## Uncertainty the report states itself

- 2035 spans **700–1,700 TWh** depending on AI uptake, efficiency gains and how fast bottlenecks clear.
- In the High Efficiency Case, 2035 demand is **20% below** the Base Case.
- Gas expansion in the Lift-Off Case is **four times** the Headwinds Case; nuclear varies even more.
- These are IEA model outputs and consultations, not measurements. Any citation should say "estimated".

A system that returned only "945 TWh by 2030" and dropped the range would have been technically correct and practically misleading.

## The query it refused to answer

I asked: *"Which bottlenecks could delay data centre projects? Which equipment, what lead times, what percentages?"*

It answered: **"Based on the retrieved evidence, the report does not state which bottlenecks could delay data centre projects, and no specific equipment lead times or delay percentages are given."**

That answer was wrong in the sense that the passage exists. It is the honest answer to a retrieval failure: the passage was not in the retrieved set, so the model would have had to guess to produce the numbers. It did not guess.

I re-ran the same question with the literal numbers and nouns from the report — `20% ... four to eight years ... transformers and cables ... turbine deliveries several years` — and it hit on the first try, quoting exactly the passage above.

So the failure mode is specific and worth naming: **abstract questions miss, literal ones hit**. That is a retrieval-weighting problem, not a reasoning problem, and it is the next thing I am tuning. The behaviour I am not changing is the refusal: a confident paragraph that is not in the corpus is worse than "cannot confirm", because with the refusal I know to rephrase, and with the confident answer I do not.

## Reproducing it

```bash
# 1. index (one document, one workspace)
graphrag remember_text --workspace iea-energy-ai-2025 \
  --source "IEA Energy and AI (2025) Executive Summary"

# 2. ask
graphrag query_graph --workspace iea-energy-ai-2025 \
  --query "Data centre electricity demand in 2030 and 2035, by region, and which sources meet it" \
  --max-results 6
```

Every result carries the chunk id. `cmw4m2dv80022s3019chn8bil` above is a real row in the store — the claim, the paragraph, and the citation are the same object, not three artefacts kept in sync by hand.

## What this is, and what it is not

It is a working pipeline that turns a public report into a brief you can audit line by line, at roughly six minutes of indexing per document and a cost you can measure per query.

It is not an analyst. It found the constraints the report states; it did not decide whether the market has priced them. That judgement is still mine, and I would rather keep it that way.

## Related

- [graphrag-ts on GitHub](https://github.com/sadofriod/graphrag-ts) — MIT, self-host on Bun or Node
- [Hosted MCP trial](https://blog.ashesborn.cloud/blog/graphrag-mcp-trial) — one sourced answer, read-only, then apply
- [Free DOI retraction lookup](https://ashesborn.cloud/datasets) — the same stack answering a different question
