import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import T from '@/components/T';
import TRich from '@/components/TRich';
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

type DatasetCard = {
  id: string;
  kindKey: string;
  titleKey: string;
  license?: string;
  licenseKey?: string;
  licenseUrl: string;
  priceKey: string;
  price?: string;
  counts: Array<{ labelKey: string; value?: string; valueKey?: string }>;
  sourcesKey: string;
  href: string;
  hrefLabel?: string;
  hrefLabelKey?: string;
  bodyKey: string;
};

const DATASETS: DatasetCard[] = [
  {
    id: 'integrity-citation-retraction-graph',
    kindKey: 'datasets.card.graph.kind',
    titleKey: 'datasets.card.graph.title',
    license: 'CC0-1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    priceKey: 'datasets.card.graph.price',
    counts: [
      { labelKey: 'datasets.card.graph.count0', value: '98,868' },
      { labelKey: 'datasets.card.graph.count1', value: '144,814' },
      { labelKey: 'datasets.card.graph.count2', value: '572' },
      { labelKey: 'datasets.card.graph.count3', value: 'ri-20261025-1526' },
    ],
    sourcesKey: 'datasets.card.graph.sources',
    href: 'https://huggingface.co/datasets/ashesborn6/integrity-citation-retraction-graph',
    hrefLabel: 'Hugging Face',
    bodyKey: 'datasets.card.graph.body',
  },
  {
    id: 'retraction-propagation',
    kindKey: 'datasets.card.propagation.kind',
    titleKey: 'datasets.card.propagation.title',
    licenseKey: 'datasets.card.propagation.license',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    priceKey: 'datasets.card.propagation.price',
    counts: [
      { labelKey: 'datasets.card.propagation.count0', valueKey: 'datasets.card.propagation.value0' },
      { labelKey: 'datasets.card.propagation.count1', valueKey: 'datasets.card.propagation.value1' },
      { labelKey: 'datasets.card.propagation.count2', valueKey: 'datasets.card.propagation.value2' },
    ],
    sourcesKey: 'datasets.card.propagation.sources',
    href: 'https://github.com/sadofriod/graphrag-ts',
    hrefLabel: 'GitHub',
    bodyKey: 'datasets.card.propagation.body',
  },
  {
    id: 'web3-security',
    kindKey: 'datasets.card.web3.kind',
    titleKey: 'datasets.card.web3.title',
    license: 'MIT',
    licenseUrl: 'https://github.com/sadofriod/graphrag-ts/blob/main/LICENSE',
    priceKey: 'datasets.card.web3.price',
    counts: [
      { labelKey: 'datasets.card.web3.count0', value: '11' },
      { labelKey: 'datasets.card.web3.count1', value: '13' },
      { labelKey: 'datasets.card.web3.count2', value: '5' },
      { labelKey: 'datasets.card.web3.count3', value: '5' },
    ],
    sourcesKey: 'datasets.card.web3.sources',
    href: 'https://github.com/sadofriod/graphrag-ts/tree/main/examples/web3-smart-contract-security',
    hrefLabelKey: 'datasets.card.web3.hrefLabel',
    bodyKey: 'datasets.card.web3.body',
  },
];
export default function DatasetsPage() {
  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue" style={{ marginBottom: 28 }}>
        <T as="p" className="brutal-kicker" k="datasets.kicker" />
        <T as="h1" className="brutal-title" style={{ fontSize: 40, margin: '6px 0 10px' }} k="datasets.title" />
        <p className="brutal-text" style={{ maxWidth: 760 }}>
          <TRich k="datasets.lead" slots={{ strong: <strong><T k="datasets.leadSlot" /></strong> }} />
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <Link className="brutal-btn brutal-btn--ink" href="/datasets/retraction-integrity">
            <T k="datasets.ctaHowItWorks" />
          </Link>
          <Link className="brutal-btn" href="/benchmark">
            <T k="datasets.ctaBenchmark" />
          </Link>
        </div>
      </header>

      <JudgeLookup />

      <section style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 28, margin: '0 0 14px' }} k="datasets.threeDatasets" />
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {DATASETS.map((dataset, index) => (
            <article key={dataset.id} className={`brutal-card${index === 1 ? ' brutal-card--mint' : ''}`}>
              <T k={dataset.kindKey} as="p" className="brutal-kicker" style={{ margin: 0 }} />
              <T k={dataset.titleKey} as="h3" className="brutal-title" style={{ fontSize: 22, margin: '6px 0 8px' }} />
              <T k={dataset.bodyKey} as="p" className="brutal-text" style={{ marginTop: 0, fontSize: 15 }} />
              <dl style={{ margin: '12px 0', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, fontSize: 13 }}>
                {dataset.counts.map((count) => (
                  <div key={count.labelKey} style={{ border: '2px solid var(--ink)', borderRadius: 4, padding: '6px 8px', background: '#fff' }}>
                    <dt style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}><T k={count.labelKey} /></dt>
                    <dd style={{ margin: '2px 0 0', fontFamily: 'var(--brutal-mono)', fontWeight: 600 }}>{count.valueKey ? <T k={count.valueKey} /> : count.value}</dd>
                  </div>
                ))}
              </dl>
              <p style={{ fontSize: 13, margin: '0 0 6px' }}>
                <strong><T k="datasets.sourcesLabel" /></strong>{' '}<T k={dataset.sourcesKey} />
              </p>
              <p style={{ fontSize: 13, margin: '0 0 12px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <a className="brutal-pill" href={dataset.licenseUrl} target="_blank" rel="noreferrer noopener">
                  {dataset.licenseKey ? <T k={dataset.licenseKey} /> : dataset.license}
                </a>
                <span className="brutal-pill">{dataset.priceKey ? <T k={dataset.priceKey} /> : dataset.price}</span>
              </p>
              <a className="brutal-link" href={dataset.href} target="_blank" rel="noreferrer noopener">
                {dataset.hrefLabelKey ? <T k={dataset.hrefLabelKey} /> : dataset.hrefLabel}{' →'}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="brutal-card" style={{ marginBottom: 28 }}>
        <T as="h2" className="brutal-title" style={{ fontSize: 28, margin: '0 0 12px' }} k="datasets.conclusionsTitle" />
        <ul className="brutal-text" style={{ paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
          <li>
            <TRich
              k="datasets.conclusions1"
              slots={{
                strong: <strong><T k="datasets.conclusions1Slot" /></strong>,
                code: <code>abstention_reason: paper_not_in_snapshot</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.conclusions2"
              slots={{
                strong: <strong><T k="datasets.conclusions2Slot" /></strong>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.conclusions3"
              slots={{
                strong: <strong><T k="datasets.conclusions3Slot" /></strong>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.conclusions4"
              slots={{
                strong: <strong><T k="datasets.conclusions4Slot" /></strong>,
                code: <code>update-to</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.conclusions5"
              slots={{
                strong: <strong><T k="datasets.conclusions5Slot" /></strong>,
              }}
            />
          </li>
        </ul>
      </section>

      <section className="brutal-card brutal-card--yellow">
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }} k="datasets.endpointsTitle" />
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
              GET https://pay.ashesborn.cloud/api/v1/judge/paper?doi={'{doi}'}
            </code>
            <p style={{ margin: '4px 0 0' }}><T k="datasets.endpointFree" /></p>
          </div>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>GET https://pay.ashesborn.cloud/api/v1/datasets</code>
            <p style={{ margin: '4px 0 0' }}><T k="datasets.endpointCatalogue" /></p>
          </div>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
              POST https://pay.ashesborn.cloud/api/v1/judge
            </code>
            <p style={{ margin: '4px 0 0' }}>
              <TRich k="datasets.endpointPaid" slots={{ code: <code>payment-required</code> }} />
            </p>
          </div>
          <div>
            <code style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>https://mcp.ashesborn.cloud/mcp</code>
            <p style={{ margin: '4px 0 0' }}>
              <TRich
                k="datasets.endpointMcp"
                slots={{
                  strong: <strong><T k="datasets.endpointMcpSlot" /></strong>,
                  code1: <code>integrity_paper_status</code>,
                  code2: <code>retraction_propagation</code>,
                  code3: <code>integrity_evidence_audit</code>,
                  code4: <code>payment_required</code>,
                }}
              />
            </p>
          </div>
        </div>
      </section>

      <section className="brutal-card brutal-card--mint">
        <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '0 0 10px' }} k="datasets.mcpTitle" />
        <p className="brutal-text" style={{ marginTop: 0 }}>
          <TRich
            k="datasets.mcpLead"
            slots={{
              code1: <code>initialize</code>,
              code2: <code>tools/list</code>,
            }}
          />
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
            <TRich
              k="datasets.mcpStep1"
              slots={{
                code1: <code>integrity_paper_status</code>,
                code2: <code>{'{"doi":"10.1016/S0140-6736(97)11096-0"}'}</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.mcpStep2"
              slots={{
                code1: <code>retraction_propagation</code>,
                code2: <code>integrity_evidence_audit</code>,
                code3: <code>payment_required</code>,
                code4: <code>POST https://pay.ashesborn.cloud/api/v1/judge</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.mcpStep3"
              slots={{
                code1: <code>initialize</code>,
                code2: <code>mcp-session-id</code>,
              }}
            />
          </li>
          <li>
            <TRich
              k="datasets.mcpStep4"
              slots={{
                link: <Link className="brutal-link" href="/blog/x402-integration-http-and-mcp"><T k="datasets.mcpStep4Link" /></Link>,
              }}
            />
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
