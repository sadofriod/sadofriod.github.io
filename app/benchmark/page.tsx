import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import T from '@/components/T';
import TRich from '@/components/TRich';
import benchmark from '@/data/judge-benchmark.json';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';
const ENDPOINT = 'https://pay.ashesborn.cloud/api/v1/judge/paper';

export const metadata: Metadata = {
  title: 'Benchmark: free DOI retraction lookup across 20 DOIs, measured',
  description:
    'A reproducible benchmark of the free retraction lookup: 20 DOIs (16 retracted, 3 controls, 1 unknown), 20/20 HTTP 200, median 1,595 ms, 16/16 retractions confirmed by three sources, one documented abstention. Method, raw numbers and the shell loop that reproduces it.',
  keywords:
    'retraction lookup benchmark, DOI retraction check API, research integrity API latency, retraction watch api free, Crossref retraction check, benchmark GraphRAG judgment',
  alternates: { canonical: `${SITE}/benchmark` },
  openGraph: {
    type: 'article',
    url: `${SITE}/benchmark`,
    title: 'Benchmark: free DOI retraction lookup across 20 DOIs',
    description:
      '20 DOIs, 20/20 HTTP 200, median 1,595 ms, three sources agreeing on every retraction, one abstention with a stated reason.',
  },
};

const VERDICT_LABEL: Record<string, { key: string; bg: string }> = {
  retracted: { key: 'benchmark.verdictRetracted', bg: '#ff90e8' },
  not_retracted: { key: 'benchmark.verdictNotRetracted', bg: '#b8f2cf' },
  no_status_rows: { key: 'benchmark.verdictNoRows', bg: '#ffc700' },
  abstained: { key: 'benchmark.verdictAbstained', bg: '#a0d8ff' },
};

const SUMMARY = benchmark.summary;

const STATS: Array<{ labelKey: string; value: string; noteKey: string; noteParams?: Record<string, string> }> = [
  { labelKey: 'benchmark.statHttp', value: `${SUMMARY.http_200} / ${SUMMARY.n}`, noteKey: 'benchmark.statHttpNote' },
  { labelKey: 'benchmark.statMedian', value: `${SUMMARY.p50_ms} ms`, noteKey: 'benchmark.statMedianNote', noteParams: { mean: String(SUMMARY.mean_ms), max: String(SUMMARY.max_ms) } },
  { labelKey: 'benchmark.statRetracted', value: `${SUMMARY.retracted}`, noteKey: 'benchmark.statRetractedNote' },
  { labelKey: 'benchmark.statAbstentions', value: `${SUMMARY.abstained}`, noteKey: 'benchmark.statAbstentionNote' },
];

