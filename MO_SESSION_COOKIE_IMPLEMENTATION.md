# Implementarea Cookie-ului mo_session pentru Analytics

## Prezentare generală

Această implementare adaugă un cookie persistent `mo_session` cu un UUID v4 pentru analytics mai bune în aplicația web Decodorul Oficial.

## Caracteristici tehnice

### Cookie-ul mo_session
- **Nume**: `mo_session`
- **Valoare**: UUID v4 generat automat
- **Expirare**: ~1 an (365 zile)
- **Securitate**: `Secure=true`, `SameSite=Lax`
- **Path**: `/` (disponibil pe întregul site)
- **HttpOnly**: `false` (permite acces din JavaScript pentru analytics)

## Implementare

### 1. Utilități pentru cookie-uri

#### `src/lib/utils/sessionCookie.ts` (Client-side)
- `generateSessionId()`: Generează UUID v4
- `setSessionCookie()`: Setează cookie-ul cu parametrii specificați
- `hasSessionCookie()`: Verifică existența cookie-ului
- `getSessionCookie()`: Obține valoarea cookie-ului
- `ensureSessionCookie()`: Asigură că cookie-ul este setat

#### `src/lib/utils/serverSessionCookie.ts` (Server-side)
- Funcții echivalente pentru gestionarea cookie-urilor pe server
- Folosește `next/headers` pentru API routes

### 2. Hook personalizat

#### `src/features/news/hooks/useSessionCookie.ts`
- Hook React pentru gestionarea cookie-ului în componente
- Se execută automat la montarea componentei
- Returnează starea curentă a sesiunii

### 3. Componenta de inițializare

#### `src/components/session/SessionCookieInitializer.tsx`
- Componentă client-side care inițializează cookie-ul
- Nu renderizează nimic vizibil
- Se include în toate paginile principale

### 4. Integrare în servicii

#### `src/features/news/services/newsService.ts`
- Toate funcțiile de fetch (GraphQL) apelează `ensureSessionCookie()`
- Cookie-ul este setat înainte de fiecare cerere GraphQL

#### `src/app/api/monitorul-oficial/route.ts`
- API route-ul setează cookie-ul pe partea de server
- Folosește `ensureServerSessionCookie()`

## Pagini care includ inițializarea

- `src/app/page.tsx` (pagina principală)
- `src/app/stiri/[slug]/page.tsx` (pagina de știri)
- `src/app/contact/page.tsx` (pagina de contact)
- `src/app/cookies/page.tsx` (politica de cookie-uri)
- `src/app/privacy/page.tsx` (politica de confidențialitate)
- `src/app/legal/page.tsx` (termeni de utilizare)
- `src/app/login/page.tsx` (pagina de login)

## Flux de execuție

1. **La încărcarea paginii**: `SessionCookieInitializer` se montează
2. **Hook-ul se execută**: `useSessionCookie` verifică existența cookie-ului
3. **Dacă nu există**: Se generează un UUID v4 și se setează cookie-ul
4. **La cereri GraphQL**: `ensureSessionCookie()` se apelează înainte de fiecare cerere
5. **La API calls**: Cookie-ul este setat și pe partea de server

## Dependințe

- `uuid`: Pentru generarea UUID v4
- `@types/uuid`: Tipuri TypeScript pentru uuid

## Beneficii pentru analytics

1. **Identificare unică**: Fiecare utilizator primește un ID persistent
2. **Tracking cross-session**: Urmărirea comportamentului pe multiple sesiuni
3. **Analytics îmbunătățite**: Date mai precise despre utilizatori
4. **Personalizare**: Posibilitatea de a oferi experiențe personalizate

## Conformitate GDPR

- Cookie-ul nu conține informații personale identificabile
- Este setat automat fără consimțământ explicit (cookie esențial)
- Utilizatorii pot șterge cookie-ul din setările browserului
- Informațiile sunt incluse în politica de cookie-uri

## Testare

Pentru a testa implementarea:

1. Deschide DevTools → Application → Cookies
2. Verifică existența cookie-ului `mo_session`
3. Șterge cookie-ul și reîncarcă pagina
4. Verifică că un nou cookie este generat automat
5. Testează că cookie-ul persistă între sesiuni

## Mantenanță

- Cookie-ul se regeneră automat la fiecare vizită dacă nu există
- UUID-ul este unic pentru fiecare utilizator
- Expirarea de 1 an asigură tracking pe termen lung
- Implementarea este transparentă pentru utilizatori
