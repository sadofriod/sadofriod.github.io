import type { Metadata } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import themeOptions from '../lib/theme';
import { LanguageProvider } from '../lib/i18n/LanguageContext';
import MainNavbar from '../components/MainNavbar';
import { defaultLocale } from '../lib/i18n/translations';
import Script from 'next/script';
import './profile.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud'),
  title: {
    default: 'Ashes Born — GraphRAG, TypeScript and photography',
    template: '%s — Ashes Born',
  },
  description: 'Technical notes on GraphRAG, TypeScript and frontend architecture, alongside a photography gallery and podcast.',
  authors: [{ name: 'Ashes Born' }],
  creator: 'Ashes Born',
  openGraph: {
    type: 'website',
    siteName: 'Ashes Born',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  // No site-wide canonical here: a layout-level `alternates.canonical` is inherited by every
  // child route, which pointed /photography and /podcast at the homepage.
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={defaultLocale}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-5JRRE2PZ65" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-5JRRE2PZ65');
        `}
      </Script>
      <body>
        <LanguageProvider initialLocale={defaultLocale}>
          <AppRouterCacheProvider options={{ key: 'css' }}>
            <ThemeProvider theme={themeOptions}>
              <CssBaseline />
              <MainNavbar />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
