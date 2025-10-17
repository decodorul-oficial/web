# Implementarea Google reCAPTCHA v3

## Prezentare generală

Această documentație descrie implementarea Google reCAPTCHA v3 în aplicația web Decodorul Oficial pentru protecția formularilor sensibile împotriva atacurilor automate și spam-ului.

## Funcționalități implementate

### 1. Hook personalizat pentru reCAPTCHA (`useRecaptcha.ts`)

- **Locație**: `src/hooks/useRecaptcha.ts`
- **Funcționalități**:
  - Încărcare automată a script-ului reCAPTCHA v3
  - Execuție de token-uri pentru acțiuni specifice
  - Gestionarea stărilor de încărcare și erori
  - Cleanup automat la unmount

### 2. Provider pentru Context (`RecaptchaProvider.tsx`)

- **Locație**: `src/components/auth/RecaptchaProvider.tsx`
- **Funcționalități**:
  - Context React pentru partajarea stării reCAPTCHA
  - Hook `useRecaptchaContext()` pentru accesul la funcționalități
  - Configurare centralizată cu site key

### 3. Integrare în Layout principal

- **Locație**: `src/app/layout.tsx`
- **Modificări**:
  - Adăugat `RecaptchaProvider` în ierarhia de componente
  - Configurare cu variabila de mediu `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

## Pagini protejate cu reCAPTCHA

### 1. Pagina de Login (`/login`)

- **Acțiune reCAPTCHA**: `login`
- **Implementare**: Verificare obligatorie înainte de autentificare
- **Token trimis**: În header-ul `X-Captcha-Token` către API

### 2. Pagina de Signup (`/signup`)

- **Acțiune reCAPTCHA**: `signup`
- **Implementare**: Verificare obligatorie înainte de crearea contului
- **Token trimis**: În header-ul `X-Captcha-Token` către API

### 3. Schimbarea parolei (`/profile/change-password`)

- **Acțiune reCAPTCHA**: `change_password`
- **Implementare**: Verificare obligatorie pentru operațiuni sensibile
- **Token trimis**: În header-ul `X-Captcha-Token` către API

### 4. Formularul de Newsletter

- **Acțiune reCAPTCHA**: `newsletter_subscribe`
- **Implementare**: Verificare opțională (doar dacă reCAPTCHA este încărcat)
- **Token trimis**: În header-ul `X-Captcha-Token` către API

## Configurare

### Variabile de mediu necesare

```env
# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Obținerea cheilor reCAPTCHA

