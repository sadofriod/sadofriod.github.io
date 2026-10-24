'use client';

import type { FriendLink } from '@/lib/friends';
import { friendHost } from '@/lib/friends';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/** One link card. Client-side so the accessible name follows the visitor's language. */
export default function FriendCard({ friend }: { friend: FriendLink }) {
  const { t } = useLanguage();

  return (
    <a
      className="brutal-card friend-card"
      href={friend.url}
      target="_blank"
      rel="noopener"
      title={`${friend.name}: ${friend.blurb}`}
      aria-label={t('friends.openInNewTab', { name: friend.name })}
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
  );
}
