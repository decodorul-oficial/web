import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LatestNewsSection } from '@/features/news/components/LatestNewsSection';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
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
    'regulamente românia',
    'știri legislative',
    'monitor oficial românia'
  ],
  openGraph: {
    title: 'Decodorul Oficial - Știri și Sinteze din Monitorul Oficial al României',
    description: 'Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României. Informații actualizate despre legislație, hotărâri de guvern, ordine și alte acte normative.',
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
    description: 'Decodorul Oficial oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României.',
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
      <Header />
      <SessionCookieInitializer />
      <main className="container-responsive flex-1 py-6" role="main">
          <LatestNewsSection />
      </main>
      <Footer />
    </div>
  );
}


