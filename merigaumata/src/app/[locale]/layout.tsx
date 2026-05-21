import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

import { ThemeProvider } from '@/shared/components/theme-provider';
import {NextIntlClientProvider} from 'next-intl';
import { QueryProvider } from '@/shared/lib/react-query';
import {getMessages, setRequestLocale, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import GlobalNavigationLoadingProvider from '@/shared/ui/loading/global-provider';
import { initLogTape } from '@/shared/lib/logger';
import ObservabilityProvider from '@/shared/ui/observability/observability-provider';
import AppToaster from '@/shared/components/AppToaster';


// Initialize structured logging on the server side
initLogTape();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <GlobalNavigationLoadingProvider>
                  <ObservabilityProvider>
                    {children}
                    <AppToaster />
                  </ObservabilityProvider>
                </GlobalNavigationLoadingProvider>
              </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
