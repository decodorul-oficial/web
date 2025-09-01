# Related Stories - Implementarea Frontend

## Descriere

Această documentație descrie implementarea frontend a funcționalității **Related Stories** în aplicația Decodorul Oficial. Funcționalitatea afișează o listă de știri relevante pentru fiecare știre individuală, bazată pe un sistem de scoring multi-criteriu implementat în backend.

## Implementarea

### 1. Tipurile TypeScript

În `src/features/news/types.ts` au fost adăugate tipurile pentru related stories:

```typescript
export type RelevanceReasons = {
  common_legal_acts?: string[];
  common_organizations?: string[];
  common_topics?: string[];
  common_keywords?: string[];
  same_category?: boolean;
};

export type RelatedStory = NewsItem & {
  relevanceScore: number;
  relevanceReasons: RelevanceReasons;
};

export type GetRelatedStoriesResponse = {
  getRelatedStories: {
    relatedStories: RelatedStory[];
  };
};

export type GetRelatedStoriesParams = {
  storyId: string;
  limit?: number;
  minScore?: number;
};
```

### 2. Query-ul GraphQL

În `src/features/news/graphql/queries.ts` a fost adăugat query-ul pentru related stories:

```graphql
export const GET_RELATED_STORIES = gql`
  query GetRelatedStories($storyId: ID!, $limit: Int, $minScore: Float) {
    getRelatedStories(storyId: $storyId, limit: $limit, minScore: $minScore) {
      relatedStories {
        id
        title
        publicationDate
        content
        filename
        viewCount
        relevanceScore
        relevanceReasons {
          common_legal_acts
          common_organizations
          common_topics
          common_keywords
          same_category
        }
      }
    }
  }
`;
```

### 3. Serviciul de Date

În `src/features/news/services/newsService.ts` a fost adăugată funcția `fetchRelatedStories`:

```typescript
export async function fetchRelatedStories(params: GetRelatedStoriesParams): Promise<RelatedStory[]> {
  const { storyId, limit = 5, minScore = 1.0 } = params;
  const limitClamped = Math.max(1, Math.min(20, limit)); // Max 20 results for performance

  ensureSessionCookie();

  try {
    const client = getGraphQLClient();
    const data = await client.request<GetRelatedStoriesResponse>(GET_RELATED_STORIES, {
      storyId,
      limit: limitClamped,
      minScore
    });
    return data.getRelatedStories.relatedStories;
  } catch (primaryError: unknown) {
    // Fallback logic with endpoint fallback
    // ...
  }
}
```

### 4. Componenta React

Componenta `RelatedStoriesSection` a fost creată în `src/features/news/components/RelatedStoriesSection.tsx`:

#### Caracteristici:
- **Client Component**: Folosește `'use client'` pentru interactivitate
- **State Management**: Gestionează loading, error și data states
- **Error Handling**: Afișează mesaje de eroare prietenoase
- **Responsive Design**: UI adaptat pentru mobile și desktop
- **Analytics Integration**: Tracking pentru click-urile pe știri

#### UI Elements:
- **Header**: Titlu cu iconița TrendingUp
- **Story Cards**: Fiecare știre cu:
  - Iconiță dinamică bazată pe conținut
  - Titlu cu link către pagina știrii
  - Scor de relevanță vizibil
  - Sumar scurt (180 caractere)
  - Motivele relevanței (badge-uri colorate)
  - Citarea legală
  - Data publicării

#### Motivele Relevanței:
- **Acte Normative Comune** (albastru): `📋 OG nr. 15/2002`
- **Organizații Comune** (verde): `🏛️ Ministerul Transporturilor`
- **Topicuri Comune** (violet): `🏷️ transporturi`
- **Aceeași Categorie** (portocaliu): `# Aceeași categorie`

### 5. Integrarea în Pagina Știrii

Componenta a fost integrată în `src/app/stiri/[slug]/page.tsx`, imediat după:

```tsx
<div className="space-y-3">
  <Citation {...citationFields} />
  <NewsletterCtaInline />
  <ArticleShareSection ... />
</div>

{/* Related Stories Section */}
<RelatedStoriesSection storyId={news.id} limit={5} minScore={1.0} />
```

## Funcționalități

### 1. Loading State
- Afișează "Se încarcă știrile relevante..." în timpul încărcării
- UI consistent cu restul aplicației

### 2. Error Handling
- Afișează mesaje de eroare prietenoase
- Fallback la endpoint-ul principal în caz de eșec

### 3. Empty State
- Nu afișează secțiunea dacă nu sunt știri relevante
- Evită spațiul gol în pagină

### 4. Performance
- Limitează rezultatele la maximum 20 pentru performance
- Folosește `useCallback` pentru optimizarea re-render-urilor
- Lazy loading al știrilor relevante

### 5. Analytics
- Tracking pentru click-urile pe știri relevante
- Categoria 'related_stories' pentru segmentare

## Styling și UI

### 1. Design System
- Folosește culorile brand-ului (brand-accent, brand-info)
- Consistent cu LatestNewsSection
- Responsive design pentru mobile și desktop

### 2. Iconițe
- Iconițe Lucide pentru motivele relevanței
- Iconițe dinamice pentru fiecare știre
- Fallback la iconița Gavel pentru știri fără iconiță specifică

### 3. Layout
- Grid layout similar cu LatestNewsSection
- Spacing consistent (space-y-6, gap-3, etc.)
- Typography hierarchy clară

## Configurare

### 1. Parametri Componenta
```tsx
<RelatedStoriesSection 
  storyId={news.id}     // ID-ul știrii curente
  limit={5}             // Numărul de știri relevante (default: 5)
  minScore={1.0}        // Scorul minim de relevanță (default: 1.0)
/>
```

### 2. Limitări
- **Limit**: 1-20 știri (pentru performance)
- **MinScore**: Scorul minim de relevanță (0.0+)
- **StoryId**: ID-ul știrii pentru care căutăm știri relevante

## Testing

### 1. Build Verification
```bash
npm run build
```
- Verifică că toate tipurile sunt corecte
- Confirmă că nu există erori de compilare

### 2. Runtime Testing
- Verifică încărcarea știrilor relevante
- Testează stările de loading și error
- Confirmă că link-urile funcționează corect

## Evoluții Viitoare

### 1. Caching
- Implementarea unui sistem de cache pentru rezultatele related stories
- Reducerea numărului de request-uri către API

### 2. Personalizare
- Filtre pentru utilizatori (exclude categorii, include doar anumite tipuri)
- Ajustarea scoring-ului pe baza preferințelor utilizatorului

### 3. A/B Testing
- Testarea diferitelor strategii de afișare
- Optimizarea conversiilor

### 4. Machine Learning
- Îmbunătățirea scoring-ului cu ML
- Recomandări personalizate

## Concluzie

Implementarea Related Stories oferă utilizatorilor o modalitate intuitivă de a descoperi conținut relevant, îmbunătățind semnificativ experiența de navigare și timpul petrecut pe site. Componenta este bine integrată în design system-ul existent și respectă toate principiile de performance și UX ale aplicației.
