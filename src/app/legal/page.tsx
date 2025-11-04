import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TableOfContents } from '@/components/legal/TableOfContents';

export const metadata: Metadata = {
  title: 'Termeni și Condiții - Decodorul Oficial',
  description: 'Termenii și condițiile de utilizare pentru Decodorul Oficial. Regulile și condițiile pentru accesarea și utilizarea serviciilor noastre.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-responsive">
          {/* Table of Contents - positioned under header */}
          <div className="mb-6">
            <TableOfContents className="max-w-4xl mx-auto" />
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Termeni și Condiții
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
              </p>

              <section className="mb-8" id="definitions">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Definiții
                </h2>
                <p className="text-gray-700 mb-4">
                  Pentru claritate juridică, următoarele termeni au următoarele semnificații:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>&ldquo;Serviciu&rdquo;</strong> - platforma online Decodorul Oficial și toate funcționalitățile sale</li>
                  <li><strong>&ldquo;Utilizator&rdquo;</strong> - orice persoană care accesează sau utilizează Serviciul</li>
                  <li><strong>&ldquo;Conținut&rdquo;</strong> - toate informațiile, textele, grafica și materialele disponibile pe Serviciu</li>
                  <li><strong>&ldquo;Abonament PRO&rdquo;</strong> - planul de abonament plătit care oferă acces la funcționalități premium</li>
                  <li><strong>&ldquo;Compania&rdquo;</strong> - {process.env.NEXT_PUBLIC_COMPANY_NAME || 'S.C. [Numele Companiei Tale S.R.L.]'}, furnizorul Serviciului</li>
                </ul>
              </section>

              <section className="mb-8" id="general-info">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Informații Generale și Date de Contact
                </h2>
                <p className="text-gray-700 mb-4">
                  Serviciul &ldquo;Decodorul Oficial&rdquo; este furnizat de {process.env.NEXT_PUBLIC_COMPANY_NAME || 'S.C. [Numele Companiei Tale S.R.L.]'}, 
                  o societate de naționalitate română, cu sediul social în {process.env.NEXT_PUBLIC_COMPANY_CITY || '[Oraș]'}, {process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '[Adresa completă]'}, 
                  înregistrată la Registrul Comerțului sub nr. {process.env.NEXT_PUBLIC_COMPANY_REG_NO || '[Jxx/xxxx/xxxx]'}, 
                  cod unic de înregistrare {process.env.NEXT_PUBLIC_COMPANY_CUI || '[ROxxxxxxxx]'} (denumită în continuare &ldquo;Compania&rdquo;, &ldquo;noi&rdquo;).
                </p>
                <p className="text-gray-700 mb-4">
                  Aceste Termeni și Condiții (&ldquo;Termenii&rdquo;) reglementează utilizarea serviciului nostru. 
                  Prin accesarea sau utilizarea Serviciului, vă angajați să respectați acești Termeni. 
                  Dacă nu sunteți de acord cu oricare parte a acestor Termeni, vă rugăm să nu utilizați Serviciul.
                </p>
              </section>

              <section className="mb-8" id="service-description">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Descrierea serviciului
                </h2>
                <p className="text-gray-700 mb-4">
                  Decodorul Oficial este o platformă online care oferă:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Sinteze și interpretări neoficiale ale actelor normative din Monitorul Oficial</li>
                  <li>Funcționalități de căutare și filtrare avansată</li>
                  <li>Feed personalizat de știri legislative (pentru utilizatorii PRO)</li>
                  <li>Preferințe de categorii personalizate (pentru utilizatorii PRO)</li>
                  <li>Acces prioritar la funcții noi (pentru utilizatorii PRO)</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Important:</strong> Sintezele și interpretările oferite sunt 
                  neoficiale și au scop informativ. Pentru consultanță juridică oficială, 
                  vă rugăm să contactați un avocat autorizat.
                </p>
              </section>

              <section className="mb-8" id="user-account">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Contul utilizatorului
                </h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  3.1 Crearea contului
                </h3>
                <p className="text-gray-700 mb-4">
                  Pentru a accesa anumite funcționalități, trebuie să vă creați un cont. 
                  Vă angajați să furnizați informații exacte, complete și actualizate.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  3.2 Securitatea contului
                </h3>
                <p className="text-gray-700 mb-4">
                  Sunteți responsabil pentru menținerea confidențialității parolei și 
                  pentru toate activitățile care au loc în contul dvs. Notificați-ne 
                  imediat despre orice utilizare neautorizată a contului dvs.
                </p>
              </section>

              <section className="mb-8" id="privacy-gdpr">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3.1. Confidențialitate și Date Personale
                </h2>
                <p className="text-gray-700 mb-4">
                  Compania noastră prelucrează datele dumneavoastră cu caracter personal în conformitate 
                  cu Regulamentul (UE) 2016/679 (&ldquo;GDPR&rdquo;). Prin utilizarea Serviciului, sunteți de acord 
                  cu colectarea și utilizarea informațiilor în conformitate cu Politica noastră de 
                  Confidențialitate, pe care o puteți consulta <a href="/privacy" className="text-brand-info hover:text-brand-highlight">aici</a>.
                </p>
                <p className="text-gray-700 mb-4">
                  Colectăm și procesăm următoarele tipuri de date personale:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Date de identificare (nume, adresă de e-mail)</li>
                  <li>Date de utilizare (preferințe, istoricul de navigare)</li>
                  <li>Date de plată (procesate securizat prin Netopia Payments)</li>
                  <li>Date tehnice (adresă IP, tip de browser, cookie-uri)</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Aveți dreptul la acces, rectificare, ștergere, restricționare a prelucrării, 
                  portabilitatea datelor și opoziție. Pentru exercitarea acestor drepturi, 
                  contactați-ne la: <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'contact@decodoruloficial.ro'}`} className="text-brand-info hover:text-brand-highlight">{process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'contact@decodoruloficial.ro'}</a>
                </p>
              </section>

              <section className="mb-8" id="subscriptions-payments">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Abonamente și plăți
                </h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  4.1 Planuri de abonament
                </h3>
                <p className="text-gray-700 mb-4">
                  Oferim planuri de abonament lunar și anual pentru accesul la funcționalități premium. 
                  Prețurile sunt afișate în lei (RON) și includ TVA-ul.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  4.2 Procesarea plăților
                </h3>
                <p className="text-gray-700 mb-4">
                  Plățile sunt procesate prin Netopia Payments, un procesator de plăți 
                  autorizat de Banca Națională a României. Toate tranzacțiile sunt securizate 
                  conform standardelor PCI DSS.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  4.3 Facturare și reînnoire
                </h3>
                <p className="text-gray-700 mb-4">
                  Abonamentele se reînnoiesc automat la sfârșitul fiecărei perioade de facturare, 
                  cu excepția cazului în care anulați abonamentul înainte de data de reînnoire.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  4.4 Anularea abonamentului
                </h3>
                <p className="text-gray-700 mb-4">
                  Puteți anula abonamentul oricând din secțiunea de cont. Anularea va intra 
                  în vigoare la sfârșitul perioadei curente de facturare, iar vei păstra 
                  accesul la funcționalitățile premium până atunci.
                </p>
              </section>

              <section className="mb-8" id="return-policy">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Politica de retur
                </h2>
                <p className="text-gray-700 mb-4">
                  Conform legislației românești, aveți dreptul de a anula abonamentul 
                  în termen de 14 zile de la data achiziției, fără a da motive.
                </p>
                <p className="text-gray-700 mb-4">
                  Pentru a exercita dreptul de retur, contactați-ne la: {process.env.NEXT_PUBLIC_EMAIL_SUPPORT || 'contact@decodoruloficial.ro'}
                </p>
                <p className="text-gray-700 mb-4">
                  Rambursarea se va face în termen de 14 zile de la primirea cererii de retur, 
                  folosind aceeași metodă de plată utilizată pentru achiziție.
                </p>
              </section>

              <section className="mb-8" id="acceptable-use">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Utilizarea acceptabilă
                </h2>
                <p className="text-gray-700 mb-4">
                  Vă angajați să utilizați Serviciul nostru doar în conformitate cu legea 
                  și cu acești Termeni. Interziceți următoarele activități:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Utilizarea Serviciului pentru activități ilegale sau neautorizate</li>
                  <li>Încercarea de a accesa conturi sau sisteme ale altor utilizatori</li>
                  <li>Distribuirea de malware sau cod malițios</li>
                  <li>Utilizarea de bot-uri sau scripturi pentru a accesa automat Serviciul</li>
                  <li>Reproducerea sau distribuirea neautorizată a conținutului nostru</li>
                </ul>
              </section>

              <section className="mb-8" id="advertising-policy">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6.1. Publicitate și interstițiale (Vignette)
                </h2>
                <p className="text-gray-700 mb-4">
                  Putem afișa reclame prin Google AdSense (inclusiv anunțuri interstițiale de tip Vignette) 
                  pe anumite pagini (de ex. „Știri” și „Sinteza Zilnică”) pentru utilizatorii care <strong>nu</strong> au abonament activ sau perioadă de trial.
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Reclamele sunt afișate <strong>doar</strong> dacă utilizatorul și-a exprimat consimțământul pentru cookie-uri non-esențiale.</li>
                  <li>Utilizatorii cu abonament activ sau trial nu vor vedea reclame.</li>
                  <li>Poți modifica sau revoca consimțământul tău din bannerul de cookie-uri disponibil pe site.</li>
                </ul>
                <p className="text-gray-700">
                  Implementarea respectă politicile Google și legislația aplicabilă privind protecția datelor.
                </p>
              </section>

              <section className="mb-8" id="intellectual-property">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Proprietatea intelectuală
                </h2>
                <p className="text-gray-700 mb-4">
                  Conținutul Serviciului nostru, inclusiv textele, grafica, logotipurile, 
                  imaginile și software-ul, este proprietatea noastră sau a licențiatorilor 
                  noștri și este protejat de legile privind drepturile de autor.
                </p>
                <p className="text-gray-700 mb-4">
                  Sintezele și interpretările oferite sunt create de echipa noastră și 
                  sunt destinate utilizării personale și educaționale. Nu puteți reproduce, 
                  distribui sau comercializa acest conținut fără consimțământul nostru scris.
                </p>
              </section>

              <section className="mb-8" id="liability-limitation">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Limitarea răspunderii
                </h2>
                <p className="text-gray-700 mb-4">
                  Serviciul nostru este furnizat &ldquo;așa cum este&rdquo; și &ldquo;așa cum este disponibil&rdquo;. 
                  Nu garantăm că Serviciul va fi neîntrerupt, securizat sau fără erori.
                </p>
                <p className="text-gray-700 mb-4">
                  Nu ne asumăm răspunderea pentru:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Precizia sau completitudinea informațiilor furnizate</li>
                  <li>Daunele rezultate din utilizarea sau imposibilitatea utilizării Serviciului</li>
                  <li>Pierderile de date sau întreruperile serviciului</li>
                  <li>Deciziile luate pe baza informațiilor din Serviciul nostru</li>
                </ul>
              </section>

              <section className="mb-8" id="service-modifications">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Modificări ale serviciului
                </h2>
                <p className="text-gray-700 mb-4">
                  Ne rezervăm dreptul de a modifica, suspenda sau întrerupe Serviciul nostru 
                  oricând, cu sau fără notificare prealabilă. Nu ne asumăm răspunderea 
                  față de utilizatori sau terțe părți pentru orice modificare, suspensie 
                  sau întrerupere a Serviciului.
                </p>
              </section>

              <section className="mb-8" id="terms-modifications">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9.1. Modificări ale Termenilor
                </h2>
                <p className="text-gray-700 mb-4">
                  Ne rezervăm dreptul de a actualiza acești Termeni și Condiții oricând, 
                  pentru a reflecta modificări în serviciile noastre sau din motive legale.
                </p>
                <p className="text-gray-700 mb-4">
                  Vă vom notifica despre modificări importante prin:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>E-mail la adresa asociată contului dvs.</li>
                  <li>Notificare în contul de utilizator</li>
                  <li>Actualizarea datei "Ultima actualizare" și afișarea unei notificări pe site</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Utilizarea continuă a Serviciului după modificarea Termenilor constituie 
                  acceptul dumneavoastră față de noii termeni. Dacă nu sunteți de acord cu 
                  modificările, vă rugăm să încetați utilizarea Serviciului.
                </p>
              </section>

              <section className="mb-8" id="applicable-law">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Legea aplicabilă și Soluționarea Litigiilor
                </h2>
                <p className="text-gray-700 mb-4">
                  Acești Termeni sunt guvernați de legea română. Orice dispută va fi 
                  soluționată de instanțele competente din România.
                </p>
                <p className="text-gray-700 mb-4">
                  Înainte de a recurge la instanțele de judecată, vă încurajăm să încercați 
                  soluționarea amiabilă a oricăror dispute prin contactarea directă a echipei 
                  noastre de suport.
                </p>
                <p className="text-gray-700 mb-4">
                  Pentru consumatori din Uniunea Europeană, aveți dreptul de a utiliza 
                  platforma europeană de soluționare online a litigiilor (SOL) disponibilă 
                  la: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-brand-info hover:text-brand-highlight">https://ec.europa.eu/consumers/odr/</a>
                </p>
              </section>

              <section className="mb-8" id="contact">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  11. Contact
                </h2>
                <p className="text-gray-700 mb-4">
                  Pentru întrebări despre acești Termeni și Condiții, contactați-ne la:
                </p>
                <ul className="list-none text-gray-700 mb-4">
                  <li>Email: {process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'legal@decodoruloficial.ro'}</li>
                  <li>Website: <a href="/contact" className="text-brand-info hover:text-brand-highlight">Pagina de contact</a></li>
                </ul>
              </section>

              <section className="mb-8" id="payment-processor">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  12. Informații despre procesatorul de plăți
                </h2>
                <p className="text-gray-700 mb-4">
                  Pentru procesarea plăților, folosim serviciile Netopia Payments, 
                  un procesator de plăți autorizat de Banca Națională a României.
                </p>
                <ul className="list-none text-gray-700 mb-4">
                  <li>Website: <a href="https://www.netopia-payments.ro" target="_blank" rel="noopener noreferrer" className="text-brand-info hover:text-brand-highlight">www.netopia-payments.ro</a></li>
                  <li>Licență: Autorizat de BNR</li>
                  <li>Securitate: PCI DSS compliant</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}