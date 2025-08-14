import type { Metadata } from 'next';
import './globals.css';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';
import { ConsentProvider } from '@/components/cookies/ConsentProvider';
import { CookieBanner } from '@/components/cookies/CookieBanner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { NavigationOverlay } from '@/components/ui/NavigationOverlay';
import { NavigationInterceptor } from '@/components/ui/NavigationInterceptor';

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
          <NavigationInterceptor />
          {children}
          <CookieBanner />
          <ScrollToTop />
          <NavigationOverlay />
        </ConsentProvider>
      </body>
    </html>
  );
}


