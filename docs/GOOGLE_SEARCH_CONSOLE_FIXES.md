# Soluții pentru Google Search Console - "Discovered - currently not indexed"

## Problema Identificată

Google Search Console raportează că 25 de pagini au statusul **"Descoperită – nu este indexată"**. Aceasta înseamnă că Google a descoperit aceste pagini (probabil când erau pe homepage), dar nu le poate indexa pentru că nu mai găsește link-uri permanente către ele.

### Cauza Principală

1. **Link-urile din "Latest News" sunt temporare**: O știre stă pe homepage câteva ore sau o zi
2. **Formularele de căutare sunt invizibile pentru Google**: Robotul Google nu poate naviga prin formulare
3. **Paginile devin "orfane"**: După ce o știre dispare de pe homepage, nu mai există nicio cale permanentă către ea

## Soluțiile Implementate

### Soluția 1: News Sitemap (Tehnic, extrem de eficient)

**Fișier**: `src/app/api/news-sitemap/route.ts`

#### Caracteristici:
- **Format special pentru știri**: Urmărește standardul Google News Sitemap
- **48 de ore de valabilitate**: Include doar știrile din ultimele 48 de ore
- **Prioritate maximă**: Toate știrile au prioritate 1.0
- **Frecvență orară**: Actualizare la fiecare oră pentru urgență

#### Beneficii:
- **Indexare accelerată**: Google tratează aceste știri ca fiind urgente
- **Google News**: Știrile pot apărea în Google News
- **Crawling optimizat**: Google știe să verifice acest sitemap mai des

#### Implementare:
```typescript
// Filtrare știri din ultimele 48 de ore
const fortyEightHoursAgo = new Date(currentDate.getTime() - (48 * 60 * 60 * 1000));
const recentNews = stiri.filter((news) => {
  const publicationDate = new Date(news.publicationDate);
  return publicationDate >= fortyEightHoursAgo;
});
```

### Soluția 2: Pagină de Arhivă cu Link-uri Permanente

**Fișier**: `src/app/arhiva/page.tsx`

#### Caracteristici:
- **Link-uri permanente**: Toate știrile sunt accesibile prin link-uri directe
- **Organizare cronologică**: Știrile sunt grupate pe zile
- **SEO optimizată**: Metadata completă și Schema.org markup
- **Navigare ușoară**: Interfață intuitivă pentru utilizatori și crawleri

#### Beneficii:
- **Crawling complet**: Google poate descoperi toate știrile
- **Link equity**: Distribuie autoritatea paginii către toate știrile
- **User experience**: Utilizatorii pot găsi știri vechi ușor
- **Indexare garantată**: Fiecare știre are cel puțin un link permanent

#### Structură:
```
/arhiva
├── 2025-01-15 (5 articole)
├── 2025-01-14 (3 articole)
├── 2025-01-13 (7 articole)
└── ...
```

### Soluția 3: Link-uri Permanente în Navigare

#### Header Navigation:
- **Link direct**: `/arhiva` în meniul principal
- **Vizibilitate maximă**: Accesibil din toate paginile
- **Crawling prioritar**: Google va descoperi arhiva rapid

#### Footer Links:
- **Link-uri multiple**: Arhivă, Căutare, Sinteza Zilnică
- **Distribuție echilibrată**: Link equity pentru toate paginile importante
- **Permanență**: Footer-ul este prezent pe toate paginile

## Configurații Actualizate

### Robots.txt (`src/app/robots.ts`)
```txt
# Adăugat /arhiva în allow pentru toate bot-urile
allow: ['/', '/stiri/*', '/arhiva', '/contact', ...]

# Adăugat news-sitemap
sitemap: [
  'https://www.decodoruloficial.ro/sitemap.xml',
  'https://www.decodoruloficial.ro/api/news-sitemap'
]
```

### Sitemap Principal (`src/app/sitemap.ts`)
```typescript
// Adăugată pagina de arhivă cu prioritate 0.8
{
  url: `${baseUrl}/arhiva`,
  lastModified: currentDate,
  changeFrequency: 'daily',
  priority: 0.8,
}
```

## Beneficii SEO

### 1. **Indexare Completă**
- Toate știrile sunt accesibile prin link-uri permanente
- Google poate crawla și indexa fiecare articol
- Elimină problema paginilor "orfane"

### 2. **Viteza de Indexare**
- News Sitemap accelerează indexarea știrilor noi
- Prioritate maximă pentru conținut recent
- Crawling optimizat pentru urgență

### 3. **Link Equity**
- Arhiva distribuie autoritatea către toate știrile
- Link-uri din header și footer măresc vizibilitatea
- Structură de link-uri echilibrată

### 4. **User Experience**
- Utilizatorii pot găsi știri vechi ușor
- Navigare intuitivă prin arhivă
- Acces rapid la toate conținuturile

## Monitorizare și Validare

### 1. **Google Search Console**
- Verifică statusul paginilor "Discovered - currently not indexed"
- Monitorizează indexarea știrilor noi
- Verifică performanța în căutări

### 2. **Testare Manuală**
- Accesează `/arhiva` și verifică toate link-urile
- Testează `/api/news-sitemap` în browser
- Verifică că toate știrile sunt accesibile

### 3. **Analiză Trafic**
- Monitorizează traficul către arhivă
- Verifică click-through rate-ul din căutări
- Analizează comportamentul utilizatorilor

## Pași Următori

### 1. **Implementare Imediată** ✅
- News Sitemap creat și configurat
- Pagina de arhivă implementată
- Link-uri adăugate în navigare

### 2. **Validare în Google Search Console**
- Trimite sitemap-urile în Google Search Console
- Monitorizează indexarea paginilor
- Verifică statusul "Discovered - currently not indexed"

### 3. **Optimizări Suplimentare** (Opțional)
- Implementare paginare pentru arhivă
- Filtrare avansată în arhivă
- Optimizare performanță pentru arhivă mare

## Concluzie

Aceste soluții rezolvă fundamental problema cu Google Search Console prin:

1. **News Sitemap**: Accelerează indexarea știrilor noi
2. **Arhivă permanentă**: Garantează accesul la toate știrile
3. **Link-uri multiple**: Distribuie autoritatea și facilitează crawling-ul

Rezultatul așteptat este eliminarea completă a statusului "Discovered - currently not indexed" și indexarea tuturor știrilor în Google.
