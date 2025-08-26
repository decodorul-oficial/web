# Instagram Feed Generator

## Descriere

Pagina admin pentru generarea de imagini în stil Instagram cu ultimele știri din Monitorul Oficial. Această funcționalitate permite crearea rapidă de conținut vizual pentru rețelele sociale.

## Acces

- **URL**: `/admin/instagram`
- **Tip**: Pagină privată (nu este indexată de Google)
- **Scop**: Generare de imagini pentru Instagram

## Funcționalități

### 1. Feed Principal (`/admin/instagram`)
- Afișează ultimele 20 știri în format grid
- Design responsive (1-4 coloane în funcție de ecran)
- Aspect ratio 1:1 pentru fiecare card (format Instagram)
- Buton de refresh pentru actualizarea știrilor

### 2. Preview Individual (`/admin/instagram/preview/[id]`)
- Afișare individuală a unei știri optimizată pentru screenshot
- Design îmbunătățit pentru captura de ecran
- Butoane pentru print și navigare înapoi
- Secțiune hashtag-uri cu buton de copiere automată
- Instrucțiuni pentru cel mai bun rezultat

## Design

### Culori de Brand
- **Primary**: `#0B132B` (brand)
- **Secondary**: `#1C2541` (brand-accent)
- **Highlight**: `#3A506B` (brand-highlight)
- **Info**: `#5BC0BE` (brand-info)
- **Soft**: `#A1C6EA` (brand-soft)

### Elemente Vizuale
- **Logo**: Poziționat în colțul stânga sus
- **Gradient**: Background gradient din culorile de brand
- **Typography**: Font modern și ușor de citit
- **Spacing**: Padding și margin optimizate pentru readability
- **Shadows**: Umbre subtile pentru adâncime

### Conținut
- **Titlu**: Știrea principală (truncat la 3 linii)
- **Sinteza**: Descrierea știrii (truncat la 4-5 linii)
- **Categorie**: Badge subtil cu categoria știrii (formatată cu prima literă mare)
- **Data**: Data publicării
- **Branding**: Logo și numele "Decodorul Oficial"
- **Hashtag-uri**: Secțiune cu hashtag-uri relevante și buton de copiere

## Structura Fișierelor

```
src/
├── app/
│   └── admin/
│       └── instagram/
│           ├── page.tsx                    # Pagina principală
│           └── preview/
│               └── [id]/
│                   └── page.tsx            # Preview individual
└── components/
    └── admin/
        ├── InstagramFeed.tsx              # Componenta principală
        ├── InstagramCard.tsx              # Card individual
        ├── InstagramPreview.tsx           # Preview individual
        └── HashtagSection.tsx             # Secțiune hashtag-uri
```

## Utilizare

### Pentru Screenshot pe Telefon
1. Accesează `/admin/instagram`
2. Click pe cardul dorit
3. Se deschide preview-ul în tab nou
4. Fă screenshot pe telefon în orientare portrait
5. Folosește funcția de crop din Instagram

### Pentru Screenshot pe Desktop
1. Accesează `/admin/instagram`
2. Click pe cardul dorit
3. Folosește butonul "Print" pentru salvare
4. Copiază hashtag-urile cu butonul dedicat
5. Sau fă screenshot direct din browser

## Optimizări

### Performance
- Lazy loading pentru componente
- Suspense pentru loading states
- Optimizare pentru mobile și desktop

### SEO
- Meta tags pentru noindex/nofollow
- Robots.txt exclusion (implicit)
- Structured data pentru branding

### Accessibility
- Contrast optimizat pentru readability
- Hover states pentru interactivitate
- Keyboard navigation support

## Stiluri CSS

### Line Clamp Utilities
```css
.line-clamp-1, .line-clamp-2, .line-clamp-3, 
.line-clamp-4, .line-clamp-5 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: N;
}
```

### Responsive Design
- Mobile: 1 coloană
- Tablet: 2 coloane
- Desktop: 3-4 coloane
- Aspect ratio păstrat pe toate device-urile

## Extensibilitate

### Adăugare Funcționalități
- Filtrare după categorie
- Căutare în știri
- Export în format PDF
- Template-uri multiple de design
- Hashtag-uri personalizabile
- Copiere automată în clipboard

### Personalizare
- Culori customizabile
- Font-uri diferite
- Layout-uri alternative
- Elemente decorative opționale

## Note Tehnice

### Dependențe
- Next.js 14
- Tailwind CSS
- TypeScript
- GraphQL pentru date

### API Integration
- Folosește `fetchLatestNews` pentru știri
- Folosește `fetchNewsById` pentru preview
- Gestionare automată a erorilor

### Security
- Ruta secretă (nu indexată)
- No authentication required (pentru simplitate)
- Poate fi protejată cu middleware în viitor
