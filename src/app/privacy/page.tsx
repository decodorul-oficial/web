import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TableOfContents } from '@/components/legal/TableOfContents';

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate - Decodorul Oficial',
  description: 'Politica de confidențialitate și protecția datelor personale pentru Decodorul Oficial. Informații despre colectarea, procesarea și stocarea datelor utilizatorilor.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
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
              Politica de Confidențialitate
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
              </p>

              <section className="mb-8" id="introduction">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Introducere
                </h2>
                <p className="text-gray-700 mb-4">
                  Decodorul Oficial („noi", „aplicația noastră", „serviciul nostru") respectă confidențialitatea 
                  utilizatorilor și se angajează să protejeze datele personale conform legislației aplicabile, 
                  inclusiv Regulamentul General privind Protecția Datelor (GDPR) și Legea nr. 190/2018 privind 
                  măsurile de aplicare a Regulamentului (UE) 2016/679.
                </p>
              </section>

              <section className="mb-8" id="data-collection">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Datele pe care le colectăm
                </h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  2.1 Date furnizate direct
                </h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Informații de cont (nume, adresă de email, parolă)</li>
                  <li>Informații de profil (nume complet, preferințe de categorii)</li>
                  <li>Informații de facturare (pentru utilizatorii PRO)</li>
                  <li>Comunicări cu suportul tehnic</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  2.2 Date colectate automat
                </h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Date de utilizare (pagini vizitate, timpul petrecut pe site)</li>
                  <li>Informații tehnice (adresa IP, tipul de browser, sistem de operare)</li>
                  <li>Cookie-uri și tehnologii similare</li>
                  <li>Date de analiză (Google Analytics, Search Console)</li>
                  <li>Date pentru publicitate (Google AdSense auto ads, inclusiv interstițiale de tip Vignette) — colectate doar cu consimțământul tău și numai pentru utilizatorii fără abonament activ sau trial.</li>
                </ul>
              </section>

              <section className="mb-8" id="data-usage">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Scopurile și Temeiurile Legale ale Prelucrării
                </h2>
                <p className="text-gray-700 mb-4">
                  Prelucrăm datele dumneavoastră personale în următoarele scopuri și în baza următoarelor temeiuri legale:
                </p>
                
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full border border-gray-300 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                          Scopul Prelucrării
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                          Temeiul Legal (conform GDPR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Crearea și administrarea contului de utilizator</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Executarea unui contract (Art. 6(1)(b))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Furnizarea serviciilor, inclusiv funcționalitățile PRO</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Executarea unui contract (Art. 6(1)(b))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Procesarea plăților și emiterea facturilor</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Executarea unui contract și Obligație legală (Art. 6(1)(b, c))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Personalizarea conținutului și a experienței pe platformă</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Interes legitim (Art. 6(1)(f))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Comunicări tranzacționale (ex: confirmare plată, resetare parolă)</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Executarea unui contract (Art. 6(1)(b))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Asigurarea securității platformei și prevenirea fraudelor</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Interes legitim (Art. 6(1)(f))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Analiza utilizării serviciului pentru a-l îmbunătăți</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Interes legitim (Art. 6(1)(f))</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700">Comunicări de marketing (ex: newsletter)</td>
                        <td className="px-4 py-3 text-sm text-gray-700">Consimțământ (Art. 6(1)(a))</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8" id="data-sharing">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Partajarea datelor
                </h2>
                <p className="text-gray-700 mb-4">
                  Nu vindem, nu închiriem și nu partajăm datele personale cu terțe părți, 
                  cu excepția următoarelor situații:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Furnizorii de servicii (procesarea plăților prin Netopia, hosting, analiză)</li>
                  <li>Parteneri de publicitate (Google AdSense) — doar dacă ai oferit consimțământul pentru cookie-uri non-esențiale; reclamele sunt afișate exclusiv utilizatorilor fără abonament activ sau trial.</li>
                  <li>Autoritățile competente (când este cerut prin lege)</li>
                  <li>Consimțământul explicit al utilizatorului</li>
                </ul>
              </section>

              <section className="mb-8" id="payment-processing">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Procesarea plăților
                </h2>
                <p className="text-gray-700 mb-4">
                  Pentru procesarea plăților, folosim serviciile Netopia Payments, 
                  un procesator de plăți autorizat de Banca Națională a României. 
                  Datele de plată sunt procesate în conformitate cu standardele PCI DSS.
                </p>
                <p className="text-gray-700 mb-4">
                  Nu stocăm datele cardurilor de credit. Toate tranzacțiile sunt 
                  procesate securizat prin Netopia Payments.
                </p>
              </section>

              <section className="mb-8" id="data-retention">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Perioada de Păstrare a Datelor
                </h2>
                <p className="text-gray-700 mb-4">
                  Păstrăm datele dumneavoastră personale doar pe perioada necesară îndeplinirii scopurilor pentru care au fost colectate, după cum urmează:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Datele contului</strong> (nume, e-mail, preferințe) vor fi păstrate pe toată durata existenței contului dumneavoastră activ. La ștergerea contului, aceste date vor fi eliminate sau anonimizate într-un interval de 90 de zile.</li>
                  <li><strong>Datele de facturare</strong> vor fi păstrate pentru o perioadă de 10 ani, conform legislației financiar-contabile din România.</li>
                  <li><strong>Datele colectate automat</strong> (date de utilizare, tehnice) sunt păstrate pentru o perioadă de maximum 26 de luni în scopuri de analiză.</li>
                  <li><strong>Datele de marketing</strong> (newsletter, comunicări promoționale) sunt păstrate până când vă retrageți consimțământul sau până la 3 ani de la ultima interacțiune.</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Notă:</strong> În anumite cazuri, pot fi păstrate datele pentru perioade mai lungi dacă este necesar pentru îndeplinirea obligațiilor legale sau pentru protejarea intereselor legitime ale noastre sau ale terților.
                </p>
              </section>

              <section className="mb-8" id="user-rights">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Drepturile utilizatorilor
                </h2>
                <p className="text-gray-700 mb-4">
                  Conform GDPR, aveți următoarele drepturi:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Dreptul la informare</li>
                  <li>Dreptul de acces la date</li>
                  <li>Dreptul la rectificare</li>
                  <li>Dreptul la ștergere („dreptul de a fi uitat")</li>
                  <li>Dreptul la restricționarea procesării</li>
                  <li>Dreptul la portabilitatea datelor</li>
                  <li>Dreptul la opoziție</li>
                  <li>Dreptul de a nu fi supus unei decizii bazate exclusiv pe procesarea automatizată</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Pentru a exercita aceste drepturi, contactați-ne la: <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'contact@decodoruloficial.ro'}`} className="text-brand-info hover:text-brand-highlight">{process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'contact@decodoruloficial.ro'}</a>
                </p>
              </section>

              <section className="mb-8" id="data-security">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Securitatea datelor
                </h2>
                <p className="text-gray-700 mb-4">
                  Implementăm măsuri tehnice și organizaționale adecvate pentru a proteja 
                  datele personale împotriva accesului neautorizat, modificării, divulgării 
                  sau distrugerii neautorizate.
                </p>
              </section>

              <section className="mb-8" id="cookies">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Cookie-uri
                </h2>
                <p className="text-gray-700 mb-4">
                  Folosim cookie-uri pentru a îmbunătăți experiența utilizatorilor, pentru analiză și pentru publicitate responsabilă. 
                  Reclamele Google AdSense (inclusiv interstițiale de tip Vignette) sunt afișate doar utilizatorilor fără abonament activ sau trial și doar cu consimțământul tău pentru cookie-uri non-esențiale. 
                  Poți gestiona preferințele cookie-urilor în setările browserului sau prin bannerul de consimțământ de pe site.
                </p>
              </section>

              <section className="mb-8" id="policy-changes">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Modificări ale politicii
                </h2>
                <p className="text-gray-700 mb-4">
                  Ne rezervăm dreptul de a modifica această politică de confidențialitate. 
                  Modificările semnificative vor fi comunicate utilizatorilor prin email 
                  sau prin notificare pe site.
                </p>
              </section>

              <section className="mb-8" id="contact">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  11. Contact
                </h2>
                <p className="text-gray-700 mb-4">
                  Pentru întrebări despre această politică de confidențialitate, 
                  contactați-ne la:
                </p>
                <ul className="list-none text-gray-700 mb-4">
                  <li>Email: <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'contact@decodoruloficial.ro'}`} className="text-brand-info hover:text-brand-highlight">{process.env.NEXT_PUBLIC_EMAIL_LEGAL || 'contact@decodoruloficial.ro'}</a></li>
                  <li>Website: <a href="/contact" className="text-brand-info hover:text-brand-accent">Pagina de contact</a></li>
                </ul>
              </section>

              <section className="mb-8" id="supervisory-authority">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  12. Autoritatea de supraveghere
                </h2>
                <p className="text-gray-700 mb-4">
                  Aveți dreptul de a depune o plângere la Autoritatea Națională de 
                  Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) 
                  dacă considerați că prelucrarea datelor dvs. personale încalcă GDPR-ul.
                </p>
                <p className="text-gray-700 mb-4">
                  Website ANSPDCP: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-brand-info hover:text-brand-accent">www.dataprotection.ro</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}