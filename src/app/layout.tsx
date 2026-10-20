import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { Locale, isValidLocale, DEFAULT_LOCALE } from '@/locales';

import { getCurrentSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'MarkMosaiq — Studio IA E-commerce & Compléments Alimentaires en Tunisie',
  description: 'Créez des visuels marketing 4K prêts à poster (Feed, Stories, Pubs et Badges Livraison 24 Gouvernorats) à partir d\'une simple photo de votre produit.',
  icons: {
    icon: [
      { url: '/images/logo.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const rawLocale = headerList.get('x-markmosaiq-locale');
  const initialLocale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const initialSession = await getCurrentSession();

  return (
    <html lang={initialLocale}>
      <head>
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body>
        <LanguageProvider initialLocale={initialLocale}>
          <WorkspaceProvider initialSession={initialSession}>
            <div className="min-h-screen flex flex-col relative overflow-hidden">
              {children}
            </div>
          </WorkspaceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

