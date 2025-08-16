import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata = { title: 'Contact și informații de identificare – Decodorul Oficial' };

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1">
        <div className="container-responsive prose max-w-none py-10">
          <h1>Contact și informații de identificare</h1>
          <p>
            În conformitate cu Legea 365/2002, afișăm mai jos datele de identificare și contact:
          </p>
          <ul>
            <li><strong>Denumire</strong>: Decodorul Oficial</li>
            <li>
              <strong>E-mail</strong>: <a href="mailto:contact@decodoruloficial.ro">contact@decodoruloficial.ro</a>
            </li>
          </ul>
          
        </div>
      </main>
      <Footer />
    </div>
  );
}


