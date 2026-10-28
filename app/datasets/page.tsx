import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import JudgeLookup from '@/components/JudgeLookup';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';

export const metadata: Metadata = {
  title: 'Datasets: retraction integrity and citation graphs you can query',
  description:
    'Three queryable datasets from Ashes Born: a CC0 citation and retraction graph (98,868 papers, 144,814 citation edges, 572 retraction status rows), a deterministic retraction-propagation judgment, and a synthetic smart-contract security corpus. Free status lookup, per-call pricing, schema and licenses.',
  keywords:
    'retraction dataset, citation graph dataset, CC0 dataset, retraction watch API, paper integrity dataset, GraphRAG dataset, DOI retraction check, research integrity data',
  alternates: { canonical: `${SITE}/datasets` },
  openGraph: {
    type: 'website',
    url: `${SITE}/datasets`,
    title: 'Datasets: retraction integrity and citation graphs you can query',
    description:
      'A CC0 retraction and citation graph with a free per-DOI lookup, a deterministic propagation judgment, and the schema behind both.',
  },
};

const DATASETS = [
  {
    id: 'integrity-citation-retraction-graph',
    title: 'Citation + retraction integrity graph',
    kind: 'Graph dataset',
    license: 'CC0-1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    price: 'Free to download',
    counts: [
      ['Papers (nodes)', '98,868'],
      ['Citation edges', '144,814'],
      ['Retraction status rows', '572'],
      ['Snapshot', 'ri-20261025-1526'],
    ],
    sources: 'OpenAlex works and references, Crossref update-to relations, Retraction Watch (reason and nature free text excluded).',
    href: 'https://huggingface.co/datasets/ashesborn6/integrity-citation-retraction-graph',
    hrefLabel: 'Hugging Face',
    body:
      'Three tables with stable IDs: papers, citations, and one row per (paper, source) retraction assertion with a source tier. Enough to rebuild the citation neighbourhood of a retracted paper offline, or to audit how a judgment was reached.',
  },
  {
    id: 'retraction-propagation',
    title: 'Retraction propagation judgment',
    kind: 'Judgment API',
    license: 'CC0-1.0 data, hosted judgment',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    price: '$0.02 per call',
    counts: [
      ['Output', 'verdict + confidence'],
      ['Per call', 'deterministic, 0 LLM tokens'],
      ['Evidence', 'retracted roots, depth, agreement'],
    ],
    sources: 'Same snapshot as the graph dataset.',
    href: 'https://github.com/sadofriod/graphrag-ts',
    hrefLabel: 'GitHub',
    body:
      'Give it a DOI, get back whether its claims rest on retracted work: verdict (CLEAR / CONTESTED / …), confidence with its basis, reference coverage, retracted roots with depth and per-source agreement, conflict flags, and evidence-path length. No model in the loop, so two calls with the same snapshot agree.',
  },
  {
    id: 'web3-security',
    title: 'Synthetic smart-contract security relations',
    kind: 'Synthetic corpus',
    license: 'MIT',
    licenseUrl: 'https://github.com/sadofriod/graphrag-ts/blob/main/LICENSE',
    price: '$0.02 local / $0.10 global query',
    counts: [
      ['Entities', '11'],
      ['Relations', '13'],
      ['Source excerpts', '5'],
      ['Evaluation questions', '5'],
    ],
    sources: 'Original fictional audit corpus shipped with graphrag-ts. Every contract, dependency and incident is invented.',
    href: 'https://github.com/sadofriod/graphrag-ts/tree/main/examples/web3-smart-contract-security',
    hrefLabel: 'Source',
    body:
      'A worked example of what a curated “data with judgments” delivery looks like: source-grounded JSONL, a PostgreSQL load script, and a Markdown corpus you can index with the GraphRAG MCP server. Use it to evaluate the pipeline without touching your own documents.',
  },
];

