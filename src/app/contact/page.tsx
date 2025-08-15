import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = { title: 'Contact și informații de identificare – Decodorul Oficial' };

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-responsive prose max-w-none py-10">
          <h1>Contact și informații de identificare</h1>
          <p>
            În conformitate cu Legea 365/2002, afișăm mai jos datele de identificare și contact:
          </p>
          <ul>
            <li><strong>Denumire</strong>: Decodorul Oficial (exemplu – actualizați cu date reale)</li>
            <li><strong>Sediu/Domiciliu</strong>: [adresa dvs.]</li>
            <li><strong>E-mail</strong>: contact@example.com</li>
            <li><strong>Telefon</strong>: [opțional]</li>
            <li><strong>Registrul Comerțului</strong>: J00/0000/2025 (dacă este cazul)</li>
            <li><strong>CUI</strong>: RO00000000 (dacă este cazul)</li>
          </ul>
          <p>
            Vă rugăm înlocuiți textul de mai sus cu datele reale ale deținătorului serviciului. Până la completare,
            secțiunea servește ca șablon conform legii.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}


