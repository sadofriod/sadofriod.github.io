'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type ProfileCalloutProps = {
  variant: 'top' | 'bottom';
};

/**
 * Client Component. Links the long-form retrospective back to the short profile
 * narrative and gives every article a way out to the identity pages.
 *
 * Copy goes through useLanguage() so the static export keeps rendering the
 * default locale and the client swaps it after hydration.
 */
export default function ProfileCallout({ variant }: ProfileCalloutProps) {
  const { t } = useLanguage();

  if (variant === 'top') {
    return (
      <aside className="profile-callout">
        <span className="brutal-kicker">{t('callout.fullVersion')}</span>
        <span>
          {t('callout.fullStoryLead')}{' '}
          <Link href="/about">{t('callout.aboutPage')}</Link>.
        </span>
      </aside>
    );
  }

  return (
    <aside className="profile-callout profile-callout--bottom">
      <span className="brutal-kicker">{t('callout.keepGoing')}</span>
      <span>
        {t('callout.wantToKnow')} <Link href="/about">{t('callout.about')}</Link>
        {' · '}
        <Link href="/photography">{t('callout.photography')}</Link>
        {' · '}
        <Link href="/blog">{t('callout.allWriting')}</Link>
      </span>
    </aside>
  );
}
