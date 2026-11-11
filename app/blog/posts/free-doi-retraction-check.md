---
title: 'How to check if a paper is retracted (20 DOIs)'
date: '2026-10-28'
excerpt: 'A retraction lookup built on a citation graph: three source assertions per paper, two tiers, four possible verdicts, and the numbers from twenty DOIs run against the endpoint. Includes why an empty status list is a different answer from "not retracted".'
description: 'How a retraction verdict is derived from three sources with tiers, how abstention works, and what 20 DOIs measured: median 1,595 ms, 16 retracted, 2 unknown.'
tags: ['GraphRAG', 'TypeScript', 'PostgreSQL', 'research-integrity', 'dataset']
categories: GraphRAG
keywords: 'how to check if a paper is retracted, DOI retraction status, retraction watch database alternative, crossref retraction watch, source tier, abstention, OpenAlex, GraphRAG TypeScript'
lang: en
translationKey: free-doi-retraction-check
---

> **For buyers.** A cited paper can be retracted while the citation keeps travelling, and "no record found" is not the same answer as "not retracted". Paste any DOI into the free lookup and read the three source rows, their tiers and the abstention reason yourself.

> **Key facts.** One HTTP GET answers whether a DOI is retracted — free, no key, no model call. The verdict is derived from per-source rows: OpenAlex (tier C), Crossref update-to (tier A), Retraction Watch (tier A) — 572 assertions over 98,868 papers in snapshot ri-20261025-1526. Measured 2026-10-28 on 20 DOIs: 20/20 HTTP 200, median 1,595 ms, 16 retracted, 1 not retracted, 2 with no status rows, 1 abstention. A missing row is returned as missing, never as “not retracted”.

Retraction status is not one field in one database. A work can carry an OpenAlex flag, a Crossref
`update-to` relation and a Retraction Watch notice, and the three can disagree. An agent citing such
a work emits a DOI and nothing else, so the disagreement never reaches the reader.

This post describes how `graphrag-ts` turns those rows into a verdict, and what the endpoint returned
for twenty DOIs. The numbers come from one run on 2026-10-28 against a single snapshot.

## 1. What the graph holds

Snapshot `ri-20261025-1526`, published under CC0:

| Table | Rows | Columns of interest |
| --- | --- | --- |
| `papers` | 98,868 | `paper_id` (OpenAlex), `doi`, `title`, `publication_year`, `openalex_is_retracted` |
| `cites` | 144,814 | `citing_id`, `cited_id`, `cited_doi`, `source_tier`, `source_uri` |
| `retraction_status` | 572 | `paper_id`, `source`, `source_tier`, `is_retracted`, `retraction_date` |

`paper_id` is stable across snapshots, which is what lets an incremental build compare two versions
without re-extracting the unchanged part. `cites` is directed: `citing_id` cites `cited_id`.
`cited_doi` is null when a reference carries no DOI, so a join on DOI alone loses edges.

The public export is a neighbourhood sample: twelve retracted seeds, the works that cite them, and
those works' reference lists. 781 works cite at least one seed across 788 edges, and six cite two or
more.

## 2. Why each assertion is a row

`retraction_status` holds one row per `(paper, source)` pair. A single boolean column would be
smaller, and would also discard the two things a consumer needs: which source asserted it, and when
that source dated it. Tier A means a registry that records retractions directly (Crossref
`update-to`, Retraction Watch); tier C means an index-derived flag (OpenAlex). A disagreement between
an A row and a C row is information, and it survives into the response.

Retraction Watch reason and nature free text is excluded from the release. A retraction is a
bibliographic event; reproducing a publisher's prose about it turns a status lookup into an
accusation the dataset cannot substantiate.

## 3. Deriving a verdict

Four outcomes, evaluated in this order:

1. `abstained`. The response carries `abstention_reason`, currently `paper_not_in_snapshot`. The paper
   is outside the snapshot and the service declines to classify it.
2. `no_status_rows`. The paper is in `papers`, but no source has a status row for it. This is absence
   of evidence.
3. `retracted`. At least one source asserts retraction. The response reports how many did, the tier
   letters involved, and the earliest recorded date.
4. `not_retracted`. Every covering source asserts the opposite.

Cases 1 and 2 are the ones that get misread. `statuses: []` with `paper: null` is not a clean paper,
and `statuses: []` with a paper present is not a clean paper either. A consumer that maps both to
"clean" produces assurance it does not have.

## 4. The interfaces

