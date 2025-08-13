import type { Metadata } from 'next';
import './globals.css';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';
import { ConsentProvider } from '@/components/cookies/ConsentProvider';
import { CookieBanner } from '@/components/cookies/CookieBanner';

export const metadata: Metadata = {
  title: 'Decodorul Oficial',
  description:
    'Decodorul Oficial – știri și sumarizări oficiale.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <ConsentProvider>
          <DisclaimerBanner />
          {children}
          <CookieBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}


