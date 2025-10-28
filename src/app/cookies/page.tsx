import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';
import { TableOfContents } from '@/components/legal/TableOfContents';

export const metadata: Metadata = {
  title: 'Politica de Cookie-uri | Decodorul Oficial',
  description: 'Politica de cookie-uri Decodorul Oficial conform GDPR. Informații despre tipurile de cookie-uri folosite, durata de viață și cum să le gestionezi.',
  keywords: [
    'politica cookie-uri decodorul oficial',
    'cookie-uri GDPR românia',
    'cookie-uri esențiale',
    'cookie-uri analytics',
    'cookie-uri funcționalitate',
    'gestionează cookie-uri',
    'cookie-uri Monitorul Oficial',
    'cookie-uri legislație românia',
    'cookie-uri confidențialitate',
    'cookie-uri browser'
  ],
  openGraph: {
    title: 'Politica de Cookie-uri | Decodorul Oficial',
    description: 'Politica de cookie-uri Decodorul Oficial conform GDPR. Informații despre tipurile de cookie-uri folosite.',
    url: '/cookies',
    siteName: 'Decodorul Oficial',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Politica de Cookie-uri | Decodorul Oficial',
    description: 'Politica de cookie-uri Decodorul Oficial conform GDPR.',
  },
  alternates: {
    canonical: '/cookies',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPolicyPage() {
  const currentDate = new Date().toLocaleDateString('ro-RO');
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1" role="main">
        <div className="container-responsive">
          {/* Table of Contents - positioned under header */}
          <div className="mb-6">
            <TableOfContents className="max-w-4xl mx-auto" />
          </div>
          
          <div className="prose max-w-none py-10 max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Politica de Cookie-uri
            </h1>
            
            <p className="text-sm text-gray-600 mb-6">
              <strong>Ultima actualizare:</strong> {currentDate} - Actualizat implementarea cookie-urilor pentru respectarea GDPR
            </p>
          </header>

          <section className="mb-8" id="ce-sunt-cookie-urile">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Ce Sunt Cookie-urile?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookie-urile sunt fișiere text mici pe care site-ul le stochează pe dispozitivul tău (computer, tabletă, telefon) când îl vizitezi. Acestea permit site-ului să-și &quot;amintească&quot; de acțiunile tale și preferințele tale pentru o perioadă de timp.
            </p>
          </section>

          <section className="mb-8" id="de-ce-folosim-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. De Ce Folosim Cookie-uri?
            </h2>
            <p className="text-gray-700 mb-4">
              Cookie-urile sunt esențiale pentru funcționarea corectă a site-ului și îmbunătățirea experienței tale de navigare. Ele ne ajută să:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Menținem sesiunea ta de navigare</li>
              <li>Îmbunătățim securitatea site-ului</li>
              <li>Analizăm cum este folosit site-ul pentru a-l optimiza</li>
              <li>Personalizăm conținutul în funcție de preferințele tale</li>
              <li>Oferim funcționalități avansate de navigare</li>
            </ul>
          </section>

          <section className="mb-8" id="tipurile-de-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Tipurile de Cookie-uri pe Care le Folosim
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.1 Cookie-uri Esențiale (Obligatorii)
            </h3>
            <p className="text-gray-700 mb-4">
              Aceste cookie-uri sunt necesare pentru funcționarea de bază a site-ului și nu pot fi dezactivate. Ele nu stochează nicio informație personală identificabilă.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Cookie-uri de sesiune:</strong> mențin sesiunea ta activă pe site</li>
              <li><strong>Cookie-uri de securitate:</strong> protejează împotriva atacurilor și fraudelor</li>
              <li><strong>Cookie-uri de funcționalitate:</strong> permit funcționarea corectă a formularelor și navigării</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.2 Cookie-uri de Performanță (Analitice)
            </h3>
            <p className="text-gray-700 mb-4">
              Aceste cookie-uri ne ajută să înțelegem cum interacționezi cu site-ul prin colectarea de informații anonime despre utilizare. Ele sunt activate <strong>doar cu consimțământul tău explicit</strong> și pot fi revocate oricând.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Cookie-uri Google Analytics:</strong> măsoară traficul și comportamentul utilizatorilor</li>
              <li><strong>Cookie-ul mo_session:</strong> identificator unic persistent pentru analytics îmbunătățite (UUID v4, expirare 1 an)</li>
              <li><strong>Cookie-uri de performanță:</strong> monitorizează timpul de încărcare și erorile</li>
              <li><strong>Cookie-uri de utilizare:</strong> analizează paginile cele mai populare</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.3 Cookie-uri de Funcționalitate (Opționale)
            </h3>
            <p className="text-gray-700 mb-4">
              Aceste cookie-uri îmbunătățesc funcționalitatea site-ului și personalizarea experienței tale.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Cookie-uri de preferințe:</strong> salvează setările tale (limba, tema, etc.)</li>
              <li><strong>Cookie-uri de social media:</strong> permit integrarea cu platformele sociale (dacă aplicabil)</li>
              <li><strong>Cookie-uri de newsletter:</strong> gestionează preferințele tale pentru newsletter și consimțământul pentru marketing</li>
              <li><strong>Cookie-uri de tracking newsletter:</strong> monitorizează numărul de știri vizualizate pentru afișarea inteligentă a modal-ului newsletter</li>
            </ul>
          </section>

          <section className="mb-8" id="sessionstorage-si-stocarea-locala">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3.4 SessionStorage și Stocarea Locală
            </h2>
            <p className="text-gray-700 mb-4">
              Pe lângă cookie-uri, site-ul nostru folosește și <strong>sessionStorage</strong> - o tehnologie de stocare locală în browser care îmbunătățește experiența de navigare:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Persistența căutării:</strong> salvează filtrele și pagina curentă din secțiunea de căutare avansată știri</li>
              <li><strong>Navigare fluidă:</strong> permite revenirea la aceeași pagină și filtre când navighezi între știri</li>
              <li><strong>Stocare temporară:</strong> datele se șterg automat când închizi tab-ul sau browserul</li>
              <li><strong>Fără date personale:</strong> nu stochează informații care te pot identifica personal</li>
              <li><strong>Expirare automată:</strong> datele se șterg automat după 24 de ore pentru siguranță</li>
            </ul>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="text-sm text-green-700">
                <strong>Avantaje sessionStorage:</strong> SessionStorage este mai sigur decât cookie-urile persistente deoarece datele se șterg automat când închizi browserul și nu sunt transmise la server cu fiecare cerere.
              </p>
            </div>
          </section>

          <section className="mb-8" id="cookie-uri-newsletter-marketing">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3.5 Cookie-uri de Newsletter și Marketing
            </h2>
            <p className="text-gray-700 mb-4">
              Aceste cookie-uri sunt folosite pentru gestionarea newsletter-ului și a preferințelor tale de marketing:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li><strong>Cookie-uri de consimțământ newsletter:</strong> salvează consimțământul tău pentru primirea newsletter-ului</li>
              <li><strong>Cookie-uri de preferințe newsletter:</strong> stochează preferințele tale pentru tipul de conținut dorit</li>
              <li><strong>Cookie-uri de tracking newsletter:</strong> monitorizează interacțiunile cu newsletter-ul pentru îmbunătățirea serviciului</li>
              <li><strong>Cookie-uri de segmentare:</strong> permit personalizarea conținutului newsletter-ului în funcție de interesele tale</li>
              <li><strong>Cookie-uri de tracking comportamental newsletter:</strong> monitorizează numărul de știri vizualizate pentru afișarea inteligentă a modal-ului newsletter la intervale specifice (3, 9, 18 știri)</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> Cookie-urile de newsletter sunt activate <strong>doar cu consimțământul tău explicit</strong> și pot fi revocate oricând din setările tale. Tracking-ul comportamental pentru newsletter se oprește automat când te dezabonezi.
              </p>
            </div>
          </section>

          <section className="mb-8" id="cookie-uri-terte-parti">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Cookie-uri Terțe Părți și SessionStorage
            </h2>
            <p className="text-gray-700 mb-4">
              Site-ul nostru poate integra servicii de la terțe părți care pot seta propriile cookie-uri. SessionStorage-ul este folosit exclusiv de noi:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Google Analytics:</strong> pentru analiza traficului (cu consimțământul tău)</li>
              <li><strong>Google AdSense (Auto ads, includând Vignette interstitials):</strong> afișează reclame pentru utilizatorii fără abonament activ sau trial, <strong>numai dacă îți exprimi consimțământul pentru cookie-uri non-esențiale</strong>. Poți controla consimțământul din bannerul de pe site.</li>
              <li><strong>Servicii de hosting:</strong> pentru funcționarea tehnică a site-ului</li>
              <li><strong>Servicii de securitate:</strong> pentru protecția împotriva atacurilor</li>
              <li><strong>SessionStorage local:</strong> folosit exclusiv de noi pentru persistența căutării, nu este partajat cu terți</li>
            </ul>
          </section>

          <section className="mb-8" id="durata-de-viata-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Durata de Viață a Cookie-urilor și SessionStorage
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Cookie-uri de sesiune:</strong> se șterg automat când închizi browserul</li>
              <li><strong>Cookie-uri persistente:</strong> rămân pe dispozitivul tău pentru o perioadă specificată</li>
              <li><strong>Cookie-ul mo_session:</strong> se setează doar cu consimțământul pentru analytics și se elimină automat când consimțământul este revocat</li>
              <li><strong>Cookie-uri de terțe părți:</strong> respectă politicile de confidențialitate ale furnizorilor respectivi</li>
              <li><strong>SessionStorage pentru căutare:</strong> se șterge automat când închizi tab-ul sau browserul, cu expirare suplimentară după 24 de ore</li>
            </ul>
          </section>

          <section className="mb-8" id="cum-sa-gestionezi-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Cum să Gestionezi Cookie-urile și SessionStorage
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6.1 În Browserul Tău
            </h3>
            <p className="text-gray-700 mb-4">
              Poți controla și șterge cookie-urile și sessionStorage-ul din setările browserului tău. Fiecare browser are propriile setări:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri</li>
                <li><strong>Firefox:</strong> Opțiuni → Confidențialitate și securitate → Cookie-uri</li>
              </ul>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Safari:</strong> Preferințe → Confidențialitate → Cookie-uri</li>
                <li><strong>Edge:</strong> Setări → Cookie-uri și permisiuni site</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6.2 Pe Site-ul Nostru
            </h3>
            <p className="text-gray-700 mb-4">
              Site-ul nostru oferă un banner de consimțământ pentru cookie-urile non-esențiale. Pentru sessionStorage și cookie-uri poți:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Accepta toate cookie-urile (inclusiv analytics, mo_session, newsletter și AdSense)</li>
              <li>Respinge cookie-urile non-esențiale (analytics, mo_session, newsletter și AdSense nu se vor seta)</li>
              <li>Modifica preferințele oricând din footer-ul site-ului</li>
              <li>Revoca consimțământul pentru analytics/marketing (cookie-ul mo_session se va elimina automat și AdSense nu va rula)</li>
              <li>Gestionează preferințele newsletter-ului din setările tale</li>
              <li><strong>SessionStorage:</strong> se șterge automat când închizi browserul (nu necesită consimțământ explicit)</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 rounded">
              <p className="text-sm text-blue-700">
                <strong>Notă importantă:</strong> Cookie-ul mo_session, Google Analytics și Google AdSense (inclusiv interstițiale Vignette) sunt activate <strong>doar cu consimțământul tău explicit</strong>. Dacă respingi cookie-urile de analytics/marketing, acestea nu se vor seta și reclamele nu vor fi afișate.
              </p>
            </div>
          </section>

          <section className="mb-8" id="impactul-dezactivarii-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Impactul Dezactivării Cookie-urilor și SessionStorage
            </h2>
            <p className="text-gray-700 mb-4">
              Dacă dezactivezi cookie-urile sau sessionStorage, unele funcționalități ale site-ului pot să nu funcționeze corect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Navigarea poate fi afectată</li>
              <li>Preferințele tale nu vor fi salvate</li>
              <li>Unele funcții avansate pot să nu fie disponibile</li>
              <li>Experiența de utilizare poate fi degradată</li>
              <li><strong>Analytics și tracking-ul comportamentului nu vor funcționa</strong></li>
              <li><strong>Persistența căutării:</strong> nu vei putea reveni la aceeași pagină și filtre în secțiunea de știri</li>
              <li><strong>Navigare între știri:</strong> butonul &quot;back&quot; nu va restaura starea anterioară de căutare</li>
            </ul>
          </section>

          <section className="mb-8" id="cookie-uri-confidentialitate">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Cookie-uri, SessionStorage și Confidențialitatea
            </h2>
            <p className="text-gray-700 mb-4">
              Cookie-urile și sessionStorage-ul pe care le folosim <strong>nu conțin informații personale identificabile</strong> precum numele, adresa sau numărul de telefon. Ele stochează doar informații tehnice și de utilizare pentru a îmbunătăți serviciul nostru.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>SessionStorage pentru căutare:</strong> Stochează doar filtrele de căutare (cuvinte cheie, date, sortare) și numărul paginii curente. Aceste date sunt:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Stocate local în browserul tău (nu sunt trimise la server)</li>
              <li>Șterse automat când închizi tab-ul sau browserul</li>
              <li>Expirate automat după 24 de ore pentru siguranță</li>
              <li>Fără informații care te pot identifica personal</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Cookie-ul mo_session:</strong> Este un identificator unic generat automat (UUID v4) care nu conține informații personale. Este folosit exclusiv pentru:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Analiza comportamentului utilizatorilor pentru îmbunătățirea serviciului</li>
              <li>Identificarea unică a sesiunilor de navigare</li>
              <li>Statistici agregate despre utilizarea site-ului</li>
              <li>Personalizarea experienței de navigare</li>
            </ul>
            <p className="text-gray-700">
              Acest cookie este setat <strong>doar cu consimțământul tău pentru analytics</strong> și se elimină automat când revoci consimțământul. Nu poate fi folosit pentru a te identifica personal. <strong>Reclamele Google AdSense (inclusiv interstițiale de tip Vignette)</strong> vor rula doar dacă ți-ai exprimat consimțământul pentru cookie-uri non-esențiale.
            </p>
          </section>

          <section className="mb-8" id="controlul-si-revocarea-consimtamantului">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Controlul și Revocarea Consimțământului
            </h2>
            <p className="text-gray-700 mb-4">
              Ai controlul total asupra cookie-urilor de analytics și sessionStorage-ului:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Consimțământ inițial:</strong> Banner-ul de cookie-uri îți permite să accepti sau să respingi analytics</li>
              <li><strong>Revocare:</strong> Poți revoca consimțământul oricând din footer-ul site-ului</li>
              <li><strong>Eliminare automată:</strong> Când revoci consimțământul, cookie-ul mo_session se elimină automat</li>
              <li><strong>Google Analytics:</strong> Script-ul se dezactivează complet când nu ai consimțământ</li>
              <li><strong>SessionStorage:</strong> Se șterge automat când închizi browserul, nu necesită consimțământ explicit</li>
            </ul>
          </section>

          <section className="mb-8" id="actualizari-politica-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              10. Actualizări ale Politicii de Cookie-uri și SessionStorage
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Această politică poate fi actualizată periodic pentru a reflecta schimbările în tehnologia de cookie-uri, sessionStorage sau în legislația în vigoare. Modificările vor fi comunicate prin actualizarea datei de &quot;Ultima actualizare&quot;.
            </p>
          </section>

          <section className="mb-8" id="contact-cookie-uri">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              11. Contact pentru Cookie-uri și SessionStorage
            </h2>
            <p className="text-gray-700 mb-4">
              Pentru orice întrebări privind această politică de cookie-uri și sessionStorage, ne poți contacta:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>E-mail:</strong> contact@decodoruloficial.ro</li>
              <li><strong>Pagina de contact:</strong> <a href="/contact" className="text-brand-info hover:underline">/contact</a></li>
              <li><strong>Dezabonare newsletter:</strong> <a href="/newsletter/unsubscribe" className="text-brand-info hover:underline">/newsletter/unsubscribe</a></li>
            </ul>
          </section>

          <section className="mb-8" id="informatii-suplimentare">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              12. Informații Suplimentare
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pentru informații complete despre cum protejăm confidențialitatea ta și despre utilizarea sessionStorage-ului, consultă și <a href="/privacy" className="text-brand-info hover:underline">Politica noastră de Confidențialitate</a>.
            </p>
          </section>

          <section className="mb-8" id="conformitatea-gdpr">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              13. Conformitatea GDPR
            </h2>
            <p className="text-gray-700 mb-4">
              Implementarea noastră de cookie-uri și sessionStorage respectă complet Regulamentul General privind Protecția Datelor (GDPR):
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Consimțământ explicit:</strong> Cookie-urile de analytics se activează doar cu acordul tău</li>
                <li><strong>Control total:</strong> Poți revoca consimțământul oricând</li>
                <li><strong>Eliminare automată:</strong> Cookie-urile se elimină automat când revoci consimțământul</li>
                <li><strong>SessionStorage sigur:</strong> Nu necesită consimțământ explicit, se șterge automat</li>
              </ul>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Transparență:</strong> Toate informațiile despre cookie-uri și sessionStorage sunt disponibile public</li>
                <li><strong>Minimizarea datelor:</strong> Colectăm doar datele necesare pentru funcționalitatea site-ului</li>
                <li><strong>Stocare locală:</strong> SessionStorage nu trimite date la server</li>
              </ul>
            </div>
          </section>

          <section className="mb-8" id="pagini-legate">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pagini Legate
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/privacy" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-info hover:shadow-md transition-all no-underline"
                style={{ textDecoration: 'none' }}
              >
                <h3 className="font-semibold text-gray-800 mb-2">Politica de Confidențialitate</h3>
                <p className="text-sm text-gray-600">
                  Informații complete despre protecția datelor personale și sessionStorage
                </p>
              </a>
              
              <a 
                href="/contact" 
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-info hover:shadow-md transition-all no-underline"
                style={{ textDecoration: 'none' }}
              >
                <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
                <p className="text-sm text-gray-600">
                  Cum ne poți contacta pentru întrebări despre cookie-uri și sessionStorage
                </p>
              </a>
            </div>
          </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


