'use client';

import { Fragment, createElement, type ReactNode, type ElementType, type CSSProperties } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Props = {
  /** translation key */
  k: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** `{{name}}` 占位符对应的 React 节点 */
  slots?: Record<string, ReactNode>;
  /** 纯文本占位符（与 t() 的 params 语义一致） */
  params?: Record<string, string>;
};

/**
 * Renders a translated sentence that carries inline markup.
 *
 * The dictionary keeps one string per language with `{{slot}}` markers in the
 * position each language needs, so word order is translated, not the markup.
 */
export default function TRich({ k, as = 'span', className, style, slots, params }: Props) {
  const { t } = useLanguage();
  const text = t(k, params);
  const children: ReactNode[] = text.split(/(\{\{\w+\}\})/g).flatMap((part, index): ReactNode[] => {
    const match = /^\{\{(\w+)\}\}$/.exec(part);
    if (!match) return part ? [part] : [];
    const slot = slots?.[match[1]];
    return [createElement(Fragment, { key: `slot-${index}` }, slot ?? part)];
  });
  return createElement(as, { className, style }, ...children);
}
