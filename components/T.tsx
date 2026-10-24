'use client';

import { createElement } from 'react';
import type { CSSProperties, ElementType } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Props = {
  /** translation key, e.g. `home.byTheme` */
  k: string;
  /** element to render, defaults to span */
  as?: ElementType;
  className?: string;
  /** {{name}} placeholders */
  params?: Record<string, string>;
  style?: CSSProperties;
  id?: string;
};

/**
 * Renders one translated string.
 *
 * Server components cannot call useLanguage(), so pages import this tiny client
 * component instead of hardcoding English. Static export pre-renders the default
 * locale and the client swaps the text after hydration — the same trade-off the
 * rest of the site already makes.
 */
export default function T({ k, as = 'span', className, params, style, id }: Props) {
  const { t } = useLanguage();
  return createElement(as, { className, style, id }, t(k, params));
}
