import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Branded Instagram content for beauty brands | MarkMosaiq',
  description:
    'Turn your beauty brand’s story, botanical ingredients, and products into high-converting Instagram posts, Stories, and carousels. Try the live preview for free — no sign up required to test.',
  openGraph: {
    title: 'Branded Instagram content for beauty brands | MarkMosaiq',
    description:
      'Turn your beauty brand’s story, botanical ingredients, and products into high-converting Instagram posts, Stories, and carousels. Try the live preview for free.',
    url: 'https://markmosaiq.com/beauty',
    siteName: 'MarkMosaiq',
    images: [
      {
        url: '/images/beauty/hero_phone_post.jpg',
        width: 1200,
        height: 630,
        alt: 'MarkMosaiq Beauty Brand Studio Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Branded Instagram content for beauty brands | MarkMosaiq',
    description:
      'Turn your beauty brand’s story, botanical ingredients, and products into high-converting Instagram posts, Stories, and carousels. Free instant preview.',
    images: ['/images/beauty/hero_phone_post.jpg'],
  },
};

export default function BeautyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

