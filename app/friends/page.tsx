import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { friendHost, getFriends } from '@/lib/friends';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';
const COLLECTION_TOPIC = 'https://www.v2ex.com/t/1251306';

export const metadata: Metadata = {
  title: 'Friends · Ashes Space',
  description: 'Ashes 的友情链接：与持续更新的原创博客相遇，一条一条交换彼此的链接。',
  alternates: {
    canonical: `${SITE}/friends`,
  },
};

export default function FriendsPage() {
  const friends = getFriends();

  return (
    <main className="profile-shell friend-shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Friends · Ashes Space',
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
        }}
      />

      <header className="brutal-card brutal-card--pink friend-hero">
        <p className="brutal-kicker">Friends</p>
        <h1 className="profile-hero__name">友情链接</h1>
        <p className="brutal-text friend-hero__subtitle">友链：一条一条换出来的，不是爬来的</p>
        <span className="brutal-pill friend-pill">已收录 {friends.length} 个站点</span>
      </header>

      <section aria-label="友链站点">
        {friends.length > 0 ? (
          <div className="friend-grid">
            {friends.map((friend) => (
              <a
                className="brutal-card friend-card"
                key={friend.id}
                href={friend.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <h2 className="brutal-title">{friend.name}</h2>
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
        ) : (
          <div className="brutal-card brutal-card--blue">
            <p className="brutal-kicker">Collecting links</p>
            <h2 className="brutal-title">正在认识新的朋友</h2>
            <p className="brutal-text">
              目前正在 V2EX 帖子里收集友链，确认后会陆续收录。欢迎来帖子里介绍你的博客。
            </p>
            <a className="brutal-link" href={COLLECTION_TOPIC} target="_blank" rel="noreferrer noopener">
              前往 V2EX 收集帖 →
            </a>
          </div>
        )}
      </section>

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
