import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';
import { UnsubscribeNewsletterForm } from '@/components/newsletter/UnsubscribeNewsletterForm';

export const metadata: Metadata = {
  title: 'Dezabonare Newsletter | Decodorul Oficial',
  description: 'Dezabonează-te de la newsletter-ul Decodorul Oficial. Proces simplu și rapid pentru a opri primirea email-urilor.',
  robots: {
    index: false,
    follow: false,
  },
};

interface UnsubscribePageProps {
  searchParams: {
    email?: string;
  };
}

export default function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1" role="main">
        <div className="container-responsive max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dezabonare Newsletter
            </h1>
            <p className="text-gray-600">
              Ne pare rău să te vedem plecând. Te rugăm să ne spui de ce te dezabonezi pentru a ne îmbunătăți serviciul.
            </p>
          </div>

          <UnsubscribeNewsletterForm initialEmail={searchParams.email} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
