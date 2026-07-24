# Google Search Console — pași operaționali (SEO Indexare)

După deploy-ul fix-urilor SEO (category hubs scoase din sitemap, noindex pe `/categorii`, news timestamps cu `createdAt`, redirect 301 pe slug-uri):

## 1. Performanță

- În GSC → **Performanță**, schimbă tipul de căutare din **Web** în **News** și compară 7/28 zile.
- News sitemap-ul (`/sitemaps/news/recent.xml`) conține doar articole din ultimele **~48 ore** (cerință Google News). Nu trebuie să aibă toate știrile istorice — acelea sunt în child sitemap-urile `/sitemaps/news/category/...`.

## 2. Sitemap-uri

- Trimite / confirmă în GSC sitemap-ul principal: `https://www.decodoruloficial.ro/sitemap.xml`
- Preferă sitemap-ul News canonic: `https://www.decodoruloficial.ro/sitemaps/news/recent.xml`  
  (`/api/news-sitemap` este doar un 301 către acesta)
- `/sitemaps/category-hubs.xml` returnează acum urlset gol (categorii gated) — poate rămâne submitat; nu mai descoperă hub-uri paywall.

## 3. Indexare — remedieri

- **404** pe `/stiri/...`: dacă URL-urile răspund 200, apasă **Validează remedierea**.
- **Alternativă cu etichetă canonică** (`/stiri?keywords=...`, `/categorii/?page=`): nu valida din nou până Google re-crawlează; listing-urile filtrate sunt acum `noindex`, iar `/categorii` e `Disallow` + `noindex`.
- Monitorizează scăderea la **Descoperită – nu este indexată** în următoarele 1–2 săptămâni (crawl budget eliberat de pe hub-uri gated).

## 4. Indexare rapidă știri noi

- După publicare: **Inspectare URL** pe 5–10 știri recente → **Solicită indexarea**.
- Verifică că apar în `/sitemaps/news/recent.xml` (cache ~10 min).

## 5. Google News Publisher Center

- Confirmă în [Publisher Center](https://publishercenter.google.com/) că publicația „Decodorul Oficial” e configurată. Sitemap-ul News ajută doar dacă publicația e eligibilă/aprobată.

## Fișiere tehnice relevante

| Zonă | Fișier |
|------|--------|
| Sitemap index | `src/lib/sitemap/buildSitemapIndex.ts` |
| News sitemap 48h | `src/lib/sitemap/buildRecentNewsSitemap.ts` |
| robots.txt | `src/app/robots.ts` |
| noindex categorii | `src/app/categorii/layout.tsx` |
| SEO listing `/stiri` | `src/app/stiri/page.tsx` |
| Articol 301 + dynamicParams | `src/app/stiri/[slug]/page.tsx` |
