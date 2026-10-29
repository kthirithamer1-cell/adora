import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { Locale, isValidLocale, DEFAULT_LOCALE } from '@/locales';

import { getCurrentSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'MarkMosaiq — AI Product Staging & Commercial Creative Studio',
  description: 'Turn product photos into studio-grade 4K lifestyle scenes, social ads, and e-commerce visuals in seconds with pixel-accurate product preservation and zero distorted text.',
  verification: {
    google: 'NPoTVmfYmh4ysR8nlEkdJcWzPMjNnPI_dmtIo5mvwUQ',
  },
  icons: {
    icon: [
      { url: '/images/logo.png', type: 'image/png' },
      { url: '/images/logo.png', sizes: 'any' },
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
        <meta name="google-site-verification" content="NPoTVmfYmh4ysR8nlEkdJcWzPMjNnPI_dmtIo5mvwUQ" />
        <script src="/public-tracker.js" defer></script>
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

