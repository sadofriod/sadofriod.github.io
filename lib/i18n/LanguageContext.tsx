'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supportedLocales, defaultLocale, type Locale, translations } from './translations';
import { getCookie, setCookie } from 'cookies-next';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

// We'll use ServerLanguageDetection.tsx for server-side detection
// This context will primarily handle client-side language management

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale || defaultLocale);
  const [isClient, setIsClient] = useState(false);

  // Set isClient flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Initialize locale from various sources
  useEffect(() => {
    if (!isClient) return;
    
    // First check cookies for user's preference (cookies work in both client and server)
    const savedLocale = getCookie('preferred-locale');
    if (savedLocale && supportedLocales.includes(savedLocale as Locale)) {
      setLocale(savedLocale as Locale);
      return;
    }
    
    // Then check localStorage as fallback
    try {
      const localStorageLocale = localStorage.getItem('preferred-locale');
      if (localStorageLocale && supportedLocales.includes(localStorageLocale as Locale)) {
        setLocale(localStorageLocale as Locale);
        // Sync cookie with localStorage
        setCookie('preferred-locale', localStorageLocale);
        return;
      }
    } catch (error) {
      // localStorage might not be available in some contexts
      console.error('Error accessing localStorage:', error);
    }
    
    // Finally check browser settings
    const browserLocale = navigator.language.split('-')[0] as Locale;
    if (supportedLocales.includes(browserLocale)) {
      setLocale(browserLocale);
      setCookie('preferred-locale', browserLocale);
      try {
        localStorage.setItem('preferred-locale', browserLocale);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }, [isClient]);

  // Save language preference when it changes
  useEffect(() => {
    if (isClient) {
      setCookie('preferred-locale', locale);
      
      try {
        localStorage.setItem('preferred-locale', locale);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
      
      if (document) {
        document.documentElement.lang = locale;
      }
    }
  }, [locale, isClient]);

  // Translation function
  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[key]?.[locale] || translations[key]?.[defaultLocale] || key;
    
    // Replace parameters if provided
    if (params) {
      for (const element of Object.entries(params)) {
        text = text.replace(new RegExp(`{{${element[0]}}}`, 'g'), element[1]);
      }
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
