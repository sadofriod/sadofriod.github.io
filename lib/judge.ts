/**
 * Shared types and pure helpers for the free retraction-status lookup.
 *
 * The endpoint is documented and measured in `app/benchmark/page.tsx`; keep the
 * derivation rules here so the static tables and the interactive lookup cannot
 * disagree about what a response means.
 */

export const JUDGE_ENDPOINT = 'https://pay.ashesborn.cloud/api/v1/judge/paper';

export type SourceStatus = {
  paper_id: string;
  doi: string;
  source: string;
  source_tier: string;
  is_retracted: boolean;
  retraction_date: string | null;
  source_uri: string;
  observed_at: string;
};

export type JudgeResponse = {
  paper: {
    paper_id: string;
    doi: string;
    title: string;
    year: number | null;
    source_tier: string;
  } | null;
  statuses: SourceStatus[];
  abstention_reason?: string;
};

export type VerdictKind = 'retracted' | 'not_retracted' | 'no_status_rows' | 'abstained';

export type Verdict = {
  kind: VerdictKind;
  /** Earliest retraction date reported by any source, when one exists. */
  date: string | null;
  /** Tier letters that reported the paper, e.g. `A+C`. */
  tiers: string;
  /** Number of sources asserting retraction. */
  confirmed: number;
  /** Plain-language reading of the response. Never stronger than the data. */
  reading: string;
  reason?: string;
};

/**
 * Accept `10.x/y`, `doi:10.x/y`, `https://doi.org/10.x/y` and a DOI with
 * surrounding whitespace or trailing punctuation. Returns a bare DOI or null.
 */
export function normalizeDoi(input: string): string | null {
  let value = input.trim();
  if (!value) return null;
  value = value.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  value = value.replace(/^doi:\s*/i, '');
  value = value.replace(/[),.;\s]+$/g, '');
  return /^10\.\d{4,9}\/\S+$/.test(value) ? value : null;
}

/**
 * Turn a raw response into a verdict without inventing certainty:
 * an empty `statuses` array is "no rows for this paper", not "not retracted".
 */
export function summarize(data: JudgeResponse): Verdict {
  if (data.abstention_reason) {
    return {
      kind: 'abstained',
      date: null,
      tiers: '',
      confirmed: 0,
      reason: data.abstention_reason,
      reading:
        data.abstention_reason === 'paper_not_in_snapshot'
          ? 'This DOI is not in the current snapshot, so the service declines to judge it. It says nothing about whether the paper is retracted.'
          : 'The service declined to judge this paper and gave a reason.',
    };
  }

  const statuses = data.statuses ?? [];
  if (statuses.length === 0) {
    return {
      kind: 'no_status_rows',
      date: null,
      tiers: '',
      confirmed: 0,
      reading:
        'The paper is in the snapshot, but no source has a retraction record for it. Treat this as “no evidence either way”, not as “clean”.',
    };
  }

  const tiers = Array.from(new Set(statuses.map((s) => s.source_tier))).sort().join('+');
  const retracted = statuses.filter((s) => s.is_retracted);
  const dates = retracted.map((s) => s.retraction_date).filter((d): d is string => Boolean(d)).sort();

  if (retracted.length > 0) {
    return {
      kind: 'retracted',
      date: dates[0] ?? null,
      tiers,
      confirmed: retracted.length,
      reading: `${retracted.length} of ${statuses.length} sources say this paper is retracted${
        dates.length ? `; the earliest recorded retraction date is ${dates[0]}` : ''
      }.`,
    };
  }

  return {
    kind: 'not_retracted',
    date: null,
    tiers,
    confirmed: 0,
    reading: `All ${statuses.length} sources that cover this paper report it as not retracted.`,
  };
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}