| Interface | Cost | Returns |
| --- | --- | --- |
| `GET /api/v1/judge/paper?doi=` | free, no key | paper-level status rows and their tiers |
| MCP `integrity_paper_status` | free, no key | the same payload over Streamable HTTP |
| MCP `retraction_propagation` | $0.02 per call | verdict, confidence, retracted roots, coverage |
| MCP `integrity_evidence_audit` | $0.10 per call | the above plus the evidence path and tier distribution |

The free HTTP route returns `access-control-allow-origin: *`, so a browser can call it directly, which
is what the dataset page does. The paid calls settle through x402 on Base, and the MCP server answers
`initialize` and `tools/list` anonymously so a client can inspect the tool inventory before paying.

The response carries the snapshot that produced it:

```json
{
  "paper": { "paper_id": "W2117847125", "doi": "10.1016/s0140-6736(97)11096-0", "year": 1998 },
  "statuses": [
    { "source": "openalex",         "source_tier": "C", "is_retracted": true, "retraction_date": null },
    { "source": "retraction_watch", "source_tier": "A", "is_retracted": true, "retraction_date": "2010-02-06" }
  ]
}
```

## 5. Measuring twenty DOIs

Method: sixteen retracted DOIs taken from `retraction_status` (every DOI carrying a recorded
retraction date), three controls expected not to be retracted, one deliberately invalid DOI. One GET
per DOI, sequential, 350 ms apart, browser-style User-Agent, no retries counted as samples. Latency is
wall-clock from request to parsed body, measured from a container reaching Cloudflare over the public
internet.

| Measure | Result |
| --- | --- |
| HTTP 200 | 20 / 20 |
| Median latency | 1,595 ms |
| Mean / max | 1,965 ms / 5,318 ms |
| Retracted | 16 |
| Not retracted | 1 |
| No status rows | 2 |
| Abstained | 1 |

All sixteen retracted DOIs were confirmed by three sources (OpenAlex tier C, Crossref tier A,
Retraction Watch tier A). The engine reports its own time in `server-timing`; repeated calls returned
`app;dur=6.1`, `6.4` and `3.9` ms with one outlier at `104.2` ms. The rest of the wall-clock time is
network and TLS.

## 6. Reading the numbers

The 5,318 ms maximum was the first request after idle, so a cold start dominates it; the mean is
inflated by that sample and the median is the figure to use for capacity planning.

The two controls that returned no status rows are the interesting part of the run. Both papers are in
the graph, and neither has a source asserting anything about retraction. A checker that maps "no rows"
to `retracted: false` would have reported two clean papers it cannot vouch for. The response keeps
that outcome separate from the abstention case for this reason.

The invalid DOI returned `abstention_reason: paper_not_in_snapshot`, an empty status list and HTTP
200. No error code and no guess.

## 7. What this does not show

- **n = 20, one snapshot, one egress.** This measures one endpoint from one machine in one hour. It is
  not throughput under load, and not a comparison with other services.
- **Recall, not precision.** The sixteen retracted samples came from the status table, so the run
  shows that known retractions are found. It says nothing about false positives on clean literature,
  because the snapshot has no clean control group of comparable size.
- **Status, not misconduct.** Reason text is excluded on purpose. "Retracted" here is a bibliographic
  state.
- **A neighbourhood sample is not the scholarly record.** Twelve seeds and their citers do not support
  any statement about retraction rates in a field.

## 8. Reproducing the measurement

```bash
for doi in 10.1001/jama.293.14.1727 10.1038/nature14581 10.9999/not-in-snapshot; do
  enc=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=""))' "$doi")
  curl -s -o /tmp/out.json -w "%{http_code} %{time_total}s $doi\n" \
    -A "Mozilla/5.0 (compatible; bench/1.0)" \
    "https://pay.ashesborn.cloud/api/v1/judge/paper?doi=$enc"
  python3 -m json.tool < /tmp/out.json | head -20
  sleep 0.35
done
```

The dataset and loader scripts are on Hugging Face
([retracted-papers citation integrity graph on Hugging Face](https://huggingface.co/datasets/ashesborn6/retracted-papers-citation-integrity-graph)). The citation neighbourhood rendered on
`/datasets/retraction-integrity` is generated by `scripts/build-retraction-graph.mjs` in the blog
repository, which recomputes seed selection from the three published JSONL files instead of shipping a
hand-picked layout.

## Related

- [Free DOI retraction lookup](https://ashesborn.cloud/datasets) — the dataset and the endpoint measured here
- [The judgment benchmark](https://ashesborn.cloud/benchmark) — 28 auditable cases against the live endpoint
