# Optimizări de Performanță - Pagina /stiri/[slug]

## Problema Identificată
- **Timp de compilare**: 7.9 secunde
- **Numărul de module**: 9738 module
- **Cauze principale**:
  - Import-uri masive de Lucide Icons (`* as LucideIcons`)
  - Componente grele fără lazy loading
  - Dependențe mari (react-force-graph-2d, simple-datatables)

## Soluții Implementate

### 1. Lazy Loading pentru Componente Grele
```typescript
// În /src/app/stiri/[slug]/page.tsx
const TablesRenderer = dynamic(() => import('@/features/news/components/TablesRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
});

const AuthenticatedLegislativeNetworkSection = dynamic(() => 
  import('@/components/legislative/AuthenticatedLegislativeNetworkSection'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
});

const CommentsSection = dynamic(() => import('@/features/comments'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
});
```

### 2. Optimizare Import-uri Lucide Icons
**Înainte:**
```typescript
import * as LucideIcons from 'lucide-react'; // Încarcă toate iconițele
```

**După:**
```typescript
import { Gavel, TrendingUp, Eye } from 'lucide-react'; // Import specific
// + lazy loading pentru iconițe dinamice
```

### 3. Utilitate pentru Lazy Loading Icons
```typescript
// /src/lib/optimizations/lazyIcons.ts
export async function getLucideIcon(iconName: string, fallback: LucideIcon): Promise<LucideIcon> {
  // Cache pentru iconițe încărcate
  // Dynamic import pentru iconițe specifice
  // Fallback la iconița implicită
}
```

### 4. Optimizări Next.js Config
```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: ['lucide-react', 'react-force-graph-2d', 'simple-datatables']
},
webpack: (config, { dev, isServer }) => {
  // Bundle splitting pentru biblioteci mari
  // Cache groups pentru lucide, force-graph, data-tables
}
```

### 5. Preloading Inteligent
```typescript
// /src/lib/optimizations/performance.ts
export function preloadCriticalComponents() {
  // Preload componente critice după încărcarea inițială
}

export function lazyLoadNonCriticalComponents() {
  // Încarcă componente grele la interacțiune sau scroll
}
```

### 6. Optimizări TablesRenderer
```typescript
// Încarcă simple-datatables doar când există tabele
if (normalizedTables.length === 0) return;
```

## Rezultate Așteptate

### Reducere Timp de Compilare
- **Înainte**: 7.9 secunde, 9738 module
- **După**: < 1 secundă, ~2000-3000 module

### Beneficii
1. **Lazy Loading**: Componentele grele se încarcă doar când sunt necesare
2. **Tree Shaking**: Doar iconițele folosite sunt incluse în bundle
3. **Code Splitting**: Bibliotecile mari sunt separate în chunk-uri
4. **Preloading**: Componentele critice se preîncarcă inteligent
5. **Cache**: Iconițele sunt cache-uite pentru a evita re-importurile

### Bundle Size Reduction
- **Lucide Icons**: ~500KB → ~50KB (90% reducere)
- **Force Graph**: Lazy loaded (0KB la încărcarea inițială)
- **Data Tables**: Lazy loaded (0KB la încărcarea inițială)

## Monitorizare Performanță

Pentru a monitoriza îmbunătățirile:
1. Rulează `npm run build` și verifică timpul de compilare
2. Folosește `npm run dev` și verifică timpul de încărcare a paginii
3. Monitorizează bundle size-ul cu Next.js Bundle Analyzer

## Fișiere Modificate
- `/src/app/stiri/[slug]/page.tsx` - Lazy loading componente
- `/src/features/news/components/RelatedStoriesSection.tsx` - Optimizare icons
- `/src/features/news/components/TablesRenderer.tsx` - Conditional loading
- `/src/components/legislative/LegislativeNetworkGraph.tsx` - Deja optimizat
- `/next.config.mjs` - Bundle splitting și optimizări
- `/src/lib/optimizations/` - Utilități de performanță
- `/src/components/optimizations/` - Componente de optimizare

## Următorii Pași
1. Testează performanța în development și production
2. Monitorizează Core Web Vitals
3. Consideră implementarea Service Workers pentru cache
4. Optimizează și alte pagini cu probleme similare
