import type { Metadata } from 'next';

/**
 * Category hubs are premium-gated. Keep them out of the index so Google
 * does not waste crawl budget on login walls.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function CategoriiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
