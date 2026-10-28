import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
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

const VERDICT_LABEL: Record<string, { label: string; bg: string }> = {
  retracted: { label: 'retracted', bg: '#ff90e8' },
  not_retracted: { label: 'not retracted', bg: '#b8f2cf' },
  no_status_rows: { label: 'no rows', bg: '#ffc700' },
  abstained: { label: 'abstained', bg: '#a0d8ff' },
};

const SUMMARY = benchmark.summary;

export default function BenchmarkPage() {
  return (
    <main className="profile-shell">
      <nav style={{ marginBottom: 16, fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
        <Link className="brutal-link" href="/datasets">← Datasets</Link>
      </nav>

      <header className="brutal-card brutal-card--pink" style={{ marginBottom: 28 }}>
        <p className="brutal-kicker">Measured {SUMMARY.queried_at}</p>
        <h1 className="brutal-title" style={{ fontSize: 38, margin: '6px 0 10px' }}>
          Twenty DOIs, three sources, one API call each
        </h1>
        <p className="brutal-text" style={{ maxWidth: 780 }}>
          A benchmark of the free retraction-status lookup, not of a language model. Every figure below comes from
          sequential HTTP GETs against the live endpoint, recorded on {SUMMARY.queried_at}. The point is not a big
          number — it is that the answer is cheap, deterministic, and states where it has no evidence.
        </p>
      </header>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: 28 }}>
        {[
          ['HTTP 200', `${SUMMARY.http_200} / ${SUMMARY.n}`, 'no auth, no key, no retries'],
          ['Median latency', `${SUMMARY.p50_ms} ms`, `mean ${SUMMARY.mean_ms} ms, max ${SUMMARY.max_ms} ms`],
          ['Retracted', `${SUMMARY.retracted}`, 'three sources agreeing on each'],
          ['Abstentions', `${SUMMARY.abstained}`, 'stated reason, not a guess'],
        ].map(([label, value, note]) => (
          <div key={label} className="brutal-card" style={{ padding: 16 }}>
            <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>{label}</p>
            <p style={{ margin: '4px 0', fontSize: 28, fontWeight: 700, fontFamily: 'var(--brutal-mono)' }}>{value}</p>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{note}</p>
          </div>
        ))}
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }}>Method</h2>
        <ol className="brutal-text" style={{ paddingLeft: 20, margin: '0 0 14px', lineHeight: 1.8 }}>
          <li>
            <strong>Corpus of questions.</strong> 16 retracted DOIs were drawn from the published{' '}
            <code>retraction_status</code> table (every DOI with a recorded retraction date), so the retracted set is
            not hand-picked from famous cases.
          </li>
          <li>
            <strong>Controls.</strong> Three DOIs expected <em>not</em> to be retracted, plus one deliberately invalid
            DOI to exercise the abstention path.
          </li>
          <li>
            <strong>One GET each</strong>, sequential, 350 ms apart, with a browser-style User-Agent, no retries counted
            as separate samples. Latency is wall-clock from request to parsed body, measured from a container reaching
            Cloudflare over the public internet.
          </li>
          <li>
            <strong>Verdict derivation</strong> is mechanical: an abstention reason wins; otherwise any source asserting
            retraction gives “retracted”, all sources denying it give “not retracted”, and an empty status array gives
            “no rows”.
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
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }}>Every sample</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, minWidth: 760 }}>
            <thead>
              <tr>
                {['DOI', 'Year', 'Verdict', 'Tiers', 'Retraction date', 'ms', 'Title'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benchmark.rows.map((row) => {
                const style = VERDICT_LABEL[row.verdict] ?? { label: row.verdict, bg: '#eee' };
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
                        {style.label}
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
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }}>Limits, stated plainly</h2>
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
          <li>
            <strong>n = {SUMMARY.n}, one snapshot, one egress.</strong> This measures one endpoint from one machine at one
            hour. It does not estimate throughput under load and it is not a comparison with other services.
          </li>
          <li>
            <strong>Two controls returned no status rows.</strong> The paper is in the graph, but no source asserts
            anything about its retraction status. Read that as “no evidence”, never as “clean”; the derivation returns a
            distinct verdict for exactly this reason.
          </li>
          <li>
            <strong>“Retracted” here is a status, not a misconduct finding.</strong> Reason text is excluded from the
            dataset on purpose.
          </li>
          <li>
            <strong>Latency is dominated by cold container wake-ups</strong> — the {SUMMARY.max_ms} ms sample was the
            first request after idle. A warm median of ~1.4 s matches the <code>server-timing</code> header, so the
            engine itself answers in single-digit milliseconds.
          </li>
          <li>
            <strong>The paid judgment is a different product.</strong> Propagation and evidence audit cost $0.02 and
            $0.10 per call and are not exercised by this benchmark.
          </li>
        </ul>
      </section>

      <section className="brutal-card">
        <h2 className="brutal-title" style={{ fontSize: 22, margin: '0 0 8px' }}>Run it yourself</h2>
        <p className="brutal-text" style={{ marginTop: 0 }}>
          The interactive lookup on the datasets page hits the same endpoint with no key, so you can spot-check any DOI
          in this table — including the controls that return no rows.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="brutal-btn brutal-btn--ink" href="/datasets">Try a DOI</Link>
          <Link className="brutal-btn" href="/datasets/retraction-integrity">How the graph is built</Link>
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
