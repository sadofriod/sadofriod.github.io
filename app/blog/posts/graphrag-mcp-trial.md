---
title: 'GraphRAG-ts MCP trial: read one sourced answer first, then ask for access'
date: '2026-10-23'
excerpt: 'A TypeScript + PostgreSQL GraphRAG MCP for agents. Read a cross-document answer with its source excerpts, then apply for a small hosted trial — no database or model service of your own.'
description: 'Hosted trial of graphrag-ts MCP: a relationship question answered across four documents with source excerpts, plus how to apply, what the trial includes and what it does not.'
tags: ['GraphRAG', 'MCP', 'TypeScript', 'PostgreSQL', 'Agent']
categories: GraphRAG
keywords: 'GraphRAG MCP, TypeScript GraphRAG, PostgreSQL pgvector, agent retrieval, source grounded answers, MCP trial'
lang: en
translationKey: graphrag-mcp-trial
---

Most retrieval problems I see in agent projects are not "we cannot find a document". They are
"we can find three documents, and none of them says why the decision was made or which modules it
touched". `graphrag-ts` is my TypeScript + PostgreSQL answer to that, exposed as an MCP server so an
agent can query it as a tool.

I am opening a small hosted trial. Read the example below first; if the shape of the answer is
useful, reply with **one client name and one question**.

## One question, four documents

From the repository's fictional, MIT-licensed demo corpus
([`examples/project-history`](https://github.com/sadofriod/graphrag-ts/tree/main/examples/project-history/corpus)):

> Why did Harbor move browser sessions from Redis to PostgreSQL, and which modules changed?

The corpus is four short documents: the ADR, an architecture overview, a changelog, and a rollout
runbook. The answer only exists across them — the ADR states the decision, the architecture doc
names the modules that share the database, the changelog names owners, the runbook defines the gate.

What the service is built to return, and what each part comes from:

- **Decision and reason** — ADR-007: *"Harbor moved browser sessions from Redis to PostgreSQL. The
  motivation was to make session revocation and account suspension commit in the same database
  transaction."* It also records the rejected alternative: a Redis delete retry queue gave
  *"eventual rather than transactional revocation"*.
- **Affected modules** — the architecture overview: *"The gateway delegates session lookup to the
  Session Repository. The Account Service owns account state and invokes the same repository for
  transactional revocation."* Plus the Background Cleanup Worker from the ADR's scope section.
- **Rollout ownership** — the changelog and the runbook, not the ADR.
- **The boundary people get wrong** — Redis did not disappear: the discovery path still caches
  public catalog recommendations there, and that cache *"is not an authentication failure"*.

Every excerpt above is quoted from the corpus in this repository, so you can check the claim without
trusting my answer. The hosted response carries the same shape — answer text plus `source` and
`excerpt` per evidence item, plus the `index_version` that produced it. That version is what makes a
retry comparable: same corpus, same snapshot, same answer.

To be explicit about provenance: these are invented documents written for this demo, not a
customer's infrastructure, and I am not claiming a benchmark win over vector-only retrieval here.
The repository's comparison fixture covers five of these cross-document questions and treats them
as expectations, not as proof.

## What the trial actually is

- **One MCP client**, the one you already use, at a specific version. I will confirm the exact
  client and minimal config before opening anything; I am not shipping a "works with everything"
  claim.
- **A pre-indexed workspace** with this public corpus. You do not install PostgreSQL, do not run a
  build, and do not need your own model API key.
- **Read-only query access** for 14 days, capped at 30 local queries. Indexing, writing and the
  expensive global map-reduce run are off by default; ask if you need one.
- **Explicit auth boundary**: the endpoint requires a bearer credential I issue, and the hostname
  sits behind an email allowlist. That is two layers on purpose. It means the first minute is not
  zero-friction: you reply, I grant, you connect. Right now that wait is manual — usually within one
  business day — and I would rather say so than pretend it is instant.
- **No private corpora.** Public or synthetic data only until there is real tenant isolation.

What I will not promise: an SLA, anonymous unlimited queries, one-click installation for every
client, or that this replaces your own document pipeline.

## How to apply

Reply to [justlikeashes@gmail.com](mailto:justlikeashes@gmail.com) with:

1. the MCP client and version you would connect from;
2. one question you actually need answered across several documents;
3. the email you want allowlisted, if it differs from the one you send from.

I will tell you whether the demo corpus can answer it before granting anything. If it cannot, that
is a useful answer too — it tells us both whether the problem is a fit.

## If you would rather self-host

`graphrag-ts` is MIT-licensed and runs on Bun or Node with PostgreSQL + pgvector:

```sh
git clone https://github.com/sadofriod/graphrag-ts
cd graphrag-ts && pnpm install
```

Model requirements are the real constraint: a chat endpoint and an embedding endpoint that returns
**exactly 768 dimensions** (the schema is `vector(768)`; a mismatch surfaces as a failed build).
The MCP service, its access policy and the sample corpus are documented in
[`integrations/mcp`](https://github.com/sadofriod/graphrag-ts/tree/main/integrations/mcp).

There is also an optional paid HTTP API (`POST /api/v1/query`) built on x402 for agents that pay per
call instead of holding a key. It is in the repository and documented, but **not enabled on the
hosted endpoint** while the trial is running; I am not selling it before anyone has used the free
version twice.
