import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import T from '@/components/T';
import TRich from '@/components/TRich';
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
    noteKey: 'integrity.notePapers',
  },
  {
    table: 'cites',
    rows: '144,814',
    fields: 'citing_id · cited_id · cited_doi · source_tier · source_uri',
    noteKey: 'integrity.noteCites',
  },
  {
    table: 'retraction_status',
    rows: '572',
    fields: 'paper_id · doi · source · source_tier · is_retracted · retraction_date',
    noteKey: 'integrity.noteStatus',
  },
];

const VERDICT_LABEL: Record<string, { key: string; bg: string }> = {
  retracted: { key: 'benchmark.verdictRetracted', bg: '#ff90e8' },
  not_retracted: { key: 'benchmark.verdictNotRetracted', bg: '#b8f2cf' },
  no_status_rows: { key: 'benchmark.verdictNoRows', bg: '#ffc700' },
  abstained: { key: 'benchmark.verdictAbstained', bg: '#a0d8ff' },
};

export default function IntegrityPage() {
  const rows = benchmark.rows as Row[];
  const verified = rows.filter((row) => row.verdict === 'retracted').slice(0, 8);
  const edgeCases = rows.filter((row) => row.verdict !== 'retracted');

  return (
    <main className="profile-shell">
      <nav style={{ marginBottom: 16, fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
        <Link className="brutal-link" href="/datasets"><T k="integrity.back" /></Link>
      </nav>

      <header className="brutal-card brutal-card--mint" style={{ marginBottom: 28 }}>
        <T as="p" className="brutal-kicker" k="integrity.kicker" />
        <T as="h1" className="brutal-title" style={{ fontSize: 38, margin: '6px 0 10px' }} k="integrity.title" />
        <p className="brutal-text" style={{ maxWidth: 780 }}>
          <TRich k="integrity.lead" slots={{ code: <code>ri-20261025-1526</code> }} />
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18, fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
          <span className="brutal-pill"><T k="integrity.pillPapers" params={{ n: '98,868' }} /></span>
          <span className="brutal-pill"><T k="integrity.pillEdges" params={{ n: '144,814' }} /></span>
          <span className="brutal-pill"><T k="integrity.pillStatusRows" params={{ n: '572' }} /></span>
          <span className="brutal-pill"><T k="integrity.pillTiers" /></span>
        </div>
      </header>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 12px' }} k="integrity.schemaTitle" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, minWidth: 640 }}>
            <thead>
              <tr>
                {['integrity.colTable', 'integrity.colRows', 'integrity.colFields', 'integrity.colWhy'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    <T k={head} />
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
                    <T k={table.noteKey} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="brutal-muted" style={{ fontSize: 13, marginBottom: 0 }}>
          <TRich
            k="integrity.tiersNote"
            slots={{
              a: <strong>A</strong>,
              c: <strong>C</strong>,
              code: <code>update-to</code>,
            }}
          />
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }} k="integrity.graphTitle" />
        <T as="p" className="brutal-text" style={{ marginTop: 0 }} k="integrity.graphLead" params={{ seeds: String(meta.stats.seed_count), citers: String(meta.stats.citer_count), edges: String(meta.stats.edge_count), multi: String(meta.stats.multi_citers) }} />
        <RetractionGraph />
        <T as="p" className="brutal-muted" style={{ fontSize: 13, marginTop: 10 }} k="integrity.graphCaption" />
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }} k="integrity.seedsTitle" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr>
                {['integrity.colPaper', 'benchmark.colYear', 'DOI', 'integrity.colRecorded', 'integrity.colCiters'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head === 'DOI' ? head : <T k={head} />}
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
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4' }}>{seed.retraction_date ?? <T k="integrity.noDate" />}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>{seed.citers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }} k="integrity.checkTitle" />
        <JudgeLookup />
      </section>

      <section className="brutal-card brutal-card--yellow" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 8px' }} k="integrity.liveTitle" params={{ n: String(benchmark.summary.n) }} />
        <T as="p" className="brutal-text" style={{ marginTop: 0 }} k="integrity.liveLead" params={{ date: benchmark.summary.queried_at, p50: String(benchmark.summary.p50_ms), max: String(benchmark.summary.max_ms) }} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, minWidth: 700 }}>
            <thead>
              <tr>
                {['DOI', 'benchmark.colYear', 'integrity.colSources', 'benchmark.colDate', 'ms'].map((head) => (
                  <th key={head} style={{ textAlign: 'left', padding: '8px', borderBottom: 'var(--brutal-border)' }}>
                    {head === 'DOI' || head === 'ms' ? head : <T k={head} />}
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

        <T as="h3" className="brutal-title" style={{ fontSize: 18, margin: '18px 0 8px' }} k="integrity.misreadTitle" />
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0 }}>
          {edgeCases.map((row) => {
            const style = VERDICT_LABEL[row.verdict] ?? { key: row.verdict, bg: '#eee' };
            return (
              <li key={row.doi} style={{ marginBottom: 8 }}>
                <span style={{ background: style.bg, border: '2px solid var(--ink)', borderRadius: 999, padding: '1px 8px', fontSize: 12, fontFamily: 'var(--brutal-mono)' }}>
                  {style.key ? <T k={style.key} /> : row.verdict}
                </span>{' '}
                <code>{row.doi}</code> — {row.title ?? <T k="integrity.noTitle" />} ({row.year ?? 'n/a'})
              </li>
            );
          })}
        </ul>
        <p className="brutal-text" style={{ marginBottom: 0 }}>
          <Link className="brutal-link" href="/benchmark"><T k="integrity.fullBenchmark" /></Link>
        </p>
      </section>

      <section className="brutal-card">
        <T as="h2" className="brutal-title" style={{ fontSize: 22, margin: '0 0 8px' }} k="integrity.getDataTitle" />
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
          <li>
            <TRich
              k="integrity.getData1"
              slots={{
                link: <a className="brutal-link" href="https://huggingface.co/datasets/ashesborn6/integrity-citation-retraction-graph" target="_blank" rel="noreferrer noopener">Hugging Face: ashesborn6/integrity-citation-retraction-graph</a>,
                code: <code>.jsonl.gz</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="integrity.getData2"
              slots={{
                link: <a className="brutal-link" href="https://github.com/sadofriod/graphrag-ts" target="_blank" rel="noreferrer noopener">graphrag-ts</a>,
              }}
            />
          </li>
          <li>
            <TRich
              k="integrity.getData3"
              slots={{
                code: <code>POST https://pay.ashesborn.cloud/api/v1/judge</code>,
              }}
            />
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
