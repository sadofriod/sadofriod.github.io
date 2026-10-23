import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
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
      title: '同好博客',
      description: '这些是我收藏的独立博客与技术作者，按收藏时间由新到旧展示，方便继续追踪他们的原创文章与工程实践。',
      links: groups.friends,
    },
    {
      id: 'resources',
      title: '参考资源',
      description: '这些是做 GraphRAG / RAG / Postgres 向量检索时常用的权威参考，作为资料收藏，并非友链交换。',
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
        <p className="brutal-kicker">Friends</p>
        <h1 className="profile-hero__name">友情链接</h1>
        <p className="brutal-text friend-hero__subtitle">收藏值得常读的独立博客，也整理工程实践中反复查阅的技术参考。</p>
        <p className="brutal-text">
          这里汇集了我阅读的技术作者，以及用 TypeScript 实践 GraphRAG 与 RAG 时查阅的 retrieval 资料。
          收录以原创内容、站点可访问和技术参考价值为标准，逐一人工筛选，并将同好博客与官方资源分组展示。
          想交换友链，请将站点名称、链接和一句简介发送至 <a className="brutal-link" href="mailto:justlikeashes@gmail.com">justlikeashes@gmail.com</a>，或在 <a className="brutal-link" href={COLLECTION_TOPIC} target="_blank" rel="noopener">V2EX 收集帖</a>留言。
        </p>
        <span className="brutal-pill friend-pill">已收录 {friends.length} 个站点</span>
      </header>

      {sections.map((section) => (
        <section className="friend-section" key={section.id} aria-labelledby={`friend-${section.id}-title`}>
          <h2 className="brutal-title" id={`friend-${section.id}-title`}>{section.title}</h2>
          <p className="brutal-text">{section.description}</p>
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
                  aria-label={`在新窗口打开 ${friend.name}`}
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
        <section className="brutal-card brutal-card--blue" aria-label="友链收集中">
          <p className="brutal-kicker">Collecting links</p>
          <h2 className="brutal-title">正在认识新的朋友</h2>
          <p className="brutal-text">
            目前正在 V2EX 帖子里收集友链，确认后会陆续收录。欢迎来帖子里介绍你的博客。
          </p>
          <a className="brutal-link" href={COLLECTION_TOPIC} target="_blank" rel="noreferrer noopener">
            前往 V2EX 收集帖 →
          </a>
        </section>
      ) : null}

      <section className="brutal-card brutal-card--mint" aria-labelledby="friend-apply-title">
        <p className="brutal-kicker">Exchange links</p>
        <h2 className="brutal-title" id="friend-apply-title">申请友链</h2>
        <ul className="friend-requirements">
          <li>持续更新的原创博客</li>
          <li>站点可访问</li>
          <li>双向链接：也请在你的站点添加 Ashes Space 的链接</li>
        </ul>
        <p className="brutal-text">请附上站点名称、链接与一句简介，发邮件或在收集帖留言。</p>
        <div className="friend-actions">
          <a className="brutal-btn brutal-btn--ink" href="mailto:justlikeashes@gmail.com">
            justlikeashes@gmail.com
          </a>
          <a className="brutal-btn" href={COLLECTION_TOPIC} target="_blank" rel="noreferrer noopener">
            V2EX 收集帖 →
          </a>
        </div>
      </section>
    </main>
  );
}
