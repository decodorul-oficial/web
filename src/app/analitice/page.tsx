import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analitice - Activitatea Legislativă în România',
  description: '📊 Explorează statistici și analize detaliate despre activitatea legislativă din România. Grafice interactive cu evoluția actelor normative, distribuția pe categorii și top instituții active.',
  keywords: [
    'analitice legislative',
    'statistici Monitorul Oficial',
    'evoluția actelor normative',
    'distribuția categorii legislative',
    'instituții active România',
    'cuvinte cheie legislative',
    'dashboard legislație',
    'metrice legislative',
    'KPI legislație română',
    'analiză activitate parlamentară'
  ],
  openGraph: {
    title: 'Analitice - Activitatea Legislativă în România',
    description: '📊 Explorează statistici și analize detaliate despre activitatea legislativă din România. Grafice interactive cu evoluția actelor normative, distribuția pe categorii și top instituții active.',
    url: '/analitice',
    siteName: 'Decodorul Oficial',
    images: [
      {
        url: '/logo_with_bg.png',
        width: 1200,
        height: 630,
        alt: 'Analitice Legislative - Decodorul Oficial',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analitice - Activitatea Legislativă în România',
    description: '📊 Explorează statistici și analize detaliate despre activitatea legislativă din România. Grafice interactive cu evoluția actelor normative, distribuția pe categorii și top instituții active.',
    images: ['/logo_with_bg.png'],
  },
  alternates: {
    canonical: '/analitice',
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

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Schema.org structured data for analytics page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Analitice - Activitatea Legislativă în România",
            "description": "📊 Explorează statistici și analize detaliate despre activitatea legislativă din România. Grafice interactive cu evoluția actelor normative, distribuția pe categorii și top instituții active.",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/analitice`,
            "mainEntity": {
              "@type": "DataFeed",
              "name": "Analitice Legislative România",
              "description": "Statistici și analize despre activitatea legislativă din România",
              "dataFeedElement": [
                {
                  "@type": "DataFeedItem",
                  "name": "Evoluția Activității Legislative",
                  "description": "Grafic cu evoluția numărului de acte normative în timp"
                },
                {
                  "@type": "DataFeedItem", 
                  "name": "Distribuția pe Categorii",
                  "description": "Analiză a distribuției actelor normative pe categorii"
                },
                {
                  "@type": "DataFeedItem",
                  "name": "Top Instituții Active",
                  "description": "Clasamentul instituțiilor cu cea mai mare activitate legislativă"
                }
              ]
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Acasă",
                  "item": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Analitice",
                  "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/analitice`
                }
              ]
            },
            "inLanguage": "ro",
            "isAccessibleForFree": true,
            "genre": "legal information",
            "keywords": "analitice legislative, statistici Monitorul Oficial, evoluția actelor normative, distribuția categorii legislative, instituții active România, cuvinte cheie legislative, dashboard legislație, metrice legislative, KPI legislație română, analiză activitate parlamentară",
            "audience": {
              "@type": "Audience",
              "audienceType": "Legal professionals, businesses, citizens, researchers"
            }
          })
        }}
      />
      
      <Header />
      <SessionCookieInitializer />
      <main className="bg-slate-50 min-h-screen py-8" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Analitice - Activitatea Legislativă în România
            </h1>
            <p className="text-lg text-gray-600 max-w-4xl">
              Explorează statistici și analize detaliate despre activitatea legislativă din România. 
              Monitorizează evoluția actelor normative, distribuția pe categorii și identifică tendințele 
              în legislația română.
            </p>
          </div>
          
          <AnalyticsDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
