---
title: 'HSK 3.0: extracting 11,000 syllabus entries from a PDF and proving none are missing'
date: '2026-11-24'
excerpt: 'The November 2025 HSK syllabus puts 11,000 words in a 406-page PDF printed as running text. Here is how the extraction was done, how a third-party dataset turned out to be 123 rows short, and how completeness gets proven without trusting a checksum.'
description: 'Extracting an 11,000-entry vocabulary list from the November 2025 HSK 3.0 syllabus PDF: page-anchored rows, id-continuity and level-distribution proofs of completeness, homograph and pinyin normalisation for mapping 5,001 old HSK words, and a 100% anchor hit rate with the misses reported in full.'
tags: ['Data Engineering', 'PDF Extraction', 'Data Validation', 'Chinese', 'Python', 'HSK']
categories: Data
keywords: 'HSK 3.0 word list, HSK syllabus PDF extraction, extract vocabulary list from PDF, HSK 2.0 to 3.0 migration, data completeness verification, pypdf text extraction, Chinese word list dataset'
lang: en
translationKey: hsk3-syllabus-extraction
---

**The November 2025 HSK syllabus replaced a six-level list of 5,000 words with a nine-level list of 11,000, and the exam from 13 December 2026 follows the new document.** For anyone mid-way through the old track the useful question is concrete: which of my 1,200 old-HSK-4 words survived into new HSK 4, which moved, and which of the 875 words I have never been examined on are now expected of me.

That question has a data answer, but the data is trapped in a 406-page PDF where entries are printed as running text, not as a table. Two jobs follow: get all 11,000 entries out, then show that the extraction is complete rather than merely plausible. The second job is the one that took the time, because a vocabulary list that silently drops 123 rows still looks exactly like a vocabulary list.

## The dataset that looked complete and was not

An existing community dataset (transcribed from the same syllabus, with a `source_pdf_page` column) shipped per-level CSV files. It was accurate everywhere we sampled and wrong in the one place that mattered: its level-4 file ended at entry id 1877, where the official list runs to 2000. Level 4 was 877 entries against an official 1,000 — 123 rows short, in the level that the first slice of this project depended on.

Nothing about the file announced that. Every row it did contain was correct, page numbers were present, and the totals per file were plausible. The only way the gap surfaced was a cross-check against the official per-level counts, which is why that check became item five of the verification report rather than an afterthought.

So the HSK 3.0 side was rebuilt from the PDF itself.

## Getting the entries out

`pypdf` gives page-level text for the 406 pages; the vocabulary section spans pages 80 through 354. Each entry is a line of the form `序号 词形 拼音 词性`, which extracts to six columns:

```
id, level_label, hanzi, pinyin, pos, page
```

One detail breaks naive parsing: `level_label` is sometimes `4` and sometimes `4（5）`, the latter meaning the word is first required at level 4 and still required at level 5. Taking the string as a level produces a seventh bucket that no official count has; the level is the number before the parenthesis.

The result is 11,000 rows, ids 1 to 11,000.

## Proving completeness when the checksum disagrees

The provenance note for the downloaded syllabus recorded SHA-256 `ec74ce04…4941`. The file on disk hashes to `d8b66465…09ad`. Same length, same page count, same content as far as any human check can tell — and genuinely different bytes, probably a re-export of the same document.

A checksum compares a file to a previously seen file. It cannot tell you whether a file matches the official one, and when it disagrees you are left holding a boolean that means "unknown". So the hash was demoted to a footnote and replaced with invariants that the data has to satisfy on its own:

```python
ids = [int(r["id"]) for r in rows]
assert ids == list(range(1, len(ids) + 1))          # contiguous, no dupes, no gaps

counts = Counter(r["level"] for r in rows)
assert counts == {1: 300, 2: 200, 3: 500, 4: 1000, 5: 1600, 6: 1800, "7-9": 5600}

assert all(1 <= int(r["page"]) <= 406 for r in rows)
```

