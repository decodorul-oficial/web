import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata: Metadata = {
  title: 'Autentificare | Decodorul Oficial',
  description: 'Pagina de autentificare Decodorul Oficial. Accesează contul tău pentru funcționalități avansate și conținut personalizat.',
  keywords: [
    'autentificare decodorul oficial',
    'login legislație românia',
    'cont utilizator Monitorul Oficial',
    'acces personalizat legislație',
    'login decodor oficial',
    'autentificare site legislație',
    'cont utilizator românia',
    'login acte normative'
  ],
  openGraph: {
    title: 'Autentificare | Decodorul Oficial',
    description: 'Pagina de autentificare Decodorul Oficial. Accesează contul tău pentru funcționalități avansate.',
    url: '/login',
    siteName: 'Decodorul Oficial',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Autentificare | Decodorul Oficial',
    description: 'Pagina de autentificare Decodorul Oficial.',
  },
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1" role="main">
        <div className="container-responsive py-10">
          <div className="max-w-md mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Autentificare
              </h1>
              <p className="text-gray-600">
                Accesează contul tău pentru funcționalități avansate
              </p>
            </header>

            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Funcționalitate în Dezvoltare
                </h2>
                <p className="text-gray-600 mb-6">
                  Această pagină este în curs de implementare. În curând vei putea să te autentifici pentru a accesa funcționalități avansate.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Ce Vei Putea Face
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Salvezi știrile favorite</li>
                    <li>• Primești notificări despre actualizări</li>
                    <li>• Accesezi conținut personalizat</li>
                    <li>• Partajezi comentarii și feedback</li>
                  </ul>
                </div>

                <a 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-info hover:bg-brand-highlight transition-colors"
                  aria-label="Înapoi la pagina principală"
                >
                  ← Înapoi la Prima Pagină
                </a>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Ai întrebări? <a href="/contact" className="text-brand-info hover:underline">Contactează-ne</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


