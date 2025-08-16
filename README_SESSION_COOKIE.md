# Cookie-ul mo_session - Ghid pentru Dezvoltatori

## Prezentare generală

Cookie-ul `mo_session` este un identificator persistent unic (UUID v4) care este setat automat pentru fiecare utilizator al aplicației. Acesta este folosit pentru analytics și tracking-ul comportamentului utilizatorilor pe multiple sesiuni.

## Cum funcționează

### 1. Inițializare automată
Cookie-ul este setat automat când:
- O pagină se încarcă (prin `SessionCookieInitializer`)
- Se face o cerere GraphQL (prin serviciile de știri)
- Se face o cerere REST (prin API routes)

### 2. Caracteristici tehnice
- **Nume**: `mo_session`
- **Valoare**: UUID v4 generat automat
- **Expirare**: 1 an (365 zile)
- **Securitate**: `Secure=true`, `SameSite=Lax`
- **Path**: `/` (disponibil pe întregul site)
- **HttpOnly**: `false` (permite acces din JavaScript)

## Utilizare în componente

### Pentru componente client-side

```tsx
import { useSessionCookie } from '@/features/news/hooks/useSessionCookie';

export function MyComponent() {
  const { hasSession, sessionId, ensureSession } = useSessionCookie();
  
  // Cookie-ul este setat automat la montarea componentei
  
  return (
    <div>
      {hasSession ? (
        <p>Session ID: {sessionId}</p>
      ) : (
        <p>No session</p>
      )}
    </div>
  );
}
```

### Pentru componente server-side

```tsx
import { ensureServerSessionCookie } from '@/lib/utils/serverSessionCookie';

export default function ServerComponent() {
  // Asigură că cookie-ul este setat pe server
  ensureServerSessionCookie();
  
  return <div>Server component</div>;
}
```

## Utilizare în servicii

### Pentru servicii GraphQL

```ts
import { ensureSessionCookie } from '@/lib/utils/sessionCookie';

export async function myGraphQLService() {
  // Asigură că cookie-ul este setat înainte de cerere
  ensureSessionCookie();
  
  // Fă cererea GraphQL
  const client = getGraphQLClient();
  const data = await client.request(query, variables);
  
  return data;
}
```

### Pentru API routes

```ts
import { ensureServerSessionCookie } from '@/lib/utils/serverSessionCookie';

export async function GET(request: NextRequest) {
  // Asigură că cookie-ul este setat pe server
  ensureServerSessionCookie();
  
  // Logica API
  return NextResponse.json({ success: true });
}
```

## Hook-uri disponibile

### `useSessionCookie()`
Hook React care:
- Setează automat cookie-ul la montarea componentei
- Returnează starea curentă a sesiunii
- Oferă funcții pentru gestionarea cookie-ului

**Return value:**
```ts
{
  hasSession: boolean;        // Dacă cookie-ul există
  sessionId: string | null;   // Valoarea cookie-ului
  ensureSession: () => void;  // Funcție pentru a forța setarea
}
```

## Funcții utilitare

### Client-side (`src/lib/utils/sessionCookie.ts`)

- `generateSessionId()`: Generează un nou UUID v4
- `setSessionCookie()`: Setează cookie-ul cu parametrii specificați
- `hasSessionCookie()`: Verifică existența cookie-ului
- `getSessionCookie()`: Obține valoarea cookie-ului
- `ensureSessionCookie()`: Asigură că cookie-ul este setat

### Server-side (`src/lib/utils/serverSessionCookie.ts`)

- `generateSessionId()`: Generează un nou UUID v4
- `setServerSessionCookie()`: Setează cookie-ul pe server
- `hasServerSessionCookie()`: Verifică existența cookie-ului pe server
- `getServerSessionCookie()`: Obține valoarea cookie-ului de pe server
- `ensureServerSessionCookie()`: Asigură că cookie-ul este setat pe server

## Exemple de implementare

### 1. Componentă cu tracking personalizat

```tsx
import { useSessionCookie } from '@/features/news/hooks/useSessionCookie';
import { useEffect } from 'react';

export function AnalyticsComponent() {
  const { sessionId } = useSessionCookie();
  
  useEffect(() => {
    if (sessionId) {
      // Trimite analytics cu session ID
      analytics.track('page_view', { sessionId });
    }
  }, [sessionId]);
  
  return <div>Analytics component</div>;
}
```

### 2. Serviciu cu session tracking

```ts
import { ensureSessionCookie, getSessionCookie } from '@/lib/utils/sessionCookie';

export async function trackUserAction(action: string, data: any) {
  ensureSessionCookie();
  const sessionId = getSessionCookie();
  
  // Trimite tracking data cu session ID
  await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data, sessionId })
  });
}
```

### 3. API route cu session validation

```ts
import { getServerSessionCookie } from '@/lib/utils/serverSessionCookie';

export async function POST(request: NextRequest) {
  const sessionId = getServerSessionCookie();
  
  if (!sessionId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }
  
  // Logica API cu session ID
  const body = await request.json();
  await processRequest(body, sessionId);
  
  return NextResponse.json({ success: true });
}
```

## Testing

### Testare manuală
1. Deschide DevTools → Application → Cookies
2. Verifică existența cookie-ului `mo_session`
3. Șterge cookie-ul și reîncarcă pagina
4. Verifică că un nou cookie este generat automat

### Testare automată
```bash
npm run test src/lib/utils/__tests__/sessionCookie.test.ts
```

## Debugging

### Verificare în browser
```javascript
// În console
console.log('Session cookie:', document.cookie);
console.log('mo_session exists:', document.cookie.includes('mo_session'));
```

### Verificare în server logs
Cookie-ul este setat automat în API routes și poate fi verificat în logs.

## Best practices

1. **Nu modifica manual**: Cookie-ul este gestionat automat
2. **Folosește hook-ul**: Pentru componente React, folosește `useSessionCookie()`
3. **Verifică existența**: Înainte de a folosi session ID, verifică dacă există
4. **Respectă GDPR**: Cookie-ul nu conține informații personale
5. **Testează**: Verifică funcționalitatea pe diferite browsere

## Troubleshooting

### Cookie-ul nu se setează
- Verifică dacă `SessionCookieInitializer` este inclus în pagină
- Verifică dacă browserul acceptă cookie-uri
- Verifică setările de securitate (HTTPS pentru `Secure=true`)

### Cookie-ul se șterge
- Verifică expirarea (1 an)
- Verifică setările browserului
- Verifică dacă utilizatorul șterge manual cookie-urile

### Probleme cu SameSite
- `SameSite=Lax` este compatibil cu majoritatea browserelor
- Pentru cross-site requests, poate fi necesar să ajustezi setările