export default function DatasetsPage() {
  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue" style={{ marginBottom: 28 }}>
        <p className="brutal-kicker">Datasets</p>
        <h1 className="brutal-title" style={{ fontSize: 40, margin: '6px 0 10px' }}>
          Data with judgments, not just documents
        </h1>
        <p className="brutal-text" style={{ maxWidth: 760 }}>
          Retrieval returns passages. These datasets return <strong>decisions you can check</strong>: a paper is
          retracted or it is not, a claim rests on retracted work or it does not, and every answer names the source
          row it came from. Start with the free DOI lookup below — it runs against the live snapshot and needs no key,
          no account and no model.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <Link className="brutal-btn brutal-btn--ink" href="/datasets/retraction-integrity">
            How the integrity graph works
          </Link>
          <Link className="brutal-btn" href="/benchmark">
            Measured benchmark
          </Link>
        </div>
      </header>

      <JudgeLookup />

      <section style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 28, margin: '0 0 14px' }}>The three datasets</h2>
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {DATASETS.map((dataset, index) => (
            <article key={dataset.id} className={`brutal-card${index === 1 ? ' brutal-card--mint' : ''}`}>
              <p className="brutal-kicker" style={{ margin: 0 }}>{dataset.kind}</p>
              <h3 className="brutal-title" style={{ fontSize: 22, margin: '6px 0 8px' }}>{dataset.title}</h3>
              <p className="brutal-text" style={{ marginTop: 0, fontSize: 15 }}>{dataset.body}</p>
              <dl style={{ margin: '12px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, fontSize: 13 }}>
                {dataset.counts.map(([label, value]) => (
                  <div key={label} style={{ border: '2px solid var(--ink)', borderRadius: 4, padding: '6px 8px', background: '#fff' }}>
                    <dt style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}>{label}</dt>
                    <dd style={{ margin: '2px 0 0', fontFamily: 'var(--brutal-mono)', fontWeight: 600 }}>{value}</dd>
                  </div>
                ))}
              </dl>
              <p style={{ fontSize: 13, margin: '0 0 6px' }}>
                <strong>Sources:</strong> {dataset.sources}
              </p>
              <p style={{ fontSize: 13, margin: '0 0 12px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <a className="brutal-pill" href={dataset.licenseUrl} target="_blank" rel="noreferrer noopener">
                  {dataset.license}
                </a>
                <span className="brutal-pill">{dataset.price}</span>
              </p>
              <a className="brutal-link" href={dataset.href} target="_blank" rel="noreferrer noopener">
                {dataset.hrefLabel} →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <h2 className="brutal-title" style={{ fontSize: 28, margin: '0 0 12px' }}>What you can and cannot conclude</h2>
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
          <li>
            <strong>An abstention is an answer.</strong> When a DOI is outside the snapshot, the response says so
            (<code>abstention_reason: paper_not_in_snapshot</code>) instead of guessing “clean”.
          </li>
          <li>
            <strong>“No status rows” is not “not retracted”.</strong> A paper can be in the graph with no source
            asserting either way. The dataset page shows both cases side by side.
          </li>
          <li>
            <strong>The public graph is a neighbourhood sample.</strong> It is 12 retracted seeds with up to 60 citing
            works each plus their reference lists — not the whole scholarly record.
          </li>
          <li>
            <strong>Source tiering is explicit.</strong> Tier A means a registry that records retractions directly
            (Crossref <code>update-to</code>, Retraction Watch); tier C means an index-derived flag (OpenAlex). A
            judgment that mixes them shows the mixture.
          </li>
          <li>
            <strong>No reason text.</strong> Retraction Watch reason and nature free text are deliberately excluded, so
            a judgment never turns a retraction into an accusation of misconduct by paraphrase.
          </li>
        </ul>
      </section>

      <section className="brutal-card brutal-card--yellow">
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }}>Endpoints</h2>
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
              GET https://pay.ashesborn.cloud/api/v1/judge/paper?doi={'{doi}'}
            </code>
            <p style={{ margin: '4px 0 0' }}>Free, no auth, CORS open. Paper-level status from every covering source.</p>
          </div>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>GET https://pay.ashesborn.cloud/api/v1/datasets</code>
            <p style={{ margin: '4px 0 0' }}>Machine-readable catalogue: IDs, licenses, pricing, tags.</p>
          </div>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
              POST https://pay.ashesborn.cloud/api/v1/judge
            </code>
            <p style={{ margin: '4px 0 0' }}>
              Paid per call through the x402 flow ($0.02 propagation, $0.10 evidence audit); the challenge arrives in
              the <code>payment-required</code> header.
            </p>
          </div>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>https://mcp.ashesborn.cloud/mcp</code>
            <p style={{ margin: '4px 0 0' }}>
              MCP server (Streamable HTTP). <strong>Anonymous read tier:</strong>{' '}
              <code>integrity_paper_status</code> answers with no credential, so a client can call it the moment it
              connects. <code>retraction_propagation</code> ($0.02) and <code>integrity_evidence_audit</code> ($0.10)
              are paid calls and return <code>payment_required</code> to an anonymous session; indexing and the
              corpus-query tools need a credential.
            </p>
          </div>
        </div>
      </section>

      <section className="brutal-card brutal-card--mint">
        <h2 className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }}>Connect an MCP client</h2>
        <p className="brutal-text" style={{ marginTop: 0 }}>
          Points at the same snapshot the pages above use. No key for the free status tool; the server answers{' '}
          <code>initialize</code> and <code>tools/list</code> anonymously so a client can discover it first and decide
          about the paid calls later.
        </p>
        <pre
          style={{
            background: '#111',
            color: '#f7f3e8',
            padding: 14,
            borderRadius: 4,
            overflowX: 'auto',
            fontSize: 12,
            margin: '0 0 12px',
          }}
        >
{`{
  "mcpServers": {
    "retraction-integrity": {
      "type": "http",
      "url": "https://mcp.ashesborn.cloud/mcp"
    }
  }
}`}
        </pre>
        <ol className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
          <li>
            Call <code>integrity_paper_status</code> with <code>{'{"doi":"10.1016/S0140-6736(97)11096-0"}'}</code> — the
            same shape the browser lookup returns. Free, no key.
          </li>
          <li>
            <code>retraction_propagation</code> and <code>integrity_evidence_audit</code> answer{' '}
            <code>payment_required</code> without a credential. Pay per call through{' '}
            <code>POST https://pay.ashesborn.cloud/api/v1/judge</code> (x402 on Base) or bring a credential.
          </li>
          <li>
            Sessions expire; re-<code>initialize</code> rather than reusing a stale <code>mcp-session-id</code>.
          </li>
        </ol>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Dataset',
              '@id': `${SITE}/datasets#integrity-graph`,
              name: 'Citation and retraction integrity graph',
              description:
                'Papers, citation edges and per-source retraction assertions assembled from OpenAlex, Crossref update-to relations and Retraction Watch. 98,868 papers, 144,814 citation edges, 572 retraction status rows.',
              license: 'https://creativecommons.org/publicdomain/zero/1.0/',
              isAccessibleForFree: true,
              creator: { '@type': 'Organization', name: 'Ashes Born', url: 'https://ashesborn.cloud' },
              dateModified: '2026-10-25',
              version: 'ri-20261025-1526',
              keywords: ['retraction', 'citation graph', 'research integrity', 'OpenAlex', 'Crossref', 'Retraction Watch'],
              distribution: [
                {
                  '@type': 'DataDownload',
                  contentUrl:
                    'https://huggingface.co/datasets/ashesborn6/integrity-citation-retraction-graph',
                  encodingFormat: 'application/jsonl+gzip',
                },
                {
                  '@type': 'WebAPI',
                  name: 'Retraction status lookup',
                  documentation: `${SITE}/datasets/retraction-integrity`,
                  endpointUrl: 'https://pay.ashesborn.cloud/api/v1/judge/paper',
                },
              ],
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Is the DOI retraction lookup free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. GET https://pay.ashesborn.cloud/api/v1/judge/paper?doi=… returns paper-level retraction status with no key and no account. The propagation and evidence-audit judgments are the paid endpoints.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What does an abstention mean?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The paper is outside the current snapshot, so the service declines to judge it instead of reporting “not retracted”. The reason is returned in the abstention_reason field.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I use the dataset commercially?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The integrity graph is published under CC0-1.0, so no attribution is legally required, though a link back is appreciated. The synthetic smart-contract corpus is MIT.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How current is the data?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The published snapshot is ri-20261025-1526, built on 2026-10-25. Every response carries the snapshot that produced it, and retraction dates are reported per source.',
                  },
                },
              ],
            },
          ],
        }}
      />
    </main>
  );
}
