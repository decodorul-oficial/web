# Corectări Pagină Știri - Monitorul Oficial

## Probleme Identificate și Rezolvate

### 1. UI - Câmpurile nu erau grupate corect

**Problema:** Layout-ul câmpurilor de filtrare nu era organizat logic, câmpurile fiind distribuite în mod neuniform.

**Soluția implementată:**
- Reorganizat layout-ul în secțiuni logice:
  - **Căutare după keywords** - secțiune separată cu input și buton de căutare
  - **Filtre de sortare și direcție** - grupate împreună (2 coloane)
  - **Filtre de dată** - grupate împreună (2 coloane)
  - **Notificări și aplicare filtre** - grupate în partea de jos

**Modificări în cod:**
```tsx
// Înainte: grid-cols-1 md:grid-cols-3 pentru toate filtrele
// După: 
// - Filtre de sortare: grid-cols-1 md:grid-cols-2
// - Filtre de dată: grid-cols-1 md:grid-cols-2
// - Notificări și aplicare: flex flex-col sm:flex-row justify-between
```

### 2. Filtrarea după dată nu funcționa

**Problema:** Filtrele "De la data" și "Până la data" nu erau trimise către API, deci nu aveau efect.

**Soluția implementată:**
- Adăugat suport pentru filtrele de dată în tipurile TypeScript
- Actualizat query-ul GraphQL pentru a include parametrii `publicationDateFrom` și `publicationDateTo`
- Modificat serviciul pentru a transmite filtrele de dată către API
- Actualizat logica de căutare pentru a include filtrele de dată

**Modificări în cod:**

**Tipuri (`src/features/news/types.ts`):**
```typescript
export type SearchStiriByKeywordsParams = {
  keywords: string[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  publicationDateFrom?: string;  // Adăugat
  publicationDateTo?: string;    // Adăugat
};
```

**Query GraphQL (`src/features/news/graphql/queries.ts`):**
```graphql
query SearchStiriByKeywords(
  $keywords: [String!]!
  $limit: Int
  $offset: Int
  $orderBy: String
  $orderDirection: String
  $publicationDateFrom: String    # Adăugat
  $publicationDateTo: String      # Adăugat
) {
  searchStiriByKeywords(
    keywords: $keywords
    limit: $limit
    offset: $offset
    orderBy: $orderBy
    orderDirection: $orderDirection
    publicationDateFrom: $publicationDateFrom    # Adăugat
    publicationDateTo: $publicationDateTo        # Adăugat
  ) {
    # ... restul query-ului
  }
}
```

**Serviciu (`src/features/news/services/newsService.ts`):**
```typescript
export async function searchStiriByKeywords(params: SearchStiriByKeywordsParams) {
  const { keywords, limit = 20, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc', publicationDateFrom, publicationDateTo } = params;
  
  // Transmiterea parametrilor către API
  const data = await client.request<SearchStiriByKeywordsResponse>(SEARCH_STIRI_BY_KEYWORDS, {
    keywords,
    limit: limitClamped,
    offset,
    orderBy,
    orderDirection,
    publicationDateFrom,  // Adăugat
    publicationDateTo      // Adăugat
  });
}
```

**Pagina (`src/app/stiri/page.tsx`):**
```typescript
// Construim parametrii pentru căutare
const searchParams: SearchStiriByKeywordsParams = {
  keywords,
  limit: 20,
  offset,
  orderBy,
  orderDirection
};

// Adăugăm filtrele de dată dacă sunt setate
if (dateFrom) {
  searchParams.publicationDateFrom = dateFrom;
}
if (dateTo) {
  searchParams.publicationDateTo = dateTo;
}
```

### 3. Problema cu redirectarea și căutarea

**Problema:** Când utilizatorul era redirectat de pe o știre după click pe keyword, și apoi schimba cuvântul din câmpul de căutare, prima căutare se făcea cu cuvântul anterior din URL.

**Soluția implementată:**
- Separarea logicii de căutare de actualizarea URL-ului
- Butonul "Caută" nu mai actualizează URL-ul automat
- Butonul "Aplică filtrele" actualizează URL-ul și aplică toate filtrele
- Căutarea se face direct fără a depinde de URL

**Modificări în cod:**
```typescript
// Handler pentru căutare - nu actualizează URL-ul
const handleSearch = () => {
  const newKeywords = searchInput.split(',').map(k => k.trim()).filter(k => k.length > 0);
  setKeywords(newKeywords);
  // Nu apelăm updateURL() aici pentru a evita problema cu redirectarea
  // Vom apela performSearch direct
  if (newKeywords.length > 0) {
    performSearch(1);
  }
};

// Handler pentru aplicarea filtrelor - actualizează URL-ul
const handleApplyFilters = () => {
  updateURL();
  if (keywords.length > 0) {
    performSearch(1);
  }
};
```

### 4. Corectări suplimentare

**Warning-uri ESLint rezolvate:**
- Eliminat variabila nefolosită `notificationFilters`
- Corectat tipul `any` cu `Record<string, unknown>`
- Adăugat dependency-ul lipsă în `useEffect`

**Îmbunătățiri de performanță:**
- Optimizat `useCallback` dependencies
- Redus re-renderurile inutile

## Actualizare API

**Parametri actualizați:**
- `dateFrom` → `publicationDateFrom`
- `dateTo` → `publicationDateTo`

**Exemplu de utilizare API:**
```graphql
query Search($keywords: [String!]!, $from: String, $to: String, $limit: Int, $offset: Int) {
  searchStiriByKeywords(
    keywords: $keywords
    publicationDateFrom: $from
    publicationDateTo: $to
    limit: $limit
    offset: $offset
    orderBy: "publicationDate"
    orderDirection: "desc"
  ) {
    stiri { id title publicationDate }
    pagination { totalCount currentPage totalPages }
  }
}
```

## Testare

Pentru a testa modificările:

1. **Filtrarea după dată:**
   - Setează o dată în "De la data"
   - Verifică că rezultatele sunt filtrate corect

2. **Căutarea după keywords:**
   - Caută după un keyword
   - Schimbă keyword-ul în câmp
   - Apasă "Caută" - ar trebui să funcționeze imediat

3. **Aplicarea filtrelor:**
   - Setează filtre multiple
   - Apasă "Aplică filtrele" - ar trebui să actualizeze URL-ul și să aplice toate filtrele

4. **Redirectarea de pe keywords:**
   - Click pe un keyword dintr-o știre
   - Schimbă cuvântul din câmpul de căutare
   - Apasă "Caută" - ar trebui să funcționeze cu noul cuvânt

## Note importante

- Filtrele de dată folosesc acum parametrii `publicationDateFrom` și `publicationDateTo`
- API-ul suportă formatul de dată ISO (ex: 2024-01-01 sau 2024-01-01T10:00:00Z)
- Testează funcționalitatea pe diferite browsere și dispozitive
