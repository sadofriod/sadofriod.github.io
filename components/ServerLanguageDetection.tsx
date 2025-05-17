'use server';

import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { supportedLocales, defaultLocale, type Locale } from '../lib/i18n/translations';

/**
 * Server-side language detection component
 * Detects user's preferred language from:
 * 1. Cookie
 * 2. Accept-Language HTTP header
 * 3. Default locale as fallback
 */
export default async function detectLanguage(): Promise<Locale> {
  // Check cookie first
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('preferred-locale')?.value;
  
  if (cookieLocale && supportedLocales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // If no cookie, check Accept-Language header
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Parse Accept-Language header
  const userLanguages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().substring(0, 2));

  // Find first supported language
  const matchedLanguage = userLanguages.find(lang => 
    supportedLocales.includes(lang as Locale)
  ) as Locale;
  
  if (matchedLanguage) {
    return matchedLanguage;
  }
  
  // Default locale as fallback
  return defaultLocale;
}
