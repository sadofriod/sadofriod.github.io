import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import JudgeLookup from '@/components/JudgeLookup';
import RetractionGraph from '@/components/RetractionGraph';
import benchmark from '@/data/judge-benchmark.json';
import meta from '@/data/retraction-graph-meta.json';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';

export const metadata: Metadata = {
  title: 'Inside the retraction integrity graph: schema, sources and a live citation neighbourhood',
  description:
    'Field-by-field schema of the CC0 retraction and citation graph: papers, citation edges and per-source retraction assertions with tiers. Includes 20 DOIs measured against the free lookup and an interactive rendering of 12 retracted papers and their 781 citing works.',
  keywords:
    'retraction integrity graph schema, citation network visualization, Retraction Watch data, Crossref update-to, OpenAlex retraction, research integrity dataset, 撤稿 数据 图谱',
  alternates: { canonical: `${SITE}/datasets/retraction-integrity` },
  openGraph: {
    type: 'article',
    url: `${SITE}/datasets/retraction-integrity`,
    title: 'Inside the retraction integrity graph',
    description:
      'Schema, source tiers and a rendered citation neighbourhood of 12 retracted papers, plus 20 DOIs measured against the free lookup.',
  },
};

type Row = (typeof benchmark.rows)[number];

const SCHEMA = [
  {
    table: 'papers',
    rows: '98,868',
    fields: 'paper_id · doi · title · publication_year · openalex_is_retracted · cited_by_count',
    note: 'One row per work. paper_id is the OpenAlex ID and stays stable across snapshots, which is what makes incremental builds possible.',
  },
  {
    table: 'cites',
    rows: '144,814',
    fields: 'citing_id · cited_id · cited_doi · source_tier · source_uri',
    note: 'Directed edges: citing_id cites cited_id. cited_doi is null when the reference has no DOI, so do not join on DOI alone.',
  },
  {
    table: 'retraction_status',
    rows: '572',
    fields: 'paper_id · doi · source · source_tier · is_retracted · retraction_date',
    note: 'One row per (paper, source) assertion. A paper can have three rows that disagree; the judgment layer reports the disagreement instead of picking a winner silently.',
  },
];

const VERDICT_LABEL: Record<string, { label: string; bg: string }> = {
  retracted: { label: 'retracted', bg: '#ff90e8' },
  not_retracted: { label: 'not retracted', bg: '#b8f2cf' },
  no_status_rows: { label: 'no status rows', bg: '#ffc700' },
  abstained: { label: 'abstained', bg: '#a0d8ff' },
};

