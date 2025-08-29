import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LatestNewsSectionWithParams } from '@/features/news/components/LatestNewsSectionWithParams';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
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
    'acte normative românia',
    'ultimele știri legislative',
    'hotărâri guvern românia'
  ],
  openGraph: {
    title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    description: '📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. Știri legislative actualizate, hotărâri de guvern, ordine ministeriale - totul explicat clar și concis. ⚖️',
    url: '/',
    siteName: 'Decodorul Oficial',
    images: [
      {
        url: '/logo_with_bg.png',
        width: 1200,
        height: 630,
        alt: 'Decodorul Oficial - Logo',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    description: '📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. ⚖️',
    images: ['/logo_with_bg.png'],
  },
  alternates: {
    canonical: '/',
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
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Schema.org structured data for homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României",
            "description": "📋 Descoperă rapid și simplu ce se întâmplă în legislația României! Decodorul Oficial traduce actele din Monitorul Oficial în limbaj simplu. Știri legislative actualizate, hotărâri de guvern, ordine ministeriale - totul explicat clar și concis. ⚖️",
            "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro",
            "mainEntity": {
              "@type": "NewsMediaOrganization",
              "name": "Decodorul Oficial",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro",
              "description": "Platformă de informare și analiză a legislației române",
              "foundingDate": "2024",
              "areaServed": {
                "@type": "Country",
                "name": "Romania"
              },
              "publishingPrinciples": "https://www.decodoruloficial.ro/legal",
              "masthead": "https://www.decodoruloficial.ro/logo_with_bg.png"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Acasă",
                  "item": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"
                }
              ]
            },
            "inLanguage": "ro",
            "isAccessibleForFree": true,
            "genre": "legal information",
            "keywords": "Monitorul Oficial, legislație română, acte normative, hotărâri de guvern, ordine ministeriale, legi românia, buletin oficial, publicații oficiale, decodor legislație, sinteze legislative, interpretări legale, actualizări legislative",
            "audience": {
              "@type": "Audience",
              "audienceType": "Legal professionals, businesses, citizens"
            }
          })
        }}
      />
      
      <Header />
      <SessionCookieInitializer />
      <main className="container-responsive flex-1 py-6" role="main">
          <LatestNewsSectionWithParams />
      </main>
      <Footer />
    </div>
  );
}


