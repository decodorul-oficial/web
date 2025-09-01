import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate | Decodorul Oficial',
  description: 'Politica de confidențialitate Decodorul Oficial conform GDPR. Informații despre colectarea, utilizarea și protecția datelor personale pe site-ul nostru.',
  keywords: [
    'politica confidențialitate decodorul oficial',
    'GDPR românia',
    'protecția datelor personale',
    'cookie-uri confidențialitate',
    'Monitorul Oficial confidențialitate',
    'legislație confidențialitate românia',
    'drepturi GDPR utilizatori',
    'colectare date personale',
    'stocare date confidențiale',
    'ANSPDCP plângeri'
  ],
  openGraph: {
    title: 'Politica de Confidențialitate | Decodorul Oficial',
    description: 'Politica de confidențialitate Decodorul Oficial conform GDPR. Informații despre protecția datelor personale.',
    url: '/privacy',
    siteName: 'Decodorul Oficial',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Politica de Confidențialitate | Decodorul Oficial',
    description: 'Politica de confidențialitate Decodorul Oficial conform GDPR.',
  },
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('ro-RO');
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1" role="main">
        <div className="container-responsive prose max-w-none py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Politica de Confidențialitate
            </h1>
            
            <p className="text-sm text-gray-600 mb-6">
              <strong>Ultima actualizare:</strong> {currentDate}
            </p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Informații Generale
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Decodorul Oficial (denumit în continuare &quot;site-ul&quot;, &quot;noi&quot;, &quot;nostru&quot;) respectă confidențialitatea utilizatorilor săi și se angajează să protejeze datele personale conform Regulamentului General privind Protecția Datelor (GDPR) și legislației române în vigoare.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Această politică de confidențialitate explică cum colectăm, utilizăm, stocăm și protejăm informațiile tale personale când vizitezi site-ul nostru.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Datele pe Care le Colectăm
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.1 Date Colectate Automat
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Date tehnice:</strong> adresa IP, tipul browserului, sistemul de operare, timpul de acces</li>
              <li><strong>Date de utilizare:</strong> paginile vizitate, timpul petrecut pe site, link-urile accesate</li>
              <li><strong>Cookie-uri:</strong> pentru funcționarea site-ului și îmbunătățirea experienței utilizatorului</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.2 Date Furnizate Voluntar
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Formulare de contact:</strong> nume, e-mail, mesaj (dacă există)</li>
              <li><strong>Feedback:</strong> comentarii sau sugestii (dacă sunt implementate)</li>
              <li><strong>Newsletter:</strong> adresa de email pentru înscrierea la newsletter, preferințe de conținut, consimțământ pentru marketing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Scopul Colectării Datelor
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Funcționarea site-ului:</strong> afișarea conținutului, navigarea, securitatea</li>
              <li><strong>Îmbunătățirea serviciilor:</strong> analiza traficului, optimizarea performanței</li>
              <li><strong>Comunicarea:</strong> răspunsul la solicitări, informări despre servicii</li>
              <li><strong>Newsletter și marketing:</strong> trimiterea de informații relevante, actualizări legislative, știri importante</li>
              <li><strong>Conformitatea legală:</strong> respectarea obligațiilor legale și reglementărilor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Temeiul Legal pentru Prelucrare
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Interesul legitim:</strong> funcționarea și îmbunătățirea site-ului</li>
              <li><strong>Consimțământul:</strong> pentru cookie-urile non-esențiale (dacă aplicabil)</li>
              <li><strong>Obligația legală:</strong> conformitatea cu legislația în vigoare</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Partajarea Datelor
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>Nu vindem, nu închiriem și nu partajăm datele tale personale cu terți</strong>, cu excepția cazurilor:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Furnizorii de servicii tehnice (hosting, analytics) care ne ajută să operăm site-ul</li>
              <li>Autoritățile competente, când este necesar conform legii</li>
              <li>Cu consimțământul tău explicit, în situații specifice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Securitatea Datelor
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele tale personale împotriva accesului neautorizat, modificării, dezvăluirii sau distrugerii accidentale.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Stocarea Datelor
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Datele tale personale sunt stocate doar pentru perioada necesară îndeplinirii scopurilor pentru care au fost colectate, respectând obligațiile legale de păstrare.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Drepturile Tale GDPR
            </h2>
            <p className="text-gray-700 mb-4">Conform GDPR, ai următoarele drepturi:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Dreptul de acces:</strong> să știi ce date avem despre tine</li>
                <li><strong>Dreptul de rectificare:</strong> să corectezi datele incorecte</li>
                <li><strong>Dreptul de ștergere:</strong> să ștergi datele tale (dreptul de a fi uitat)</li>
                <li><strong>Dreptul de restricționare:</strong> să limitezi prelucrarea datelor</li>
              </ul>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Dreptul de portabilitate:</strong> să primești datele într-un format structurat</li>
                <li><strong>Dreptul de opoziție:</strong> să te opui prelucrării datelor</li>
                <li><strong>Dreptul de retragere a consimțământului:</strong> să retragi consimțământul dat</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Newsletter și Marketing
            </h2>
            <p className="text-gray-700 mb-4">
              Dacă te înscrii la newsletter-ul nostru, colectăm următoarele informații:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li><strong>Adresa de email:</strong> pentru trimiterea newsletter-ului</li>
              <li><strong>Preferințe de conținut:</strong> tipul de informații pe care dorești să le primești</li>
              <li><strong>Consimțământul:</strong> confirmarea că accepti să primești comunicări de marketing</li>
              <li><strong>Date de utilizare:</strong> interacțiunile cu newsletter-ul pentru îmbunătățirea serviciului</li>
              <li><strong>Date de tracking comportamental:</strong> numărul de știri vizualizate pentru afișarea inteligentă a modal-ului newsletter</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Tracking-ul comportamental pentru newsletter:</strong> Pentru a îmbunătăți experiența ta și a oferi conținut relevant, monitorizăm numărul de știri pe care le vizualizezi. Acest tracking se folosește pentru a afișa modal-ul newsletter-ului la intervale specifice (după 3, 9, 18 știri vizualizate) și se oprește automat când te dezabonezi.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Drepturile tale:</strong> Poți să te dezabonezi oricând folosind link-ul din newsletter sau vizitând <a href="/newsletter/unsubscribe" className="text-brand-info hover:underline">pagina de dezabonare</a>. La dezabonare, toate datele de tracking pentru newsletter sunt șterse automat.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-700">
                <strong>Consimțământ explicit:</strong> Newsletter-ul se trimite <strong>doar cu consimțământul tău explicit</strong> și poate fi revocat oricând. Tracking-ul comportamental pentru newsletter se activează doar dacă ai acceptat cookie-urile de analytics.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              10. Cookie-uri
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pentru informații detaliate despre cookie-urile pe care le folosim, consultă <a href="/cookies" className="text-brand-info hover:underline">Politica noastră de Cookie-uri</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              11. Modificări ale Politicii
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a actualiza această politică de confidențialitate. Modificările vor fi comunicate prin actualizarea datei de &quot;Ultima actualizare&quot; și, dacă este cazul, prin notificări pe site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              12. Contact pentru Confidențialitate
            </h2>
            <p className="text-gray-700 mb-4">
              Pentru orice întrebări privind această politică de confidențialitate sau pentru exercitarea drepturilor GDPR, ne poți contacta:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>E-mail:</strong> contact@decodoruloficial.ro</li>
              <li><strong>Pagina de contact:</strong> <a href="/contact" className="text-brand-info hover:underline">/contact</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              13. Autoritatea de Supraveghere
            </h2>
            <p className="text-gray-700 mb-4">
              Ai dreptul să depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) dacă consideri că prelucrarea datelor tale personale încalcă GDPR-ul.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>ANSPDCP:</strong> B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, România
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              14. Pagini Legate
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/cookies" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-info hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Politica de Cookie-uri</h3>
                <p className="text-sm text-gray-600">
                  Informații detaliate despre cookie-urile folosite pe site
                </p>
              </a>
              
              <a 
                href="/contact" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-info hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
                <p className="text-sm text-gray-600">
                  Cum ne poți contacta pentru întrebări despre confidențialitate
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


