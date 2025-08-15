import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = { title: 'Politica de Confidențialitate – Decodorul Oficial' };

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-responsive prose max-w-none py-10">
          <h1>Politica de Confidențialitate</h1>
          
          <p className="text-sm text-gray-600 mb-6">
            <strong>Ultima actualizare:</strong> {new Date().toLocaleDateString('ro-RO')}
          </p>

          <h2>1. Informații generale</h2>
          <p>
            Decodorul Oficial (denumit în continuare "site-ul", "noi", "nostru") respectă confidențialitatea utilizatorilor săi și se angajează să protejeze datele personale conform Regulamentului General privind Protecția Datelor (GDPR) și legislației române în vigoare.
          </p>
          <p>
            Această politică de confidențialitate explică cum colectăm, utilizăm, stocăm și protejăm informațiile tale personale când vizitezi site-ul nostru.
          </p>

          <h2>2. Datele pe care le colectăm</h2>
          
          <h3>2.1 Date colectate automat</h3>
          <ul>
            <li><strong>Date tehnice:</strong> adresa IP, tipul browserului, sistemul de operare, timpul de acces</li>
            <li><strong>Date de utilizare:</strong> paginile vizitate, timpul petrecut pe site, link-urile accesate</li>
            <li><strong>Cookie-uri:</strong> pentru funcționarea site-ului și îmbunătățirea experienței utilizatorului</li>
          </ul>

          <h3>2.2 Date furnizate voluntar</h3>
          <ul>
            <li><strong>Formulare de contact:</strong> nume, e-mail, mesaj (dacă există)</li>
            <li><strong>Feedback:</strong> comentarii sau sugestii (dacă sunt implementate)</li>
          </ul>

          <h2>3. Scopul colectării datelor</h2>
          <ul>
            <li><strong>Funcționarea site-ului:</strong> afișarea conținutului, navigarea, securitatea</li>
            <li><strong>Îmbunătățirea serviciilor:</strong> analiza traficului, optimizarea performanței</li>
            <li><strong>Comunicarea:</strong> răspunsul la solicitări, informări despre servicii</li>
            <li><strong>Conformitatea legală:</strong> respectarea obligațiilor legale și reglementărilor</li>
          </ul>

          <h2>4. Temeiul legal pentru prelucrare</h2>
          <ul>
            <li><strong>Interesul legitim:</strong> funcționarea și îmbunătățirea site-ului</li>
            <li><strong>Consimțământul:</strong> pentru cookie-urile non-esențiale (dacă aplicabil)</li>
            <li><strong>Obligația legală:</strong> conformitatea cu legislația în vigoare</li>
          </ul>

          <h2>5. Partajarea datelor</h2>
          <p>
            <strong>Nu vindem, nu închiriem și nu partajăm datele tale personale cu terți</strong>, cu excepția cazurilor:
          </p>
          <ul>
            <li>Furnizorii de servicii tehnice (hosting, analytics) care ne ajută să operăm site-ul</li>
            <li>Autoritățile competente, când este necesar conform legii</li>
            <li>Cu consimțământul tău explicit, în situații specifice</li>
          </ul>

          <h2>6. Securitatea datelor</h2>
          <p>
            Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele tale personale împotriva accesului neautorizat, modificării, dezvăluirii sau distrugerii accidentale.
          </p>

          <h2>7. Stocarea datelor</h2>
          <p>
            Datele tale personale sunt stocate doar pentru perioada necesară îndeplinirii scopurilor pentru care au fost colectate, respectând obligațiile legale de păstrare.
          </p>

          <h2>8. Drepturile tale GDPR</h2>
          <p>Conform GDPR, ai următoarele drepturi:</p>
          <ul>
            <li><strong>Dreptul de acces:</strong> să știi ce date avem despre tine</li>
            <li><strong>Dreptul de rectificare:</strong> să corectezi datele incorecte</li>
            <li><strong>Dreptul de ștergere:</strong> să ștergi datele tale (dreptul de a fi uitat)</li>
            <li><strong>Dreptul de restricționare:</strong> să limitezi prelucrarea datelor</li>
            <li><strong>Dreptul de portabilitate:</strong> să primești datele într-un format structurat</li>
            <li><strong>Dreptul de opoziție:</strong> să te opui prelucrării datelor</li>
            <li><strong>Dreptul de retragere a consimțământului:</strong> să retragi consimțământul dat</li>
          </ul>

          <h2>9. Cookie-uri</h2>
          <p>
            Pentru informații detaliate despre cookie-urile pe care le folosim, consultă <a href="/cookies" className="text-brand-info hover:underline">Politica noastră de Cookie-uri</a>.
          </p>

          <h2>10. Modificări ale politicii</h2>
          <p>
            Ne rezervăm dreptul de a actualiza această politică de confidențialitate. Modificările vor fi comunicate prin actualizarea datei de "Ultima actualizare" și, dacă este cazul, prin notificări pe site.
          </p>

          <h2>11. Contact pentru confidențialitate</h2>
          <p>
            Pentru orice întrebări privind această politică de confidențialitate sau pentru exercitarea drepturilor GDPR, ne poți contacta:
          </p>
          <ul>
            <li><strong>E-mail:</strong> contact@decodoruloficial.ro</li>
            <li><strong>Pagina de contact:</strong> <a href="/contact" className="text-brand-info hover:underline">/contact</a></li>
          </ul>

          <h2>12. Autoritatea de Supraveghere</h2>
          <p>
            Ai dreptul să depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) dacă consideri că prelucrarea datelor tale personale încalcă GDPR-ul.
          </p>
          <p>
            <strong>ANSPDCP:</strong> B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, România
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}


