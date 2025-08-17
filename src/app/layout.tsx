import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';
import { ConsentProvider } from '@/components/cookies/ConsentProvider';
import { CookieBanner } from '@/components/cookies/CookieBanner';
// Header component is used in individual pages
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { NavigationOverlay } from '@/components/ui/NavigationOverlay';
import { NavigationInterceptor } from '@/components/ui/NavigationInterceptor';
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { SectionViewTracker } from '@/components/analytics/SectionViewTracker';
import { FontSizeControl } from '@/components/ui/FontSizeControl';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://decodoruloficial.ro'),
  title: {
    default: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    template: '%s | Decodorul Oficial'
  },
  description: 'Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României. Informații actualizate despre legislație, hotărâri de guvern, ordine și alte acte normative.',
  keywords: [
    'Monitorul Oficial',
    'legislație română',
    'acte normative',
    'hotărâri de guvern',
    'ordine ministeriale',
    'legi românia',
    'buletin oficial',
    'publicații oficiale',
    'decodor legislație',
    'sinteze legislative',
    'interpretări legale',
    'actualizări legislative',
    'coduri românia',
    'regulamente românia'
  ],
  authors: [{ name: 'Decodorul Oficial' }],
  creator: 'Decodorul Oficial',
  publisher: 'Decodorul Oficial',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://decodoruloficial.ro',
    siteName: 'Decodorul Oficial',
    title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    description: 'Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României. Informații actualizate despre legislație, hotărâri de guvern, ordine și alte acte normative.',
    images: [
      {
        url: '/logo_with_bg.png',
        width: 1200,
        height: 630,
        alt: 'Decodorul Oficial - Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    description: 'Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României.',
    images: ['/logo_with_bg.png'],
    creator: '@decodoruloficial',
    site: '@decodoruloficial',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://decodoruloficial.ro',
  },
  category: 'legal',
  classification: 'legal information',
  other: {
    'geo.region': 'RO',
    'geo.placename': 'Romania',
    'geo.position': '44.4268;26.1025',
    'ICBM': '44.4268, 26.1025',
    'DC.title': 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    'DC.description': 'Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României.',
    'DC.subject': 'legislație română, acte normative, Monitorul Oficial',
    'DC.creator': 'Decodorul Oficial',
    'DC.publisher': 'Decodorul Oficial',
    'DC.date.created': '2024',
    'DC.language': 'ro',
    'DC.coverage': 'Romania',
    'DC.rights': '© 2024 Decodorul Oficial. Toate drepturile rezervate.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Decodorul Oficial" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Decodorul Oficial",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://decodoruloficial.ro",
              "description": "Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României.",
              "publisher": {
                "@type": "Organization",
                "name": "Decodorul Oficial",
                "url": process.env.NEXT_PUBLIC_BASE_URL || "https://decodoruloficial.ro",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://decodoruloficial.ro"}/logo_with_bg.png`
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://decodoruloficial.ro"}/stiri?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "inLanguage": "ro"
            })
          }}
        />
      </head>
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
            <FontSizeControl />
          </div>
          <SectionViewTracker />
        </ConsentProvider>
      </body>
    </html>
  );
}


