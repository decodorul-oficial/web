import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata: Metadata = {
  title: 'Contact și Informații de Identificare | Decodorul Oficial',
  description: 'Contactează Decodorul Oficial pentru întrebări despre legislația română, acte normative și Monitorul Oficial. Informații de identificare conform Legea 365/2002.',
  keywords: [
    'contact decodorul oficial',
    'informații identificare',
    'legislație română contact',
    'Monitorul Oficial contact',
    'acte normative contact',
    'decodor legislație românia',
    'contact juridic românia',
    'informații legislative contact'
  ],
  openGraph: {
    title: 'Contact și Informații de Identificare | Decodorul Oficial',
    description: 'Contactează Decodorul Oficial pentru întrebări despre legislația română, acte normative și Monitorul Oficial.',
    url: '/contact',
    siteName: 'Decodorul Oficial',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact și Informații de Identificare | Decodorul Oficial',
    description: 'Contactează Decodorul Oficial pentru întrebări despre legislația română.',
  },
  alternates: {
    canonical: '/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Schema.org structured data for contact page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact și Informații de Identificare | Decodorul Oficial",
            "description": "Contactează Decodorul Oficial pentru întrebări despre legislația română, acte normative și Monitorul Oficial. Informații de identificare conform Legea 365/2002.",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/contact`,
            "mainEntity": {
              "@type": "Organization",
              "name": "Decodorul Oficial",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro",
              "email": "contact@decodoruloficial.ro",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "contact@decodoruloficial.ro",
                "availableLanguage": "Romanian",
                "areaServed": {
                  "@type": "Country",
                  "name": "Romania"
                }
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "RO"
              }
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
                  "name": "Contact",
                  "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.decodoruloficial.ro"}/contact`
                }
              ]
            },
            "inLanguage": "ro",
            "isAccessibleForFree": true,
            "genre": "legal information"
          })
        }}
      />
      
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1" role="main">
        <div className="container-responsive prose max-w-none py-5">
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-brand-info to-brand-accent rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-0 flex items-center">
                Contact și Informații de Identificare
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Conform Legea 365/2002, afișăm mai jos datele de identificare și contact pentru Decodorul Oficial
            </p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Informații de Identificare
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-brand-info to-brand-accent rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">Denumire:</span>
                    <span className="text-gray-900 font-medium ml-2">Decodorul Oficial</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-brand-info to-brand-accent rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">E-mail:</span>
                    <a 
                      href="mailto:contact@decodoruloficial.ro" 
                      className="text-brand-info hover:text-brand-accent font-medium ml-2 transition-colors"
                      aria-label="Trimite e-mail la contact@decodoruloficial.ro"
                    >
                      contact@decodoruloficial.ro
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-brand-info to-brand-accent rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 text-sm">Website:</span>
                    <a 
                      href="/" 
                      className="text-brand-info hover:text-brand-accent font-medium ml-2 transition-colors"
                    >
                      www.decodoruloficial.ro
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cum Ne Poți Contacta
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    E-mail
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Pentru întrebări generale, suport tehnic sau colaborări
                </p>
                <a 
                  href="mailto:contact@decodoruloficial.ro" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-info to-brand-accent text-white font-medium rounded-md hover:from-brand-info/90 hover:to-brand-accent/90 transition-all duration-200 no-underline"
                  aria-label="Trimite e-mail la contact@decodoruloficial.ro"
                  style={{ color: '#fff', textDecoration: 'none' }}
                >
                  <span className="text-white">Trimite-ne un e-mail</span>
                </a>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Răspuns Garantat
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Ne angajăm să răspundem în maxim 48 de ore lucrătoare
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span><strong>Luni - Vineri:</strong> 9:00 - 18:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span><strong>Weekend:</strong> Răspuns prin e-mail</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tipuri de Solicitări
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-brand-info/30 hover:shadow-md transition-all duration-200 bg-white">
                <div className="w-12 h-12 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Întrebări Generale</h3>
                <p className="text-gray-600 text-sm">
                  Despre serviciile noastre și conținutul site-ului
                </p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-brand-info/30 hover:shadow-md transition-all duration-200 bg-white">
                <div className="w-12 h-12 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Suport Tehnic</h3>
                <p className="text-gray-600 text-sm">
                  Probleme tehnice sau sugestii de îmbunătățire
                </p>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-brand-info/30 hover:shadow-md transition-all duration-200 bg-white">
                <div className="w-12 h-12 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Colaborări</h3>
                <p className="text-gray-600 text-sm">
                  Propuneri de parteneriat sau colaborare
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Informații Suplimentare
            </h2>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-2">
                    Informație Importantă
                  </h3>
                  <p className="text-amber-800 mb-3">
                    <strong>Pentru întrebări cu consecințe legale, consultați întotdeauna sursa oficială - Monitorul Oficial al României - și, dacă este necesar, un specialist juridic.</strong>
                  </p>
                  <p className="text-amber-700 text-sm">
                    Sintezele și interpretările oferite pe această platformă sunt neoficiale și au scop informativ. 
                    Nu înlocuiesc consultanța juridică profesională.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pagini Legate
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/legal" 
                className="group block p-6 border border-gray-200 rounded-lg hover:border-brand-info/50 hover:shadow-md transition-all duration-200 bg-white no-underline hover:no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-info transition-colors">
                      Disclaimer și Termeni de Utilizare
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Informații despre natura serviciului și limitările de răspundere
                    </p>
                    <div className="flex items-center text-brand-info font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                      <span>Citește mai mult</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
              
                <a 
                  href="/privacy" 
                  className="group block p-6 border border-gray-200 rounded-lg hover:border-brand-info/50 hover:shadow-md transition-all duration-200 bg-white no-underline hover:no-underline"
                  style={{ textDecoration: 'none' }}
                >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-brand-info to-brand-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-info transition-colors">
                      Politica de Confidențialitate
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Cum protejăm datele tale personale conform GDPR
                    </p>
                    <div className="flex items-center text-brand-info font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                      <span>Citește mai mult</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}


