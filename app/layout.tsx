import type { Metadata } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import themeOptions from '../lib/theme';
import { Roboto } from 'next/font/google';
import { LanguageProvider } from '../lib/i18n/LanguageContext';
import MainNavbar from '../components/MainNavbar';
import { defaultLocale } from '../lib/i18n/translations';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Ashes Space',
  description: 'A comprehensive resource for Ashes of the Singularity: Escalation',
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={roboto.variable} lang={defaultLocale}>
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
