import Link from 'next/link';

export const metadata = {
  title: 'Disclaimer și utilizare informații publice – Decodorul Oficial'
};

export default function LegalPage() {
  return (
    <div className="container-responsive py-10 prose max-w-none">
      <h1>Disclaimer și recomandări privind utilizarea informațiilor publice</h1>
      <p>
        Textele publicate pe acest site sunt sinteze/interpretări neoficiale, realizate în scop informativ. Singurul
        text cu efecte juridice este cel publicat în Monitorul Oficial al României. Pentru orice demers cu
        consecințe legale, consultați sursa oficială.
      </p>
      <h2>Recomandări practice obligatorii</h2>
      <ul>
        <li>
          <strong>Citați sursa</strong>: fiecare sinteză indică denumirea actului normativ, Monitorul Oficial al României – Partea I,
          precum și numărul și data publicării.
        </li>
        <li>
          <strong>Acuratețe</strong>: verificăm sintezele pentru a nu denatura sensul original al legii.
        </li>
        <li>
          <strong>Disclaimer</strong>: informațiile au caracter informativ; nu constituie consultanță juridică.
        </li>
        <li>
          <strong>Drepturi de autor</strong>: nu reproducem macheta, grafica, sigla sau elemente specifice ediției tipărite/PDF a
          R.A. „Monitorul Oficial”. Preluăm doar textul.
        </li>
      </ul>
      <p>
        Înapoi la{' '}
        <Link href="/" className="text-brand-info hover:underline">
          prima pagină
        </Link>
        .
      </p>
    </div>
  );
}