export default function IntegrityPage() {
  const rows = benchmark.rows as Row[];
  const verified = rows.filter((row) => row.verdict === 'retracted').slice(0, 8);
  const edgeCases = rows.filter((row) => row.verdict !== 'retracted');

  return (
    <main className="profile-shell">
      <nav style={{ marginBottom: 16, fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
        <Link className="brutal-link" href="/datasets">← All datasets</Link>
      </nav>

      <header className="brutal-card brutal-card--mint" style={{ marginBottom: 28 }}>
        <p className="brutal-kicker">Dataset walkthrough</p>
        <h1 className="brutal-title" style={{ fontSize: 38, margin: '6px 0 10px' }}>
          A retraction graph you can audit line by line
        </h1>
        <p className="brutal-text" style={{ maxWidth: 780 }}>
          Retraction is not a boolean that arrives from one authority. Crossref records an update relation, Retraction
          Watch records a notice, OpenAlex carries an index flag — and they disagree. This dataset keeps every assertion
          as its own row, with the source that made it, so a downstream judgment can show its work instead of asserting
          a conclusion. Published under CC0-1.0, snapshot <code>ri-20261025-1526</code>.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18, fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
          <span className="brutal-pill">98,868 papers</span>
          <span className="brutal-pill">144,814 citation edges</span>
          <span className="brutal-pill">572 status rows</span>
          <span className="brutal-pill">3 source tiers</span>
        </div>
      </header>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 12px' }}>Schema</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, minWidth: 640 }}>
            <thead>
              <tr>
                {['Table', 'Rows', 'Fields', 'Why it is shaped this way'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEMA.map((table) => (
                <tr key={table.table}>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)', verticalAlign: 'top' }}>
                    {table.table}
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e6e0d4', verticalAlign: 'top' }}>
                    {table.rows}
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)', fontSize: 12, verticalAlign: 'top' }}>
                    {table.fields}
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #e6e0d4', verticalAlign: 'top' }}>
                    {table.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="brutal-muted" style={{ fontSize: 13, marginBottom: 0 }}>
          Source tiers: <strong>A</strong> = a registry that records retractions directly (Crossref{' '}
          <code>update-to</code>, Retraction Watch); <strong>C</strong> = index-derived flag (OpenAlex). Retraction Watch
          reason and nature free text is excluded from the release, so no row can be misread as a misconduct finding.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }}>The graph, rendered</h2>
        <p className="brutal-text" style={{ marginTop: 0 }}>
          {meta.stats.seed_count} retracted papers, {meta.stats.citer_count} distinct works that cite at least one of
          them, {meta.stats.edge_count} edges. {meta.stats.multi_citers} papers cite two or more retracted works — the
          yellow nodes — which is exactly the population where “is my claim downstream of a retraction?” stops being a
          lookup and becomes a graph question.
        </p>
        <RetractionGraph />
        <p className="brutal-muted" style={{ fontSize: 13, marginTop: 10 }}>
          Rendered client-side from a 115 KB nodes/edges payload built from the published JSONL, no external chart
          library. Hover a node for its title; click a seed to isolate the works that cite it.
        </p>
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }}>The twelve seeds</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr>
                {['Retracted paper', 'Year', 'DOI', 'Recorded retraction', 'Citing works'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meta.seeds.map((seed) => (
                <tr key={seed.id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4' }}>{seed.title}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4' }}>{seed.year ?? '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)', fontSize: 12 }}>
                    {seed.doi ? (
                      <a className="brutal-link" href={`https://doi.org/${seed.doi}`} target="_blank" rel="noreferrer noopener">
                        {seed.doi}
                      </a>
                    ) : (
                      seed.id
                    )}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4' }}>{seed.retraction_date ?? 'in record, no date'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>{seed.citers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }}>Check a DOI yourself</h2>
        <JudgeLookup />
      </section>

      <section className="brutal-card brutal-card--yellow" style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }}>
          What the live lookup returned for {benchmark.summary.n} DOIs
        </h2>
        <p className="brutal-text" style={{ marginTop: 0 }}>
          Queried {benchmark.summary.queried_at}. Median round trip {benchmark.summary.p50_ms} ms, slowest{' '}
          {benchmark.summary.max_ms} ms. Retracted cases below; the edge cases that matter are underneath.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, minWidth: 700 }}>
            <thead>
              <tr>
                {['DOI', 'Year', 'Sources', 'Retraction date', 'ms'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {verified.map((row) => (
                <tr key={row.doi}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)', fontSize: 12 }}>
                    <a className="brutal-link" href={`https://doi.org/${row.doi}`} target="_blank" rel="noreferrer noopener">
                      {row.doi}
                    </a>
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4' }}>{row.year ?? '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>{row.tiers}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4' }}>{row.date ?? '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>{row.ms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="brutal-title" style={{ fontSize: 18, margin: '18px 0 8px' }}>The three answers people misread</h3>
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0 }}>
          {edgeCases.map((row) => {
            const style = VERDICT_LABEL[row.verdict] ?? { label: row.verdict, bg: '#eee' };
            return (
              <li key={row.doi} style={{ marginBottom: 8 }}>
                <span style={{ background: style.bg, border: '2px solid var(--ink)', borderRadius: 999, padding: '1px 8px', fontSize: 12, fontFamily: 'var(--brutal-mono)' }}>
                  {style.label}
                </span>{' '}
                <code>{row.doi}</code> — {row.title ?? 'no title'} ({row.year ?? 'n/a'})
              </li>
            );
          })}
        </ul>
        <p className="brutal-text" style={{ marginBottom: 0 }}>
          <Link className="brutal-link" href="/benchmark">Full benchmark, method and limitations →</Link>
        </p>
      </section>

      <section className="brutal-card">
        <h2 className="brutal-title" style={{ fontSize: 22, margin: '0 0 8px' }}>Get the data</h2>
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
          <li>
            <a className="brutal-link" href="https://huggingface.co/datasets/ashesborn6/integrity-citation-retraction-graph" target="_blank" rel="noreferrer noopener">
              Hugging Face: ashesborn6/integrity-citation-retraction-graph
            </a>{' '}
            — three <code>.jsonl.gz</code> files plus a manifest with row counts and SHA-256 per file.
          </li>
          <li>
            <a className="brutal-link" href="https://github.com/sadofriod/graphrag-ts" target="_blank" rel="noreferrer noopener">
              graphrag-ts
            </a>{' '}
            — the engine that builds the snapshot and answers from it.
          </li>
          <li>
            Hosted judgment: <code>POST https://pay.ashesborn.cloud/api/v1/judge</code> ($0.02 propagation, $0.10
            evidence audit via x402).
          </li>
        </ul>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'Citation and retraction integrity graph',
          url: `${SITE}/datasets/retraction-integrity`,
          description:
            'Papers, citation edges and per-source retraction assertions, with source tiers. 98,868 papers, 144,814 citation edges and 572 retraction status rows in snapshot ri-20261025-1526.',
          license: 'https://creativecommons.org/publicdomain/zero/1.0/',
          isAccessibleForFree: true,
          version: 'ri-20261025-1526',
          dateModified: '2026-10-25',
          temporalCoverage: '1990/2026',
          creator: { '@type': 'Organization', name: 'Ashes Born', url: 'https://ashesborn.cloud' },
          variableMeasured: ['retraction status', 'citation relations', 'source tier', 'retraction date'],
          keywords: ['retraction', 'citation graph', 'research integrity', 'scientometrics'],
        }}
      />
    </main>
  );
}
