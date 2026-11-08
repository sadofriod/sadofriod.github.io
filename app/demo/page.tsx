import type { Metadata } from 'next';
import Link from 'next/link';
import T from '@/components/T';
import graphMeta from '@/data/retraction-graph-meta.json';
import { getAllDemos } from '@/lib/demos';

export const metadata: Metadata = {
  title: 'Evidence demos',
  description: 'Browse evidence-backed conclusions, source excerpts, and research gaps across real corpora.',
};

export default function DemoIndexPage() {
  const demos = getAllDemos();
  const cards = [
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
            <h2 className="demo-card__title">{card.title}</h2>
            <p className="demo-card__subtitle">{card.subtitle}</p>
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
