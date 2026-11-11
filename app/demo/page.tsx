import type { Metadata } from 'next';
import Link from 'next/link';
import { isValidElement, type ReactNode } from 'react';
import T from '@/components/T';
import L10n from '@/components/L10n';
import graphMeta from '@/data/retraction-graph-meta.json';
import { getAllDemos, type LocalizedText } from '@/lib/demos';

export const metadata: Metadata = {
  title: 'Evidence demos',
  description: 'Browse evidence-backed conclusions, source excerpts, and research gaps across real corpora.',
  alternates: { canonical: 'https://blog.ashesborn.cloud/demo' },
  openGraph: { url: 'https://blog.ashesborn.cloud/demo' },
};

type DemoCard = {
  href: string;
  title: LocalizedText | ReactNode;
  subtitle: LocalizedText | ReactNode;
  count: number;
  countLabel: string;
  extra?: string;
  color: string;
  live: boolean;
};

function renderCardText(value: LocalizedText | ReactNode, as: 'h2' | 'p', className: string) {
  if (typeof value === 'object' && value !== null && !isValidElement(value) && 'en' in value) {
    return <L10n v={value as LocalizedText} as={as} className={className} />;
  }
  return as === 'h2' ? <h2 className={className}>{value}</h2> : <p className={className}>{value}</p>;
}

export default function DemoIndexPage() {
  const demos = getAllDemos();
  const cards: DemoCard[] = [
    ...demos.map((demo) => ({
      href: `/demo/${demo.id}`,
      title: demo.title,
      subtitle: demo.subtitle,
      count: demo.claims.length,
      countLabel: 'demo.claimsCount',
      extra: undefined as string | undefined,
      color: demo.id === 'ldo' ? 'demo-card--pink' : 'demo-card--blue',
      live: false,
    })),
    {
      href: '/datasets',
      title: <T k="demo.cardDoiTitle" />,
      subtitle: <T k="demo.cardDoiSubtitle" />,
      count: graphMeta.stats.seed_count,
      countLabel: 'demo.doiSeeds',
      extra: `${graphMeta.stats.citer_count} citers in the snapshot`,
      color: 'demo-card--yellow',
      live: true,
    },
  ];

  return (
    <main className="profile-shell demo-index">
      <header className="demo-index__intro">
        <p className="brutal-kicker"><T k="demo.kicker" /></p>
        <h1 className="demo-index__title"><T k="demo.title" /></h1>
        <p className="brutal-text"><T k="demo.description" /></p>
      </header>
      <div className="demo-index__grid">
        {cards.map((card) => (
          <article className={`brutal-card demo-card ${card.color}`} key={card.href}>
            {renderCardText(card.title, 'h2', 'demo-card__title')}
            {renderCardText(card.subtitle, 'p', 'demo-card__subtitle')}
            <p className="demo-card__stat">
              <strong>{card.count}</strong>{' '}
              <T k={card.countLabel} />
            </p>
            {card.extra && <p className="demo-card__live">{card.extra}</p>}
            {card.live && <p className="demo-card__live"><T k="demo.alreadyLive" /></p>}
            <Link className="brutal-btn demo-card__link" href={card.href}>
              <T k="demo.view" /> →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