export default function BenchmarkPage() {
  return (
    <main className="profile-shell">
      <nav style={{ marginBottom: 16, fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
        <Link className="brutal-link" href="/datasets"><T k="benchmark.back" /></Link>
      </nav>

      <header className="brutal-card brutal-card--pink" style={{ marginBottom: 28 }}>
        <T k="benchmark.kicker" as="p" className="brutal-kicker" params={{ date: SUMMARY.queried_at }} />
        <T as="h1" className="brutal-title" style={{ fontSize: 38, margin: '6px 0 10px' }} k="benchmark.title" />
        <T as="p" className="brutal-text" style={{ maxWidth: 780 }} k="benchmark.lead" params={{ date: SUMMARY.queried_at }} />
      </header>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: 28 }}>
        {STATS.map((stat) => (
          <div key={stat.labelKey} className="brutal-card" style={{ padding: 16 }}>
            <T as="p" style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }} k={stat.labelKey} />
            <p style={{ margin: '4px 0', fontSize: 28, fontWeight: 700, fontFamily: 'var(--brutal-mono)' }}>{stat.value}</p>
            <T as="p" style={{ margin: 0, fontSize: 12, opacity: 0.8 }} k={stat.noteKey} params={stat.noteParams} />
          </div>
        ))}
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }} k="benchmark.methodTitle" />
        <ol className="brutal-text" style={{ paddingLeft: 20, margin: '0 0 14px', lineHeight: 1.8 }}>
          <li>
            <TRich
              k="benchmark.method1"
              slots={{
                strong: <strong><T k="benchmark.method1Slot" /></strong>,
                code: <code>retraction_status</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.method2"
              slots={{
                strong: <strong><T k="benchmark.method2Slot" /></strong>,
                em: <em><T k="benchmark.method2Em" /></em>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.method3"
              slots={{
                strong: <strong><T k="benchmark.method3Slot" /></strong>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.method4"
              slots={{
                strong: <strong><T k="benchmark.method4Slot" /></strong>,
              }}
            />
          </li>
        </ol>
        <pre style={{ background: '#111', color: '#f7f3e8', padding: 14, borderRadius: 4, overflowX: 'auto', fontSize: 12, margin: 0 }}>
{`# reproduce: one GET per DOI, wall-clock ms, no retries
for doi in 10.1001/jama.293.14.1727 10.1038/nature14581 10.9999/not-in-snapshot; do
  curl -s -o /tmp/out.json -w "%{http_code} %{time_total}s $doi\\n" \\
    -A "Mozilla/5.0 (compatible; ashesborn-bench/1.0)" \\
    "${ENDPOINT}?doi=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$doi")"
  python3 -m json.tool < /tmp/out.json | head -20
  sleep 0.35
done`}
        </pre>
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }} k="benchmark.samplesTitle" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, minWidth: 760 }}>
            <thead>
              <tr>
                {['DOI', 'benchmark.colYear', 'benchmark.colVerdict', 'benchmark.colTiers', 'benchmark.colDate', 'ms', 'benchmark.colTitle'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head === 'DOI' || head === 'ms' ? head : <T k={head} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benchmark.rows.map((row) => {
                const style = VERDICT_LABEL[row.verdict] ?? { key: row.verdict, bg: '#eee' };
                return (
                  <tr key={row.doi}>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)', fontSize: 12 }}>
                      <a className="brutal-link" href={`https://doi.org/${row.doi}`} target="_blank" rel="noreferrer noopener">
                        {row.doi}
                      </a>
                    </td>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4' }}>{row.year ?? '—'}</td>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4' }}>
                      <span style={{ background: style.bg, border: '2px solid var(--ink)', borderRadius: 999, padding: '0 8px', fontSize: 12, fontFamily: 'var(--brutal-mono)' }}>
                        {style.key ? <T k={style.key} /> : row.verdict}
                      </span>
                    </td>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>
                      {row.tiers || '—'}
                    </td>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4' }}>
                      {row.date || '—'}
                    </td>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>{row.ms}</td>
                    <td style={{ padding: '7px 8px', borderBottom: '1px solid #e6e0d4', fontSize: 12 }}>{row.title ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="brutal-card brutal-card--blue" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }} k="benchmark.limitsTitle" />
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
          <li>
            <TRich
              k="benchmark.limit1"
              params={{ n: String(SUMMARY.n) }}
              slots={{
                strong: <strong><T k="benchmark.limit1Slot" params={{ n: String(SUMMARY.n) }} /></strong>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.limit2"
              slots={{
                strong: <strong><T k="benchmark.limit2Slot" /></strong>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.limit3"
              slots={{
                strong: <strong><T k="benchmark.limit3Slot" /></strong>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.limit4"
              params={{ max: String(SUMMARY.max_ms) }}
              slots={{
                strong: <strong><T k="benchmark.limit4Slot" /></strong>,
                code: <code>server-timing</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="benchmark.limit5"
              slots={{
                strong: <strong><T k="benchmark.limit5Slot" /></strong>,
              }}
            />
          </li>
        </ul>
      </section>

      <section className="brutal-card">
        <T as="h2" className="brutal-title" style={{ fontSize: 22, margin: '0 0 8px' }} k="benchmark.runTitle" />
        <T as="p" className="brutal-text" style={{ marginTop: 0 }} k="benchmark.runLead" />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="brutal-btn brutal-btn--ink" href="/datasets"><T k="benchmark.runCta" /></Link>
          <Link className="brutal-btn" href="/datasets/retraction-integrity"><T k="benchmark.runHowBuilt" /></Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Benchmark: free DOI retraction lookup across 20 DOIs, measured',
          url: `${SITE}/benchmark`,
          dateModified: '2026-10-28',
          about: { '@type': 'Dataset', name: 'Citation and retraction integrity graph', version: 'ri-20261025-1526' },
          measuredProperty: ['HTTP status', 'latency', 'retraction verdict agreement'],
          description:
            'Reproducible benchmark of a free per-DOI retraction status endpoint: 20 samples, median 1,595 ms, 16 retractions confirmed by three sources, one abstention.',
        }}
      />
    </main>
  );
}