- **Id continuity** catches a dropped line: a running-text extraction that skips a paragraph leaves a hole in the sequence.
- **Level distribution** catches the opposite failure, a row counted twice or a table misaligned, and independently reproduces the official summary (11,000 words, 3,079 recognition characters, 1,200 writing characters, 428 grammar points).
- **Page bounds** catches an off-by-one in the page counter, which would otherwise silently make every anchor in the dataset wrong by the same amount.

A missing row breaks at least one of the three. A hallucinated row breaks id uniqueness. The checksum mismatch stays written down in the report, with the reason the evidence does not depend on it.

## Mapping 5,001 old words onto the new list

The old list is 5,001 rows (the official count is 5,000; four headwords appear twice, once per level). Matching runs on `(hanzi, normalised pinyin)`, and the normalisation is where most of the correctness lives:

```python
def key(hanzi, pinyin):
    h = re.sub(r"\d+$", "", hanzi).strip()        # 本2 -> 本 (homograph index, not the word)
    p = pinyin.replace("’", "'").replace(" ", "").replace("-", "")
    return h, p                                    # tone marks, not tone numbers
```

Three decisions in that function:

- **Simplified only.** The old list carries traditional forms; the new syllabus is simplified-only. Matching on traditional silently loses rows.
- **Tone marks, not tone digits.** Sources mix `bízi` and `bi2zi`; normalising to one representation was the difference between a 95% and a 60% match rate.
- **Homograph digits are metadata.** `本2` is the second reading of 本, not a different word; stripping the digit keeps both readings as candidates, which the ambiguity rule below then handles.

Fallbacks run in one order — `(hanzi, pinyin)`, then `hanzi` alone, then `pinyin` alone — and only when the candidate set has exactly one member at one level. When an old word matches multiple new entries at different levels it is marked `ambiguous` and left unassigned. Thirty-seven words end up there. Guessing them would have moved 37 rows out of sight; flagging them leaves a list a learner can check by hand.

The results, all reproducible from the published CSVs:

| Status | Rows |
|---|---:|
| unchanged | 2,519 |
| up | 1,949 |
| down | 370 |
| removed | 126 |
| ambiguous (unassigned) | 37 |
| **total** | **5,001** |

Full-key matches account for 4,768 of the 5,001 (95.34%), with the rest split between single-signal fallbacks, removals and ambiguity.

There is a second completeness proof on this side, and it is the one I trust most: the 4,831 distinct syllabus entries that old words map onto, plus the 6,169 new forms the old list never had, sum to exactly 11,000, with an empty intersection. Both numbers come from independent passes over the same PDF; a dropped row on either side leaves the two totals short of 11,000.

## Every row carries the page it came from

A migration table is a claim about someone else's document. The cheapest way to make the claim checkable is to publish the page each row was read from, which is what the `page` column is for. Then the checker is mechanical:

```python
hits = sum(1 for r in rows if r["hanzi"] in page_text[int(r["page"])])
```

11,007 rows have a determinate target (mapped words plus new forms). 11,007 hit, 0 missed — 100% against a 99.5% gate, with the full miss list printed when it is not empty. Removed and ambiguous words are excluded from the denominator because they point at no page; saying so in the report matters more than the percentage does.

The honest limit: the page text comes from the same extraction as the rows, so what this proves is internal consistency and that a reader can open page 161 in the official PDF and find 小姐 there. It does not prove the extraction is the official document.

## Where it is now

The map is public at [ashesborn.cloud/hsk/](https://ashesborn.cloud/hsk/) — the old-HSK-4 slice lists 880 syllabus entries for the 875-word gap (five entries absorb two old words each), every row showing its page. The CSVs are CC BY 4.0 at [sadofriod/hsk-3-migration-map](https://github.com/sadofriod/hsk-3-migration-map), so any number above can be re-derived rather than taken on trust.

Three things worth carrying to the next PDF:

1. **A hash proves sameness, not correctness.** Structural invariants — id contiguity, distribution against an official summary, page bounds — are what make a dataset's completeness a claim you can argue.
2. **Ambiguity is a state, not a failure.** 37 flagged rows are more useful than 37 confident guesses, and they cost one column.
3. **Publish the anchor.** A row that carries its source page converts "trust me" into "check page 161", which is the only kind of verification most readers will actually do.
