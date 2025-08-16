import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionCookieInitializer } from '@/components/session/SessionCookieInitializer';

export const metadata = {
  title: 'Disclaimer și utilizare informații publice – Decodorul Oficial'
};

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SessionCookieInitializer />
      <main className="flex-1">
        <div className="container-responsive py-10 prose max-w-none">
          <h1>Disclaimer și Termeni de Utilizare</h1>
          
          <p className="text-sm text-gray-600 mb-6">
            <strong>Ultima actualizare:</strong> {new Date().toLocaleDateString('ro-RO')}
          </p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <strong>IMPORTANT:</strong> Informațiile de pe acest site au caracter informativ și nu constituie consultanță juridică. Pentru orice demers cu consecințe legale, consultați sursa oficială.
                </p>
              </div>
            </div>
          </div>

          <h2>1. Natura serviciului oferit</h2>
          <p>
            <strong>Decodorul Oficial</strong> este un serviciu informativ care oferă sinteze și interpretări neoficiale ale actelor normative publicate în Monitorul Oficial al României. Scopul nostru este să facilităm înțelegerea legislației prin prezentarea informațiilor într-un format accesibil și ușor de înțeles.
          </p>

          <h2>2. Disclaimer legal obligatoriu</h2>
          <p>
            <strong>ATENȚIE:</strong> Informațiile prezentate pe acest site sunt:
          </p>
          <ul>
            <li><strong>Necunoscute oficial:</strong> nu sunt aprobate de autoritățile competente</li>
            <li><strong>În scop informativ:</strong> nu au valoare juridică obligatorie</li>
            <li><strong>Interpretări personale:</strong> reprezintă înțelegerea noastră a textelor oficiale</li>
            <li><strong>Susceptibile de erori:</strong> pot conține inexactități sau omisiuni</li>
          </ul>

          <h2>3. Limitarea răspunderii</h2>
          <p>
            <strong>Decodorul Oficial nu poate fi tras la răspundere</strong> pentru:
          </p>
          <ul>
            <li>Decizii luate pe baza informațiilor prezentate pe site</li>
            <li>Pierderi financiare sau daune directe/indirecte</li>
            <li>Consecințe legale ale utilizării informațiilor</li>
            <li>Erori, omisiuni sau inexactități în conținut</li>
            <li>Întârzieri în actualizarea informațiilor</li>
          </ul>

          <h2>4. Obligații pentru utilizatori</h2>
          <p>
            Prin utilizarea acestui site, utilizatorii se angajează să:
          </p>
          <ul>
            <li><strong>Verifice sursa oficială:</strong> să consulte Monitorul Oficial pentru orice demers legal</li>
            <li><strong>Nu se bazeze exclusiv:</strong> pe informațiile prezentate pe site</li>
            <li><strong>Consulte specialiști:</strong> avocați sau consultanți pentru situații complexe</li>
            <li><strong>Respecte drepturile de autor:</strong> să nu reproducă conținutul fără permisiune</li>
          </ul>

          <h2>5. Citația obligatorie a sursei</h2>
          <p>
            <strong>Pentru fiecare sinteză publicată, utilizatorii sunt obligați să citeze:</strong>
          </p>
          <ul>
            <li><strong>Denumirea actului normativ:</strong> lege, hotărâre de guvern, ordin, etc.</li>
            <li><strong>Monitorul Oficial al României:</strong> sursa oficială de publicare</li>
            <li><strong>Partea și numărul:</strong> Partea I, II, III, etc.</li>
            <li><strong>Numărul și data publicării:</strong> ex. "nr. 123/15.01.2025"</li>
            <li><strong>URL-ul sursei oficiale:</strong> dacă este disponibil online</li>
          </ul>

          <h2>6. Drepturi de autor și proprietate intelectuală</h2>
          <p>
            <strong>Decodorul Oficial respectă drepturile de autor:</strong>
          </p>
          <ul>
            <li><strong>Nu reproducem:</strong> macheta, grafica, sigla sau elemente specifice ediției tipărite</li>
            <li><strong>Preluăm doar textul:</strong> conținutul informativ al actelor normative</li>
            <li><strong>Respectăm:</strong> drepturile de autor ale R.A. "Monitorul Oficial"</li>
            <li><strong>Nu comercializăm:</strong> conținutul oficial al Monitorului Oficial</li>
          </ul>

          <h2>7. Acuratețea informațiilor</h2>
          <p>
            Deși ne străduim să oferim informații cât mai exacte:
          </p>
          <ul>
            <li><strong>Nu garantăm:</strong> completitudinea sau exactitatea informațiilor</li>
            <li><strong>Recomandăm verificarea:</strong> cu sursa oficială pentru orice utilizare</li>
            <li><strong>Actualizăm periodic:</strong> conținutul pentru a reflecta schimbările legislative</li>
            <li><strong>Corectăm erorile:</strong> când sunt identificate</li>
          </ul>

          <h2>8. Utilizarea responsabilă</h2>
          <p>
            <strong>Utilizarea acestui site implică acceptarea următoarelor condiții:</strong>
          </p>
          <ul>
            <li>Informațiile sunt pentru uz personal și informativ</li>
            <li>Nu sunt destinate utilizării comerciale fără permisiune</li>
            <li>Nu pot fi folosite pentru a înșela sau induce în eroare</li>
            <li>Trebuie respectate drepturile de autor și proprietatea intelectuală</li>
          </ul>

          <h2>9. Modificări ale termenilor</h2>
          <p>
            Ne rezervăm dreptul de a modifica acești termeni de utilizare în orice moment. Modificările vor fi comunicate prin actualizarea datei de "Ultima actualizare" și, dacă este cazul, prin notificări pe site.
          </p>

          <h2>10. Contact pentru probleme legale</h2>
          <p>
            Pentru orice întrebări privind acești termeni de utilizare sau pentru a raporta probleme legale:
          </p>
          <ul>
            <li><strong>E-mail:</strong> contact@decodoruloficial.ro</li>
            <li><strong>Pagina de contact:</strong> <a href="/contact" className="text-brand-info hover:underline">/contact</a></li>
            <li><strong>Răspuns garantat:</strong> în maxim 48 de ore lucrătoare</li>
          </ul>

          <h2>11. Jurisdicția aplicabilă</h2>
          <p>
            Acești termeni de utilizare sunt guvernați de legislația română. Orice dispută va fi rezolvată în primul rând prin negociere, iar în caz de neînțelegere, prin instanțele competente din România.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Recomandare:</strong> Pentru orice demers cu consecințe legale, consultați întotdeauna sursa oficială - Monitorul Oficial al României - și, dacă este necesar, un specialist juridic.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-info hover:bg-brand-highlight transition-colors">
              ← Înapoi la prima pagină
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


