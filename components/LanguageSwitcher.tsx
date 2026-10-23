'use client';

import type React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { supportedLocales, localeNames, type Locale } from '../lib/i18n/translations';
import postTranslations from '../lib/generated/post-translations.json';

const translationsBySlug = postTranslations as Record<string, Record<string, string>>;

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value as Locale;
    setLocale(language);

    // On an article, switch to the same article in the chosen language instead of
    // leaving the visitor on a page in the wrong language.
    const match = pathname?.match(/^\/blog\/(.+)$/);
    if (!match) return;

    const slug = decodeURIComponent(match[1]);
    const target = translationsBySlug[slug]?.[language];
    if (target && target !== slug) {
      router.push(`/blog/${target}`);
    }
  };

  return (
    <select
      className="brutal-select"
      aria-label="Language"
      value={locale}
      onChange={handleChange}
    >
      {supportedLocales.map((lang) => (
        <option key={lang} value={lang}>
          {localeNames[lang]}
        </option>
      ))}
    </select>
  );
}
