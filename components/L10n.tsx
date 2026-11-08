'use client';

import { createElement, type ElementType } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { pickText, type LocalizedText } from '@/lib/demos-l10n';

export default function L10n({
  v,
  as = 'span',
  className,
}: {
  v: LocalizedText;
  as?: ElementType;
  className?: string;
}) {
  const { locale } = useLanguage();
  return createElement(as, { className }, pickText(v, locale));
}
