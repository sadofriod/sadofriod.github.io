'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function MainNavbar() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navigationItems = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.photography'), href: '/photography' },
    { label: t('nav.podcast'), href: '/podcast' },
    { label: t('nav.about'), href: '/about' }
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="brutal-nav">
      <div className="brutal-nav__inner">
        <Link className="brutal-nav__brand" href="/">
          Ashes Space
        </Link>

        <nav className="brutal-nav__links">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              className={
                isActive(item.href)
                  ? 'brutal-nav__link brutal-nav__link--active'
                  : 'brutal-nav__link'
              }
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
