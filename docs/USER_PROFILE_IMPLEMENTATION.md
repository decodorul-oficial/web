# Implementarea Sistemului de Profil Utilizator & Centru de Preferințe

## Prezentare Generală

Această implementare adaugă un sistem complet de autentificare și personalizare pentru utilizatorii aplicației Decodorul Oficial. Sistemul permite utilizatorilor să se înregistreze, să-și configureze preferințele de conținut și să primească un feed personalizat de știri.

## Caracteristici Principale

### 1. Sistem de Autentificare
- **OAuth Providers**: Google, LinkedIn
- **JWT Authentication**: Integrat cu Supabase
- **Session Management**: Gestionare automată a sesiunilor
- **Callback Handling**: Callback-uri separate pentru LinkedIn posting și autentificare utilizatori

### 2. Personalizare Conținut
- **Selecție Categorii**: Utilizatorii pot selecta categoriile de interes
- **Feed Personalizat**: Știri filtrate pe baza preferințelor
- **Onboarding Opțional**: Modal interactiv pentru configurarea preferințelor
- **Gestionare Preferințe**: Pagină dedicată pentru modificarea preferințelor

### 3. Integrare API
- **JWT pentru Utilizatori Autentificați**: Folosește JWT-ul din Supabase
- **INTERNAL_API_KEY pentru Utilizatori Neautentificați**: Păstrează mecanismul existent
- **Filtrare Inteligentă**: Conținut personalizat dacă există preferințe, altfel ordine descrescătoare

## Structura Implementării

### Fișiere Noi Create

#### Configurare Supabase
- `src/lib/supabase/client.ts` - Client Supabase pentru browser
- `src/lib/supabase/server.ts` - Client Supabase pentru server

#### Tipuri și Servicii
- `src/features/user/types.ts` - Tipuri TypeScript pentru utilizatori
- `src/features/user/services/userService.ts` - Servicii pentru gestionarea utilizatorilor
- `src/features/user/hooks/useUser.ts` - Hook pentru utilizatorul curent
- `src/features/user/hooks/useUserPreferences.ts` - Hook pentru preferințele utilizatorului

#### Componente de Autentificare
- `src/components/auth/AuthProvider.tsx` - Provider pentru contextul de autentificare
- `src/components/auth/LoginButton.tsx` - Buton de login/logout
- `src/components/user/OnboardingModal.tsx` - Modal pentru onboarding opțional

#### Pagini
- `src/app/auth/callback/page.tsx` - Callback pentru autentificare utilizatori
- `src/app/profile/page.tsx` - Pagina de profil utilizator
- `src/app/profile/preferences/page.tsx` - Pagina de preferințe

#### Componente de Conținut
- `src/features/news/components/PersonalizedNewsSection.tsx` - Secțiunea de știri personalizate

### Fișiere Modificate

#### Layout și Navigation
- `src/app/layout.tsx` - Adăugat AuthProvider
- `src/components/layout/Header.tsx` - Adăugat LoginButton
- `src/app/page.tsx` - Folosește PersonalizedNewsSection

#### GraphQL Client
- `src/lib/graphql/client.ts` - Suport pentru JWT și INTERNAL_API_KEY

## Configurare Necesară

### 1. Variabile de Mediu

Adaugă în `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=78uiji5s24hmkm
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### 2. Schema de Bază de Date Supabase

```sql
-- Tabela pentru profilurile utilizatorilor
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferred_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela pentru preferințele utilizatorilor
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_slug)
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies pentru user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pentru user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configurare OAuth în Supabase

1. **Google OAuth**:
   - Activează Google provider în Supabase Dashboard
   - Adaugă Client ID și Client Secret
   - Setează redirect URL: `https://yourdomain.com/auth/callback`

2. **LinkedIn OAuth**:
   - Activează LinkedIn provider în Supabase Dashboard
   - Adaugă Client ID și Client Secret
   - Setează redirect URL: `https://yourdomain.com/auth/callback`

