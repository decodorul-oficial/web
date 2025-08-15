import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = { title: 'Politica de Cookies – Decodorul Oficial' };

export default function CookiesPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-responsive prose max-w-none py-10">
          <h1>Politica de Cookie-uri</h1>
          
          <p className="text-sm text-gray-600 mb-6">
            <strong>Ultima actualizare:</strong> {new Date().toLocaleDateString('ro-RO')}
          </p>

          <h2>1. Ce sunt cookie-urile?</h2>
          <p>
            Cookie-urile sunt fișiere text mici pe care site-ul le stochează pe dispozitivul tău (computer, tabletă, telefon) când îl vizitezi. Acestea permit site-ului să-și "amintească" de acțiunile tale și preferințele tale pentru o perioadă de timp.
          </p>

          <h2>2. De ce folosim cookie-uri?</h2>
          <p>
            Cookie-urile sunt esențiale pentru funcționarea corectă a site-ului și îmbunătățirea experienței tale de navigare. Ele ne ajută să:
          </p>
          <ul>
            <li>Menținem sesiunea ta de navigare</li>
            <li>Îmbunătățim securitatea site-ului</li>
            <li>Analizăm cum este folosit site-ul pentru a-l optimiza</li>
            <li>Personalizăm conținutul în funcție de preferințele tale</li>
            <li>Oferim funcționalități avansate de navigare</li>
          </ul>

          <h2>3. Tipurile de cookie-uri pe care le folosim</h2>

          <h3>3.1 Cookie-uri esențiale (obligatorii)</h3>
          <p>
            Aceste cookie-uri sunt necesare pentru funcționarea de bază a site-ului și nu pot fi dezactivate. Ele nu stochează nicio informație personală identificabilă.
          </p>
          <ul>
            <li><strong>Cookie-uri de sesiune:</strong> mențin sesiunea ta activă pe site</li>
            <li><strong>Cookie-uri de securitate:</strong> protejează împotriva atacurilor și fraudelor</li>
            <li><strong>Cookie-uri de funcționalitate:</strong> permit funcționarea corectă a formularelor și navigării</li>
          </ul>

          <h3>3.2 Cookie-uri de performanță (analitice)</h3>
          <p>
            Aceste cookie-uri ne ajută să înțelegem cum interacționezi cu site-ul prin colectarea de informații anonime despre utilizare. Ele sunt activate doar cu consimțământul tău explicit.
          </p>
          <ul>
            <li><strong>Cookie-uri Google Analytics:</strong> măsoară traficul și comportamentul utilizatorilor</li>
            <li><strong>Cookie-uri de performanță:</strong> monitorizează timpul de încărcare și erorile</li>
            <li><strong>Cookie-uri de utilizare:</strong> analizează paginile cele mai populare</li>
          </ul>

          <h3>3.3 Cookie-uri de funcționalitate (opționale)</h3>
          <p>
            Aceste cookie-uri îmbunătățesc funcționalitatea site-ului și personalizarea experienței tale.
          </p>
          <ul>
            <li><strong>Cookie-uri de preferințe:</strong> salvează setările tale (limba, tema, etc.)</li>
            <li><strong>Cookie-uri de social media:</strong> permit integrarea cu platformele sociale (dacă aplicabil)</li>
          </ul>

          <h2>4. Cookie-uri terțe părți</h2>
          <p>
            Site-ul nostru poate integra servicii de la terțe părți care pot seta propriile cookie-uri:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> pentru analiza traficului (cu consimțământul tău)</li>
            <li><strong>Servicii de hosting:</strong> pentru funcționarea tehnică a site-ului</li>
            <li><strong>Servicii de securitate:</strong> pentru protecția împotriva atacurilor</li>
          </ul>

          <h2>5. Durata de viață a cookie-urilor</h2>
          <ul>
            <li><strong>Cookie-uri de sesiune:</strong> se șterg automat când închizi browserul</li>
            <li><strong>Cookie-uri persistente:</strong> rămân pe dispozitivul tău pentru o perioadă specificată</li>
            <li><strong>Cookie-uri de terțe părți:</strong> respectă politicile de confidențialitate ale furnizorilor respectivi</li>
          </ul>

          <h2>6. Cum să gestionezi cookie-urile</h2>
          
          <h3>6.1 În browserul tău</h3>
          <p>
            Poți controla și șterge cookie-urile din setările browserului tău. Fiecare browser are propriile setări:
          </p>
          <ul>
            <li><strong>Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri</li>
            <li><strong>Firefox:</strong> Opțiuni → Confidențialitate și securitate → Cookie-uri</li>
            <li><strong>Safari:</strong> Preferințe → Confidențialitate → Cookie-uri</li>
            <li><strong>Edge:</strong> Setări → Cookie-uri și permisiuni site</li>
          </ul>

          <h3>6.2 Pe site-ul nostru</h3>
          <p>
            Site-ul nostru oferă un banner de consimțământ pentru cookie-urile non-esențiale. Poți:
          </p>
          <ul>
            <li>Accepta toate cookie-urile</li>
            <li>Respinge cookie-urile non-esențiale</li>
            <li>Personaliza setările cookie-urilor</li>
            <li>Modifica preferințele oricând din footer-ul site-ului</li>
          </ul>

          <h2>7. Impactul dezactivării cookie-urilor</h2>
          <p>
            Dacă dezactivezi cookie-urile, unele funcționalități ale site-ului pot să nu funcționeze corect:
          </p>
          <ul>
            <li>Navigarea poate fi afectată</li>
            <li>Preferințele tale nu vor fi salvate</li>
            <li>Unele funcții avansate pot să nu fie disponibile</li>
            <li>Experiența de utilizare poate fi degradată</li>
          </ul>

          <h2>8. Cookie-uri și confidențialitatea</h2>
          <p>
            Cookie-urile pe care le folosim <strong>nu conțin informații personale identificabile</strong> precum numele, adresa sau numărul de telefon. Ele stochează doar informații tehnice și de utilizare pentru a îmbunătăți serviciul nostru.
          </p>

          <h2>9. Actualizări ale politicii de cookie-uri</h2>
          <p>
            Această politică poate fi actualizată periodic pentru a reflecta schimbările în tehnologia de cookie-uri sau în legislația în vigoare. Modificările vor fi comunicate prin actualizarea datei de "Ultima actualizare".
          </p>

          <h2>10. Contact pentru cookie-uri</h2>
          <p>
            Pentru orice întrebări privind această politică de cookie-uri, ne poți contacta:
          </p>
          <ul>
            <li><strong>E-mail:</strong> contact@decodoruloficial.ro</li>
            <li><strong>Pagina de contact:</strong> <a href="/contact" className="text-brand-info hover:underline">/contact</a></li>
          </ul>

          <h2>11. Informații suplimentare</h2>
          <p>
            Pentru informații complete despre cum protejăm confidențialitatea ta, consultă și <a href="/privacy" className="text-brand-info hover:underline">Politica noastră de Confidențialitate</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}


