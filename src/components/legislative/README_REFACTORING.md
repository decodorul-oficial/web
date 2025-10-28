# Refactorizarea Componentelor Legislative Network

## Problema Identificată

Componentele `LegislativeNetworkGraph`, `LegislativeNetworkSection` și hook-ul `useGraphQL` aveau probleme cu requesturile în bucla infinită la încărcarea paginii, plus eroarea **"Rendered more hooks than during the previous render"**.

## Cauzele Problemei

### 🔴 **Cauza Principală - Dependențe Instabile în useGraphQL:**

1. **Obiecțiile recreau la fiecare render** - `{ documentId, depth: 2 }` era un obiect nou la fiecare render
2. **useEffect se executa la fiecare render** - din cauza dependenței `stableVariables` care se schimba
3. **Bucla infinită** - `fetchData` → `setData` → re-render → obiect nou → `useEffect` → `fetchData`...

### 🔴 **Managementul Ineficient al Prop-urilor:**

- Componenta `LegislativeNetworkGraph` primea `documentId` și îl folosea direct în obiectul de variabile
- Fără memoizare, orice re-renderizare a componentei părinte declanșa un nou request

### 🔴 **Hook-uri Condiționale:**

- `useMemo` era apelat după `return` statements condiționale în `NetworkStatsCard`

## Soluțiile Implementate

### 1. **Hook-ul `useGraphQL` - SOLUȚIA CHEIE**

**Problema:** Obiecții recreau la fiecare render, declanșând `useEffect` în bucla infinită.

**Soluția:** Memoizare completă a variabilelor și clonarea obiectelor pentru a preveni mutările.

```typescript
// Înainte - PROBLEMATIC
const { data, loading, error } = useGraphQL(
  GET_LEGISLATIVE_GRAPH,
  { documentId, depth: 2 }, // ❌ Obiect nou la fiecare render
  { skip: false }
);

// După - SOLUȚIA
const stableVariables = useMemo(() => ({
  documentId: stableDocumentId,
  depth: 2
}), [stableDocumentId]);

const { data, loading, error } = useGraphQL(
  GET_LEGISLATIVE_GRAPH,
  stableVariables, // ✅ Obiect stabil, nu se recreează
  { skip: false }
);
```

**În `useGraphQL.tsx`:**
```typescript
const stableVariables = React.useMemo(() => {
  // Dacă variables este undefined, returnează un obiect gol stabil
  if (variables === undefined) return {};
  // Dacă variables este un obiect, îl clonează pentru a evita mutările
  if (typeof variables === 'object' && variables !== null) {
    return { ...variables }; // ✅ Clonează obiectul pentru stabilitate
  }
  return variables;
}, [variables]);
```

### 2. **Componenta `LegislativeNetworkGraph` - Memoizarea Prop-urilor**

**Problema:** `documentId` și obiectul de variabile se recreau la fiecare render.

**Soluția:** Memoizare în două etape pentru stabilitate maximă.

```typescript
// Etapa 1: Stabilizează documentId
const stableDocumentId = useMemo(() => documentId, [documentId]);

// Etapa 2: Stabilizează obiectul de variabile
const stableVariables = useMemo(() => ({
  documentId: stableDocumentId,
  depth: 2
}), [stableDocumentId]);

// Folosește obiectul stabil
const { data, loading, error } = useGraphQL(
  GET_LEGISLATIVE_GRAPH,
  stableVariables, // ✅ Obiect stabil, nu declanșează useEffect
  { skip: false }
);
```

### 3. **Componenta `NetworkStatsCard` - Hook-uri la Început**

**Problema:** `useMemo` era apelat după `return` statements condiționale.

**Soluția:** Toate hook-urile mutate la începutul componentei.

```typescript
export function NetworkStatsCard() {
  // ✅ Toate hook-urile la început
  const { data, loading, error } = useGraphQL(...);
  const stats = useMemo(...);
  const sortedConnectionsByType = useMemo(...);
  const averageConfidencePercent = useMemo(...);

  // Return statements după toate hook-urile
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent />;
  if (!stats) return <NoDataComponent />;
  
  return <MainComponent />;
}
```

## 🔬 **Cum Funcționează Soluția**

### **Înainte (Bucla Infinită):**
```
1. Render 1: { documentId: "123", depth: 2 } → useEffect → fetchData → setData
2. setData → re-render
3. Render 2: { documentId: "123", depth: 2 } → useEffect → fetchData → setData
4. setData → re-render
5. Render 3: { documentId: "123", depth: 2 } → useEffect → fetchData → setData
... ∞
```

### **După (Stabil):**
```
1. Render 1: stableVariables = { documentId: "123", depth: 2 } → useEffect → fetchData → setData
2. setData → re-render
3. Render 2: stableVariables = { documentId: "123", depth: 2 } → useEffect NU se execută (aceeași referință)
4. Render complet fără requesturi
```

### **De ce Funcționează:**

1. **`useMemo` pentru `stableDocumentId`** - se schimbă doar când `documentId` se schimbă
2. **`useMemo` pentru `stableVariables`** - obiectul are aceeași referință între render-uri
3. **`useCallback` pentru `fetchData`** - funcția se recreează doar când dependențele se schimbă
4. **`useEffect` stabil** - se execută doar când `fetchData` se schimbă

## Beneficiile Refactorizării

1. **✅ Eliminarea buclei infinite** - Requesturile GraphQL nu se mai fac în bucla infinită
2. **✅ Eliminarea erorii React Hook** - "Rendered more hooks than during the previous render" rezolvată
3. **✅ Stabilitate completă** - Hook-urile au dependențe stabile și prevedibile
4. **✅ Performanță maximă** - Componentele nu se mai re-renderizează inutil
5. **✅ UX îmbunătățit** - Loading states mai bune și consistente

## Verificarea Soluției

Pentru a verifica că problema a fost rezolvată:

1. ✅ **Build-ul funcționează** - `npm run build` rulează fără erori
2. Deschide pagina `/stiri/[slug]` unde este folosită `LegislativeNetworkSection`
3. Verifică în Developer Tools > Network că nu se fac requesturi multiple la GraphQL
4. Verifică că nu apar erori în Console
5. Navighează între diferite știri pentru a verifica că nu apar probleme

## Regula Principală React Hook-uri

**🚨 IMPORTANT**: Hook-urile React (inclusiv `useMemo`, `useCallback`, `useState`, `useEffect`) trebuie să fie apelate întotdeauna în aceeași ordine și NICIODATĂ după `return` statements condiționale.

```typescript
// ❌ GREȘIT
function MyComponent() {
  const [state, setState] = useState();
  
  if (loading) return <Loading />;
  
  // ❌ Hook după return condițional
  const memoValue = useMemo(() => {...}, []);
  
// ✅ CORECT
function MyComponent() {
  const [state, setState] = useState();
  const memoValue = useMemo(() => {...}, []); // ✅ Hook la început
  
  if (loading) return <Loading />;
```

## Recomandări pentru Viitor

1. **✅ Memoizează întotdeauna obiectele** pasate ca props sau variabile la hook-uri
2. **✅ Clonează obiectele** în `useMemo` pentru a evita mutările
3. **✅ Toate hook-urile la început** - niciodată după `return` statements condiționale
4. **✅ Testează dependențele** în `useEffect` pentru a te asigura că sunt stabile
5. **✅ Monitorizează Network tab-ul** din Developer Tools pentru a detecta requesturi multiple
6. **✅ Rulează `npm run build`** pentru a verifica că nu există erori de compilare
7. **✅ Folosește `useMemo` pentru obiecte complexe** care sunt pasate ca props