## Fluxul de Funcționare

### 1. Autentificare
1. Utilizatorul apasă butonul de login din header
2. Se redirecționează la provider-ul OAuth (Google/LinkedIn)
3. După autentificare, se întoarce la `/auth/callback`
4. Se creează profilul utilizatorului în Supabase
5. Se redirecționează la homepage

### 2. Personalizare
1. Utilizatorul poate accesa preferințele din dropdown-ul profilului
2. Se poate configura onboarding-ul opțional
3. Preferințele se salvează în baza de date
4. Feed-ul se actualizează automat

### 3. Feed Personalizat
1. Pentru utilizatori autentificați cu preferințe: știri filtrate
2. Pentru utilizatori autentificați fără preferințe: știri generale
3. Pentru utilizatori neautentificați: știri generale cu INTERNAL_API_KEY

## API Integration

### GraphQL Client Modificat

Clientul GraphQL suportă acum două moduri de autentificare:

```typescript
// Pentru utilizatori autentificați
const token = await UserService.getJWTToken();
const client = getGraphQLClient({
  getAuthToken: () => token
});

// Pentru utilizatori neautentificați (automat)
const client = getGraphQLClient(); // Folosește INTERNAL_API_KEY
```

### Headers de Autentificare

- **Utilizatori Autentificați**: `Authorization: Bearer <jwt_token>`
- **Utilizatori Neautentificați**: `X-Internal-API-Key: <internal_key>`

## Testare

### 1. Testare Autentificare
- [ ] Login cu Google
- [ ] Login cu LinkedIn
- [ ] Logout
- [ ] Persistența sesiunii

### 2. Testare Personalizare
- [ ] Selectarea categoriilor
- [ ] Salvarea preferințelor
- [ ] Modificarea preferințelor
- [ ] Onboarding opțional

### 3. Testare Feed
- [ ] Feed personalizat pentru utilizatori cu preferințe
- [ ] Feed general pentru utilizatori fără preferințe
- [ ] Feed general pentru utilizatori neautentificați

## Securitate

### 1. RLS (Row Level Security)
- Toate tabelele au RLS activat
- Utilizatorii pot accesa doar propriile date
- Policies restrictive pentru toate operațiunile

### 2. JWT Security
- Token-urile JWT sunt gestionate de Supabase
- Expirare automată a token-urilor
- Refresh automat al token-urilor

### 3. OAuth Security
- Redirect URI-uri validate
- State parameter pentru CSRF protection
- Scopes limitate pentru OAuth providers

## Monitorizare și Analytics

### 1. Events de Tracking
- Login/Logout events
- Preferințe salvate/modificate
- Onboarding completat/sărit
- Feed personalizat vs general

### 2. Metrics Importante
- Rate-ul de autentificare
- Rate-ul de completare onboarding
- Utilizarea preferințelor
- Performanța feed-ului personalizat

## Întreținere

### 1. Backup-uri
- Backup regulat al tabelelor user_profiles și user_preferences
- Backup al configurației OAuth

### 2. Actualizări
- Monitorizarea actualizărilor Supabase
- Actualizarea dependințelor OAuth
- Testarea compatibilității cu noile versiuni

### 3. Debugging
- Logs pentru autentificare
- Logs pentru preferințe
- Monitoring al performanței API

## Concluzie

Implementarea oferă un sistem complet de autentificare și personalizare care:

1. **Păstrează funcționalitatea existentă** pentru LinkedIn posting
2. **Extinde aplicația** cu autentificare utilizatori
3. **Personalizează conținutul** pe baza preferințelor
4. **Respectă securitatea** prin RLS și JWT
5. **Oferă o experiență fluidă** cu onboarding opțional

Sistemul este gata pentru producție și poate fi extins cu funcționalități suplimentare precum notificări, abonamente premium, sau analitice avansate.
