import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Check, Star, Zap, Clock, Shield, Users } from 'lucide-react';
import { PricingPageClient } from './PricingPageClient';
import { Accordion } from '@/components/ui/Accordion';

export const metadata: Metadata = {
  title: 'Prețuri - Decodorul Oficial PRO | Abonament Premium',
  description: 'Descoperă prețurile pentru abonamentul PRO Decodorul Oficial. Acces premium la funcționalități avansate, feed personalizat și preferințe de categorii. De la 35 lei/lună cu abonament anual.',
  keywords: [
    'prețuri',
    'abonament',
    'premium',
    'PRO',
    'Decodorul Oficial',
    'Monitorul Oficial',
    'legislație',
    'funcționalități avansate',
    'feed personalizat',
    'preferințe categorii'
  ],
  openGraph: {
    title: 'Prețuri - Decodorul Oficial PRO | Abonament Premium',
    description: 'Descoperă prețurile pentru abonamentul PRO Decodorul Oficial. Acces premium la funcționalități avansate, feed personalizat și preferințe de categorii.',
    url: '/preturi',
    siteName: 'Decodorul Oficial',
    images: [
      {
        url: '/logo_with_bg.png',
        width: 1200,
        height: 630,
        alt: 'Decodorul Oficial - Prețuri PRO',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prețuri - Decodorul Oficial PRO | Abonament Premium',
    description: 'Descoperă prețurile pentru abonamentul PRO Decodorul Oficial. Acces premium la funcționalități avansate.',
    images: ['/logo_with_bg.png'],
  },
  alternates: {
    canonical: '/preturi',
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

const features = [
  {
    name: 'Trial Pro de 14 zile',
    description: 'Testează toate funcționalitățile PRO gratuit timp de 14 zile',
    icon: Clock,
  },
  {
    name: 'Feed personalizat de știri',
    description: 'Primești știri relevante pentru categoriile tale de interes',
    icon: Star,
  },
  {
    name: 'Analiză de rețea legislativă',
    description: 'Vizualizează conexiunile dintre legi și istoricul modificărilor legislative',
    icon: Users,
  },
  {
    name: 'Export PDF avansat',
    description: 'Exportează știri și sinteze în format PDF',
    icon: Zap,
  },
  {
    name: 'Suport prioritar',
    description: 'Asistență tehnică prioritară pentru utilizatorii PRO',
    icon: Shield,
  },
  {
    name: 'Acces nelimitat',
    description: 'Fără limitări de cereri sau funcționalități',
    icon: Check,
  },
];

const subscriptionTier = "PRO";

const faqData = [
  {
    id: "cancel-subscription",
    question: "Pot să anulez abonamentul oricând?",
    answer: "Abonamentul lunar presupune o plată recurentă, efectuată la fiecare lună. Odată ce ai plătit, abonamentul rămâne activ până la finalul perioadei pentru care ai achitat. Dacă dezactivezi reînnoirea automată, vei păstra accesul PRO până la sfârșitul lunii plătite, după care contul tău va trece automat pe modul gratuit (free). Pentru abonamentul anual, funcționează la fel, doar că intervalul este de un an: plătești o dată pe an, iar dacă oprești reînnoirea, beneficiezi de PRO până la finalul perioadei achitate, apoi contul revine la versiunea gratuită."
  },
  {
    id: "payment-methods",
    question: "Ce metode de plată acceptați?",
    answer: "Acceptăm toate cardurile bancare principale (Visa, Mastercard). Toate tranzacțiile sunt securizate și procesate prin Netopia, partenerul nostru de încredere pentru plăți online."
  },
  {
    id: "free-trial",
    question: "Există o perioadă de probă gratuită?",
    answer: "Da, oferim un trial Pro de 14 zile pentru toți utilizatorii noi. Poți testa toate funcționalitățile PRO fără să plătești nimic. Dacă nu ești mulțumit, poți anula înainte de expirarea trial-ului."
  },
  {
    id: "change-plan",
    question: "Pot să schimb planul oricând?",
    answer: "Da, poți upgrada sau downgrada planul oricând. Dacă faci upgrade, vei fi taxat proporțional pentru perioada rămasă. Dacă faci downgrade, schimbarea va intra în vigoare la următorul ciclu de facturare."
  }
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Schema.org structured data for pricing page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Prețuri - Decodorul Oficial PRO",
            "description": "Descoperă prețurile pentru abonamentul PRO Decodorul Oficial. Acces premium la funcționalități avansate, feed personalizat și preferințe de categorii.",
            "url": process.env.NEXT_PUBLIC_BASE_URL + "/preturi",
            "mainEntity": {
              "@type": "Product",
              "name": "Decodorul Oficial PRO",
              "description": "Abonament premium pentru acces la funcționalități avansate",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Abonament Lunar",
                  "price": "45",
                  "priceCurrency": "RON",
                  "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "45",
                    "priceCurrency": "RON",
                    "unitText": "MONTH"
                  }
                },
                {
                  "@type": "Offer",
                  "name": "Abonament Anual",
                  "price": "35",
                  "priceCurrency": "RON",
                  "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "35",
                    "priceCurrency": "RON",
                    "unitText": "MONTH"
                  }
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
                  "name": "Prețuri",
                  "item": process.env.NEXT_PUBLIC_BASE_URL + "/preturi"
                }
              ]
            },
            "inLanguage": "ro",
            "isAccessibleForFree": false,
            "genre": "pricing information",
            "keywords": "prețuri, abonament, premium, PRO, Decodorul Oficial, Monitorul Oficial, legislație, funcționalități avansate",
            "audience": {
              "@type": "Audience",
              "audienceType": "Legal professionals, businesses, citizens"
            }
          })
        }}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-info/10 via-white to-brand-accent/10 py-8">
          <div className="container-responsive">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-info to-brand-accent text-white text-sm font-semibold mb-4">
                <Star className="w-4 h-4" />
                Abonament {subscriptionTier}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Prețuri{' '}
                <span className="bg-gradient-to-r from-brand-info to-brand-accent bg-clip-text text-transparent">
                  Transparente
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Alege planul care se potrivește nevoilor tale și deblochează toate funcționalitățile premium
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <PricingPageClient />

        {/* Features Section */}
        <section className="py-8 bg-gray-50">
          <div className="container-responsive">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Ce primești cu{' '}
                <span className="bg-gradient-to-r from-brand-info to-brand-accent bg-clip-text text-transparent">
                  {subscriptionTier}
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Toate funcționalitățile premium pentru o experiență completă
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-info to-brand-accent flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{feature.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8">
          <div className="container-responsive">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Întrebări Frecvente
              </h2>
              <p className="text-lg text-gray-600">
                Răspunsuri la cele mai comune întrebări despre abonamentul {subscriptionTier}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion items={faqData} />
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