1. Accesați [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Creați un nou site cu următoarele setări:
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**: domeniul aplicației (ex: `decodoruloficial.ro`)
3. Copiați **Site Key** în variabila de mediu

## Fluxul de funcționare

### 1. Încărcare script

```typescript
// Script-ul se încarcă automat la inițializarea aplicației
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  document.head.appendChild(script);
}, [siteKey]);
```

### 2. Execuție token

```typescript
// Generarea token-ului pentru o acțiune specifică
const token = await executeRecaptcha('login');
```

### 3. Trimitere către API

```typescript
// Token-ul este trimis în header
const response = await signIn({ 
  email, 
  password,
  recaptchaToken 
});
```

## Gestionarea erorilor

### Tipuri de erori

1. **reCAPTCHA nu este încărcat**
   - Mesaj: "reCAPTCHA nu este încărcat. Vă rugăm să încercați din nou."
   - Acțiune: Reîncercare automată

2. **Eșec la generarea token-ului**
   - Mesaj: "Verificarea reCAPTCHA a eșuat. Vă rugăm să încercați din nou."
   - Acțiune: Utilizatorul poate reîncerca

3. **Eroare de încărcare script**
   - Mesaj: "Failed to load reCAPTCHA script"
   - Acțiune: Verificare conexiune și configurare

## Securitate

### Măsuri implementate

1. **Verificare obligatorie** pentru operațiuni sensibile
2. **Token-uri unice** pentru fiecare acțiune
3. **Validare pe server** a token-urilor reCAPTCHA
4. **Timeout și retry logic** pentru gestionarea erorilor

### Recomandări pentru backend

```typescript
// Exemplu de validare pe server
const verifyRecaptcha = async (token: string, action: string) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
  });
  
  const data = await response.json();
  return data.success && data.score >= 0.5 && data.action === action;
};
```

## Testare

### Testare în dezvoltare

1. Folosiți cheile de test de la Google reCAPTCHA
2. Verificați în console că script-ul se încarcă corect
3. Testați toate formularile protejate

### Testare în producție

1. Configurați cheile reale de producție
2. Monitorizați scorurile reCAPTCHA în Google Admin Console
3. Ajustați threshold-ul de securitate dacă este necesar

## Monitorizare

### Metrici importante

- **Scoruri reCAPTCHA**: Monitorizați distribuția scorurilor
- **Rate de eșec**: Urmăriți procentul de verificări eșuate
- **Timp de răspuns**: Măsurați impactul asupra performanței

### Log-uri recomandate

```typescript
// Log pentru debugging
console.log('reCAPTCHA token generated:', {
  action: 'login',
  timestamp: new Date().toISOString(),
  success: !!token
});
```

## Troubleshooting

### Probleme comune

1. **Script nu se încarcă**
   - Verificați conexiunea la internet
   - Verificați domeniul în configurația reCAPTCHA

2. **Token-uri invalide**
   - Verificați cheia secretă pe server
   - Verificați că acțiunea corespunde cu cea trimisă

3. **Scoruri scăzute**
   - Analizați comportamentul utilizatorilor
   - Ajustați threshold-ul de securitate

## Actualizări viitoare

### Funcționalități planificate

1. **Adaptive threshold**: Ajustare automată a threshold-ului bazată pe comportament
2. **Analytics integration**: Integrare cu Google Analytics pentru monitorizare
3. **Fallback mechanisms**: Mecanisme de rezervă pentru cazurile de eșec

### Optimizări

1. **Lazy loading**: Încărcare doar când este necesar
2. **Caching**: Cache pentru token-uri în anumite condiții
3. **Performance monitoring**: Monitorizare impact asupra performanței

## Transmiterea Token-urilor către Backend

### Header-ul X-Captcha-Token

Toate token-urile reCAPTCHA sunt trimise către backend prin header-ul `X-Captcha-Token` în request-urile API. Această implementare asigură că:

1. **Token-urile sunt transmise corect**: Fiecare request sensibil include token-ul reCAPTCHA
2. **Backend-ul poate valida token-urile**: Server-ul poate verifica validitatea token-urilor cu Google
3. **Securitatea este menținută**: Token-urile nu sunt expuse în URL-uri sau body-uri

### Implementarea în UserService

```typescript
// src/features/user/services/userService.ts

// Funcție helper care creează un client API cu token-ul curent
const getApiClient = (additionalHeaders?: Record<string, string>) => {
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Adaugă header-uri suplimentare (ex: X-Captcha-Token)
  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders);
  }
  
  return getGraphQLClient({
    getAuthToken: () => authToken ?? undefined,
    additionalHeaders: additionalHeaders
  });
};

// Înregistrare utilizator nou
async signUp(input: SignUpInput): Promise<AuthResponse | null> {
  try {
    // Pregătește header-uri suplimentare pentru reCAPTCHA
    const additionalHeaders: Record<string, string> = {};
    if (input.recaptchaToken) {
      additionalHeaders['X-Captcha-Token'] = input.recaptchaToken;
    }
    
    const client = getApiClient(additionalHeaders);
    // ... rest of implementation
  }
}
```

### Implementarea în NewsletterService

```typescript
// src/features/newsletter/services/newsletterService.ts

export class NewsletterService {
  static async subscribe(input: SubscribeNewsletterInput, additionalHeaders?: Record<string, string>): Promise<Partial<NewsletterSubscriber>> {
    try {
      // Creează un client cu header-uri suplimentare dacă sunt furnizate
      const client = additionalHeaders ? getGraphQLClient({ additionalHeaders }) : this.client;
      
      const data = await client.request<{ subscribeNewsletter: Partial<NewsletterSubscriber> }>(
        SUBSCRIBE_MUTATION,
        { input }
      );
      return data.subscribeNewsletter;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw new Error('Eroare la înscrierea la newsletter. Te rugăm să încerci din nou.');
    }
  }
}
```

### Actualizarea Clientului GraphQL

```typescript
// src/lib/graphql/client.ts

export type GraphQLClientFactoryOptions = {
  endpoint?: string;
  getAuthToken?: () => Promise<string | undefined> | string | undefined;
  additionalHeaders?: Record<string, string>;
};

export function getGraphQLClient(options?: GraphQLClientFactoryOptions): GraphQLClient {
  // Browser side
  if (typeof window !== 'undefined') {
    const token = options?.getAuthToken?.();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Adaugă header-uri suplimentare (ex: X-Captcha-Token)
    if (options?.additionalHeaders) {
      Object.assign(headers, options.additionalHeaders);
    }

    // Route all browser requests through local proxy
    const browserEndpoint = options?.endpoint ?? '/api/graphql';
    const absoluteBrowserEndpoint = browserEndpoint.startsWith('http')
      ? browserEndpoint
      : `${window.location.origin}${browserEndpoint}`;
    
    return new GraphQLClient(absoluteBrowserEndpoint, {
      headers
    });
  }

  // Server side - similar implementation with additionalHeaders support
  // ...
}
```

### Actualizarea Proxy-ului GraphQL

```typescript
// src/app/api/graphql/route.ts

export async function POST(req: NextRequest) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Adaugă X-Internal-API-Key pentru autentificarea aplicației
    if (process.env.INTERNAL_API_KEY) {
      headers['X-Internal-API-Key'] = process.env.INTERNAL_API_KEY as string;
    }

    // Transmite header-ul Authorization dacă există
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Transmite header-ul X-Captcha-Token dacă există (pentru reCAPTCHA)
    const captchaToken = req.headers.get('x-captcha-token');
    if (captchaToken) {
      headers['X-Captcha-Token'] = captchaToken;
    }

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body
    });

    // ... rest of implementation
  } catch (err) {
    console.error('[GraphQL proxy] error forwarding request:', err);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
```

### Fluxul Complet de Transmitere

1. **Frontend**: Utilizatorul completează un formular sensibil
2. **reCAPTCHA**: Se execută `executeRecaptcha(action)` și se obține token-ul
3. **UserService/NewsletterService**: Token-ul este adăugat în `additionalHeaders['X-Captcha-Token']`
4. **GraphQL Client**: Header-ul este adăugat la request
5. **Proxy GraphQL**: Header-ul este transmis către backend
6. **Backend**: Validează token-ul cu Google reCAPTCHA API

### Verificarea Implementării

Pentru a verifica că token-urile sunt trimise corect:

1. **Browser DevTools**: Verifică Network tab pentru request-uri cu header-ul `X-Captcha-Token`
2. **Backend Logs**: Monitorizează log-urile backend-ului pentru primirea token-urilor
3. **Google reCAPTCHA Console**: Verifică statisticile de utilizare în consola Google

### Securitate

- **Token-urile sunt valide doar o dată**: Fiecare token poate fi folosit o singură dată
- **Expirare rapidă**: Token-urile expiră în 2 minute
- **Validare server-side**: Toate token-urile sunt validate pe server cu Google
- **Header-uri sigure**: Token-urile sunt trimise prin header-uri, nu prin URL-uri
