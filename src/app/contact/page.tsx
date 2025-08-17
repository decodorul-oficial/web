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
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1" role="main">
        <div className="container-responsive prose max-w-none py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Contact și Informații de Identificare
            </h1>
            <p className="text-lg text-gray-600">
              Conform Legea 365/2002, afișăm mai jos datele de identificare și contact pentru Decodorul Oficial
            </p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Informații de Identificare
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[120px]">Denumire:</span>
                  <span className="text-gray-900">Decodorul Oficial</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[120px]">E-mail:</span>
                  <a 
                    href="mailto:contact@decodoruloficial.ro" 
                    className="text-brand-info hover:underline font-medium"
                    aria-label="Trimite e-mail la contact@decodoruloficial.ro"
                  >
                    contact@decodoruloficial.ro
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-gray-700 min-w-[120px]">Website:</span>
                  <a 
                    href="/" 
                    className="text-brand-info hover:underline font-medium"
                  >
                    decodoruloficial.ro
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Cum Ne Poți Contacta
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  📧 E-mail
                </h3>
                <p className="text-blue-800 mb-3">
                  Pentru întrebări generale, suport tehnic sau colaborări:
                </p>
                <a 
                  href="mailto:contact@decodoruloficial.ro" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  aria-label="Trimite e-mail la contact@decodoruloficial.ro"
                >
                  Trimite e-mail
                </a>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  ⏰ Răspuns Garantat
                </h3>
                <p className="text-green-800 mb-3">
                  Ne angajăm să răspundem în maxim 48 de ore lucrătoare la toate solicitările.
                </p>
                <div className="text-sm text-green-700">
                  <p><strong>Luni - Vineri:</strong> 9:00 - 18:00</p>
                  <p><strong>Weekend:</strong> Răspuns prin e-mail</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tipuri de Solicitări
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="font-semibold text-gray-800 mb-2">Întrebări Generale</h3>
                <p className="text-sm text-gray-600">
                  Despre serviciile noastre și conținutul site-ului
                </p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold text-gray-800 mb-2">Suport Tehnic</h3>
                <p className="text-sm text-gray-600">
                  Probleme tehnice sau sugestii de îmbunătățire
                </p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Colaborări</h3>
                <p className="text-sm text-gray-600">
                  Propuneri de parteneriat sau colaborare
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Informații Suplimentare
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <strong>IMPORTANT:</strong> Pentru întrebări cu consecințe legale, consultați întotdeauna sursa oficială - Monitorul Oficial al României - și, dacă este necesar, un specialist juridic.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pagini Legate
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/legal" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-info hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Disclaimer și Termeni de Utilizare</h3>
                <p className="text-sm text-gray-600">
                  Informații despre natura serviciului și limitările de răspundere
                </p>
              </a>
              
              <a 
                href="/privacy" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-info hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Politica de Confidențialitate</h3>
                <p className="text-sm text-gray-600">
                  Cum protejăm datele tale personale conform GDPR
                </p>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}


