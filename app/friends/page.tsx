import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import T from '@/components/T';
import { friendHost, getFriendsByGroup } from '@/lib/friends';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';
const COLLECTION_TOPIC = 'https://www.v2ex.com/t/1251306';
const DESCRIPTION = 'Ashes Space 的友链收藏，按组整理独立博客、技术作者与权威参考，涵盖 GraphRAG、RAG、TypeScript 和 Postgres 向量检索。每个站点均经人工筛选，附简介与标签，也欢迎通过邮件或 V2EX 申请友链交换。';

export const metadata: Metadata = {
  title: '友情链接 · 独立博客与 GraphRAG / RAG 参考 | Ashes Space',
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE}/friends`,
  },
};

export default function FriendsPage() {
  const groups = getFriendsByGroup();
  const friends = [...groups.friends, ...groups.resources];
  const sections = [
    {
      id: 'friends',
      titleKey: 'friends.sectionFriends',
      descriptionKey: 'friends.sectionFriendsDesc',
      links: groups.friends,
    },
    {
      id: 'resources',
      titleKey: 'friends.sectionResources',
      descriptionKey: 'friends.sectionResourcesDesc',
      links: groups.resources,
    },
  ];

  return (
    <main className="profile-shell friend-shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: '友情链接 · 独立博客与 GraphRAG / RAG 参考 | Ashes Space',
          url: `${SITE}/friends`,
          description: DESCRIPTION,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Ashes Space',
            url: `${SITE}/`,
          },
          mainEntity: {
            '@type': 'ItemList',
            name: '友情链接与参考资源',
            url: `${SITE}/friends`,
            numberOfItems: friends.length,
            itemListElement: friends.map((friend, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'WebSite',
                name: friend.name,
                url: friend.url,
                description: friend.blurb,
              },
            })),
          },
        }}
      />

      <header className="brutal-card brutal-card--pink friend-hero">
        <T className="brutal-kicker" as="p" k="friends.kicker" />
        <T as="h1" className="profile-hero__name" k="friends.title" />
        <T as="p" className="brutal-text friend-hero__subtitle" k="friends.subtitle" />
        <p className="brutal-text">
          <T k="friends.introLead" />{' '}
          <a className="brutal-link" href="mailto:justlikeashes@gmail.com">justlikeashes@gmail.com</a>
          <T k="friends.introTail" />{' '}
          <a className="brutal-link" href={COLLECTION_TOPIC} target="_blank" rel="noopener">
            <T k="friends.v2ex" />
          </a>
        </p>
        <T
          as="span"
          className="brutal-pill friend-pill"
          k="friends.collected"
          params={{ count: String(friends.length) }}
        />
      </header>

      {sections.map((section) => (
        <section className="friend-section" key={section.id} aria-labelledby={`friend-${section.id}-title`}>
          <T as="h2" className="brutal-title" id={`friend-${section.id}-title`} k={section.titleKey} />
          <T as="p" className="brutal-text" k={section.descriptionKey} />
          {section.links.length > 0 ? (
            <div className="friend-grid">
              {section.links.map((friend) => (
                <a
                  className="brutal-card friend-card"
                  key={friend.id}
                  href={friend.url}
                  target="_blank"
                  rel="noopener"
                  title={`${friend.name}：${friend.blurb}`}
                >
                  <h3 className="brutal-title friend-card__title">{friend.name}</h3>
                  <p className="friend-host brutal-muted">{friendHost(friend.url)}</p>
                  <p className="brutal-text">{friend.blurb}</p>
                  {friend.tags?.length ? (
                    <div className="friend-tags">
                      {friend.tags.map((tag, index) => (
                        <span className="brutal-pill friend-pill" key={`${tag}-${index}`}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      ))}

      {friends.length === 0 ? (
        <section className="brutal-card brutal-card--blue">
          <T as="p" className="brutal-kicker" k="friends.collectingKicker" />
          <T as="h2" className="brutal-title" k="friends.collectingTitle" />
          <T as="p" className="brutal-text" k="friends.collectingBody" />
          <a className="brutal-link" href={COLLECTION_TOPIC} target="_blank" rel="noreferrer noopener">
            <T k="friends.collectingCta" />
          </a>
        </section>
      ) : null}

      <section className="brutal-card brutal-card--mint" aria-labelledby="friend-apply-title">
        <T as="p" className="brutal-kicker" k="friends.applyKicker" />
        <T as="h2" className="brutal-title" id="friend-apply-title" k="friends.applyTitle" />
        <ul className="friend-requirements">
          <li><T k="friends.applyReq1" /></li>
          <li><T k="friends.applyReq2" /></li>
          <li><T k="friends.applyReq3" /></li>
        </ul>
        <T as="p" className="brutal-text" k="friends.applyFooter" />
        <div className="friend-actions">
          <a className="brutal-btn brutal-btn--ink" href="mailto:justlikeashes@gmail.com">
            justlikeashes@gmail.com
          </a>
          <a className="brutal-btn" href={COLLECTION_TOPIC} target="_blank" rel="noreferrer noopener">
            <T k="friends.v2ex" /> →
          </a>
        </div>
      </section>
    </main>
  );
}
