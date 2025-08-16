import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata = { title: 'Politica de Cookies – Decodorul Oficial' };

export default function CookiesPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1">
        <div className="container-responsive prose max-w-none py-10">
          <h1>Politica de Cookie-uri</h1>
          
          <p className="text-sm text-gray-600 mb-6">
            <strong>Ultima actualizare:</strong> {new Date().toLocaleDateString('ro-RO')} - Actualizat implementarea cookie-urilor pentru respectarea GDPR
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
            Aceste cookie-uri ne ajută să înțelegem cum interacționezi cu site-ul prin colectarea de informații anonime despre utilizare. Ele sunt activate <strong>doar cu consimțământul tău explicit</strong> și pot fi revocate oricând.
          </p>
          <ul>
            <li><strong>Cookie-uri Google Analytics:</strong> măsoară traficul și comportamentul utilizatorilor</li>
            <li><strong>Cookie-ul mo_session:</strong> identificator unic persistent pentru analytics îmbunătățite (UUID v4, expirare 1 an)</li>
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
            <li><strong>Cookie-ul mo_session:</strong> se setează doar cu consimțământul pentru analytics și se elimină automat când consimțământul este revocat</li>
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
            <li>Accepta toate cookie-urile (inclusiv analytics și mo_session)</li>
            <li>Respinge cookie-urile non-esențiale (analytics și mo_session nu se vor seta)</li>
            <li>Modifica preferințele oricând din footer-ul site-ului</li>
            <li>Revoca consimțământul pentru analytics (cookie-ul mo_session se va elimina automat)</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Notă importantă:</strong> Cookie-ul mo_session și Google Analytics sunt activate <strong>doar cu consimțământul tău explicit</strong>. Dacă respingi cookie-urile de analytics, acestea nu se vor seta deloc.
          </p>

          <h2>7. Impactul dezactivării cookie-urilor</h2>
          <p>
            Dacă dezactivezi cookie-urile, unele funcționalități ale site-ului pot să nu funcționeze corect:
          </p>
          <ul>
            <li>Navigarea poate fi afectată</li>
            <li>Preferințele tale nu vor fi salvate</li>
            <li>Unele funcții avansate pot să nu fie disponibile</li>
            <li>Experiența de utilizare poate fi degradată</li>
            <li><strong>Analytics și tracking-ul comportamentului nu vor funcționa</strong></li>
          </ul>

          <h2>8. Cookie-uri și confidențialitatea</h2>
          <p>
            Cookie-urile pe care le folosim <strong>nu conțin informații personale identificabile</strong> precum numele, adresa sau numărul de telefon. Ele stochează doar informații tehnice și de utilizare pentru a îmbunătăți serviciul nostru.
          </p>
          <p>
            <strong>Cookie-ul mo_session:</strong> Este un identificator unic generat automat (UUID v4) care nu conține informații personale. Este folosit exclusiv pentru:
          </p>
          <ul>
            <li>Analiza comportamentului utilizatorilor pentru îmbunătățirea serviciului</li>
            <li>Identificarea unică a sesiunilor de navigare</li>
            <li>Statistici agregate despre utilizarea site-ului</li>
            <li>Personalizarea experienței de navigare</li>
          </ul>
          <p>
            Acest cookie este setat <strong>doar cu consimțământul tău pentru analytics</strong> și se elimină automat când revoci consimțământul. Nu poate fi folosit pentru a te identifica personal.
          </p>

          <h2>9. Controlul și revocarea consimțământului</h2>
          <p>
            Ai controlul total asupra cookie-urilor de analytics:
          </p>
          <ul>
            <li><strong>Consimțământ inițial:</strong> Banner-ul de cookie-uri îți permite să accepti sau să respingi analytics</li>
            <li><strong>Revocare:</strong> Poți revoca consimțământul oricând din footer-ul site-ului</li>
            <li><strong>Eliminare automată:</strong> Când revoci consimțământul, cookie-ul mo_session se elimină automat</li>
            <li><strong>Google Analytics:</strong> Script-ul se dezactivează complet când nu ai consimțământ</li>
          </ul>

          <h2>10. Actualizări ale politicii de cookie-uri</h2>
          <p>
            Această politică poate fi actualizată periodic pentru a reflecta schimbările în tehnologia de cookie-uri sau în legislația în vigoare. Modificările vor fi comunicate prin actualizarea datei de "Ultima actualizare".
          </p>

          <h2>11. Contact pentru cookie-uri</h2>
          <p>
            Pentru orice întrebări privind această politică de cookie-uri, ne poți contacta:
          </p>
          <ul>
            <li><strong>E-mail:</strong> contact@decodoruloficial.ro</li>
            <li><strong>Pagina de contact:</strong> <a href="/contact" className="text-brand-info hover:underline">/contact</a></li>
          </ul>

          <h2>12. Informații suplimentare</h2>
          <p>
            Pentru informații complete despre cum protejăm confidențialitatea ta, consultă și <a href="/privacy" className="text-brand-info hover:underline">Politica noastră de Confidențialitate</a>.
          </p>

          <h2>13. Conformitatea GDPR</h2>
          <p>
            Implementarea noastră de cookie-uri respectă complet Regulamentul General privind Protecția Datelor (GDPR):
          </p>
          <ul>
            <li><strong>Consimțământ explicit:</strong> Cookie-urile de analytics se activează doar cu acordul tău</li>
            <li><strong>Control total:</strong> Poți revoca consimțământul oricând</li>
            <li><strong>Eliminare automată:</strong> Cookie-urile se elimină automat când revoci consimțământul</li>
            <li><strong>Transparență:</strong> Toate informațiile despre cookie-uri sunt disponibile public</li>
            <li><strong>Minimizarea datelor:</strong> Colectăm doar datele necesare pentru funcționalitatea site-ului</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}


