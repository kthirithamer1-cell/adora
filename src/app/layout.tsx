import type { Metadata } from 'next';
import './globals.css';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';

export const metadata: Metadata = {
  title: 'Adora — Studio IA E-commerce & Compléments Alimentaires en Tunisie',
  description: 'Créez des visuels marketing 4K prêts à poster (Feed, Stories, Pubs et Badges Livraison 24 Gouvernorats) à partir d\'une simple photo de votre produit.',
  icons: {
    icon: [
      { url: '/images/Adora_logo.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/images/Adora_logo.png',
    apple: '/images/Adora_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/images/Adora_logo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/Adora_logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/Adora_logo.png" />
      </head>
      <body>
        <WorkspaceProvider>
          <div className="min-h-screen flex flex-col relative overflow-hidden">
            {children}
          </div>
        </WorkspaceProvider>
      </body>
    </html>
  );
}

