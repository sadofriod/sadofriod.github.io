'use client';

import { format } from 'date-fns';
import { enUS, zhCN, ja, ko, es } from 'date-fns/locale';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const DATE_LOCALES = { en: enUS, zh: zhCN, ja, ko, es } as const;

const PATTERNS: Record<string, string> = {
  en: 'MMMM d, yyyy',
  zh: 'yyyy 年 M 月 d 日',
  ja: 'yyyy年M月d日',
  ko: 'yyyy년 M월 d일',
  es: "d 'de' MMMM 'de' yyyy",
};

/** Renders a post date in the visitor's language instead of a fixed en-US string. */
export default function LocalizedDate({ iso, className }: { iso: string; className?: string }) {
  const { locale } = useLanguage();
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return <span className={className}>{iso}</span>;
  }

  return (
    <span className={className}>
      {format(date, PATTERNS[locale] ?? PATTERNS.en, { locale: DATE_LOCALES[locale] ?? enUS })}
    </span>
  );
}
