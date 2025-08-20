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
import { NewsletterProvider } from '@/components/newsletter/NewsletterProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'),
  title: {
    default: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    template: '%s | Decodorul Oficial'
  },
  description: '📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. Știri legislative actualizate, hotărâri de guvern, ordine ministeriale - totul explicat clar și concis. ⚖️',
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
    'regulamente românia',
    'știri legislative',
    'monitor oficial românia',
    'legislație simplificată',
    'acte normative românia'
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
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro',
    siteName: 'Decodorul Oficial',
    title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    description: '📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. Știri legislative actualizate, hotărâri de guvern, ordine ministeriale - totul explicat clar și concis. ⚖️',
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
    description: '📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. ⚖️',
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
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro',
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
  maximumScale: 1,
  userScalable: false,
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Decodorul Oficial" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon configuration for better Google search results */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo_with_bg.png" />
        
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/logo.png" />
        
        <link rel="manifest" href="/manifest.json" />
        
        {/* Prevent zoom functionality */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent zoom on input focus
              document.addEventListener('DOMContentLoaded', function() {
                const inputs = document.querySelectorAll('input, textarea, select');
                inputs.forEach(function(input) {
                  input.style.fontSize = '16px';
                });
                
                // Also handle dynamically added inputs
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                      if (node.nodeType === 1) {
                        const newInputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, select') : [];
                        newInputs.forEach(function(input) {
                          input.style.fontSize = '16px';
                        });
                      }
                    });
                  });
                });
                
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              });
              
              // Prevent pinch-to-zoom
              document.addEventListener('touchstart', function(event) {
                if (event.touches.length > 1) {
                  event.preventDefault();
                }
              }, { passive: false });
              
              // Prevent double-tap zoom
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function(event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  event.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
              
              // Prevent wheel zoom
              document.addEventListener('wheel', function(event) {
                if (event.ctrlKey) {
                  event.preventDefault();
                }
              }, { passive: false });
              
              // Prevent keyboard zoom
              document.addEventListener('keydown', function(event) {
                if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '=')) {
                  event.preventDefault();
                }
              });
              
              // Prevent zoom on focus for all form elements
              document.addEventListener('focusin', function(event) {
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                  event.target.style.fontSize = '16px';
                }
              });
              
              // Additional iOS zoom prevention
              if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                document.addEventListener('gesturestart', function(event) {
                  event.preventDefault();
                });
                
                document.addEventListener('gesturechange', function(event) {
                  event.preventDefault();
                });
                
                document.addEventListener('gestureend', function(event) {
                  event.preventDefault();
                });
              }
            `
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Decodorul Oficial",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro",
              "description": "📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. Știri legislative actualizate, hotărâri de guvern, ordine ministeriale - totul explicat clar și concis. ⚖️",
              "publisher": {
                "@type": "Organization",
                "name": "Decodorul Oficial",
                "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/logo_with_bg.png`,
                  "width": 512,
                  "height": 512
                },
                "description": "Platformă de informare și analiză a legislației române",
                "foundingDate": "2024",
                "areaServed": {
                  "@type": "Country",
                  "name": "Romania"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/stiri?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "inLanguage": "ro",
              "isAccessibleForFree": true,
              "genre": "legal information",
              "keywords": "Monitorul Oficial, legislație română, acte normative, hotărâri de guvern, ordine ministeriale, legi românia, buletin oficial, publicații oficiale, decodor legislație, sinteze legislative, interpretări legale, actualizări legislative",
              "audience": {
                "@type": "Audience",
                "audienceType": "Legal professionals, businesses, citizens"
              },
              "about": [
                {
                  "@type": "Thing",
                  "name": "Romanian Legislation",
                  "description": "Legislația României și actele normative"
                },
                {
                  "@type": "Thing", 
                  "name": "Monitorul Oficial",
                  "description": "Buletinul oficial al României"
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <ConsentProvider>
          <NewsletterProvider>
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
          </NewsletterProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}


