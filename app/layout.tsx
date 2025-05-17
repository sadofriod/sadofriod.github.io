import type { Metadata } from 'next';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import themeOptions from '../lib/theme';
import { Roboto } from 'next/font/google';
import { LanguageProvider } from '../lib/i18n/LanguageContext';
import MainNavbar from '../components/MainNavbar';
import detectLanguage from '../components/ServerLanguageDetection';

export const metadata: Metadata = {
  title: 'My Next.js Blog',
  description: 'A static blog built with Next.js',
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detect language on the server side
  const initialLocale = await detectLanguage();
  
  return (
    <html className={roboto.variable} lang={initialLocale}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body>
        <LanguageProvider initialLocale={initialLocale}>
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
