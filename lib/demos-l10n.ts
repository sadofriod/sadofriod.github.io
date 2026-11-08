export type LocalizedText = { en: string; zh?: string; ja?: string; ko?: string; es?: string };

export function pickText(v: LocalizedText, locale: string): string {
  const localized = v[locale as keyof LocalizedText];
  return typeof localized === 'string' && localized.length > 0 ? localized : v.en;
}
