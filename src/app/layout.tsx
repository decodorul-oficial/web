import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';
import { ConsentProvider } from '@/components/cookies/ConsentProvider';
import { CookieBanner } from '@/components/cookies/CookieBanner';
import { Header } from '@/components/layout/Header';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { NavigationOverlay } from '@/components/ui/NavigationOverlay';
import { NavigationInterceptor } from '@/components/ui/NavigationInterceptor';
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { SectionViewTracker } from '@/components/analytics/SectionViewTracker';

export const metadata: Metadata = {
  title: 'Decodorul Oficial',
  description:
    'Decodorul Oficial – știri și sumarizări oficiale.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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
          <GoogleAnalytics />
          <div className="flex flex-col min-h-screen">
            <DisclaimerBanner />
            <NavigationInterceptor />
            {children}
            <CookieBanner />
            <ScrollToTop />
            <NavigationOverlay />
          </div>
          <SectionViewTracker />
        </ConsentProvider>
      </body>
    </html>
  );
}


