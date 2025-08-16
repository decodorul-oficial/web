# Implementarea Google Analytics în Decodorul Oficial

## Prezentare generală

Această implementare integrează Google Analytics 4 (GA4) în aplicația Decodorul Oficial, respectând regulamentul GDPR prin integrarea cu sistemul de consimțământ pentru cookie-uri.

## Caracteristici implementate

### 1. Integrarea cu ConsentProvider
- Google Analytics se încarcă doar după ce utilizatorul își dă consimțământul pentru cookie-uri de analiză
- Respectă regulamentul GDPR și alte reglementări de confidențialitate
- Tracking-ul se oprește automat când utilizatorul revocă consimțământul

### 2. Urmărirea evenimentelor personalizate

#### Urmărirea click-urilor pe știri
- **Event**: `news_click`
- **Category**: `news_interaction`
- **Label**: Include secțiunea și titlul știrii
- **Implementat în**: `LatestNewsSection`, `MostReadNewsSection`, `NewsViewTrackingWrapper`

#### Urmărirea căutărilor
- **Event**: `search`
- **Category**: `user_interaction`
- **Label**: Termenul de căutare
- **Value**: Numărul de rezultate găsite
- **Implementat în**: `SearchSpotlight`

#### Urmărirea selecțiilor de perioadă
- **Event**: `period_selection`
- **Category**: `user_interaction`
- **Label**: Perioada selectată (ex: "7d", "30d", "90d")
- **Implementat în**: `PeriodSelector`

#### Urmărirea vizualizărilor de secțiuni
- **Event**: `section_view`
- **Category**: `content_engagement`
- **Label**: Numele secțiunii (ex: "home", "news", "contact")
- **Implementat în**: `SectionViewTracker`

#### Urmărirea consimțământului pentru cookie-uri
- **Event**: `cookie_consent`
- **Category**: `privacy`
- **Label**: Tipul de consimțământ și statusul (ex: "analytics: granted")
- **Implementat în**: `ConsentProvider`, `CookieBanner`

### 3. Componente create/modificate

#### Componente noi
- `GoogleAnalytics.tsx` - Componenta principală pentru GA4
- `SectionViewTracker.tsx` - Urmărește vizualizările de secțiuni
- `NewsViewTrackingWrapper.tsx` - Wrapper pentru tracking-ul știrilor
- `analytics.ts` - Utilitare pentru tracking-ul evenimentelor

#### Componente modificate
- `ConsentProvider.tsx` - Integrat cu tracking-ul pentru consimțământ
- `CookieBanner.tsx` - Tracking pentru acțiunile de consimțământ
- `LatestNewsSection.tsx` - Tracking pentru click-urile pe știri
- `MostReadNewsSection.tsx` - Tracking pentru click-urile pe știri
- `PeriodSelector.tsx` - Tracking pentru selecțiile de perioadă
- `SearchSpotlight.tsx` - Tracking pentru căutări
- `layout.tsx` - Integrat cu componentele de analytics

### 4. Configurarea variabilelor de mediu

```bash
# .env
NEXT_PUBLIC_GA_ID=G-LD1CM4W0PB
```

## Structura implementării

```
src/
├── components/
│   ├── analytics/
│   │   ├── GoogleAnalytics.tsx          # Componenta principală GA4
│   │   └── SectionViewTracker.tsx       # Tracking pentru secțiuni
│   └── cookies/
│       ├── ConsentProvider.tsx          # Integrat cu analytics
│       └── CookieBanner.tsx            # Tracking pentru consimțământ
├── features/news/
│   ├── components/
│   │   ├── LatestNewsSection.tsx        # Tracking pentru click-uri
│   │   ├── MostReadNewsSection.tsx      # Tracking pentru click-uri
│   │   ├── PeriodSelector.tsx           # Tracking pentru perioade
│   │   └── NewsViewTrackingWrapper.tsx  # Wrapper pentru tracking
│   └── hooks/
│       └── useNewsViewTracking.ts       # Hook pentru tracking-ul știrilor
├── lib/
│   └── analytics.ts                     # Utilitare pentru tracking
└── app/
    └── layout.tsx                       # Integrat cu analytics
```

## Cum funcționează

### 1. Inițializarea
- `ConsentProvider` gestionează starea consimțământului
- `GoogleAnalytics` se încarcă doar când `hasAnalyticsConsent` este `true`
- Scriptul GA4 se încarcă dinamic în `<head>`

### 2. Tracking-ul evenimentelor
- Toate evenimentele sunt trimise prin funcția `event()` din `analytics.ts`
- Verifică automat dacă `window.gtag` este disponibil
- Include categorii, etichete și valori pentru analiză detaliată

### 3. Respectarea GDPR
- Nu se trimite niciun dată fără consimțământ
- Utilizatorul poate revoca consimțământul oricând
- Scriptul se elimină automat când consimțământul este revocat

## Metrici disponibile în Google Analytics

### Evenimente de utilizator
- **Click-uri pe știri**: Secțiunea, titlul, frecvența
- **Căutări**: Termenii populari, numărul de rezultate
- **Selecții de perioadă**: Perioadele cele mai populare
- **Navigare**: Secțiunile cele mai vizitate

### Metrici de conținut
- **Engagement**: Timpul petrecut pe secțiuni
- **Popularitate**: Știrile cele mai accesate
- **Comportament**: Calea utilizatorilor prin site

### Metrici de confidențialitate
- **Rate de consimțământ**: Câți utilizatori acceptă analytics
- **Tipuri de consimțământ**: Ce tipuri sunt acceptate/respins

## Beneficii

### Pentru utilizatori
- Control complet asupra datelor lor
- Transparență în ceea ce privește tracking-ul
- Respectarea regulamentelor GDPR

### Pentru dezvoltatori
- Insights detaliate despre comportamentul utilizatorilor
- Identificarea secțiunilor populare
- Optimizarea experienței utilizatorului

### Pentru business
- Înțelegerea audienței
- Identificarea conținutului valoros
- Optimizarea strategiei de conținut

## Testarea

### Verificarea funcționalității
1. Deschide DevTools → Network
2. Acceptă cookie-urile de analytics
3. Verifică că scriptul GA4 se încarcă
4. Interacționează cu site-ul (click-uri, căutări, etc.)
5. Verifică evenimentele în Google Analytics Real-Time

### Verificarea GDPR
1. Respinge cookie-urile de analytics
2. Verifică că scriptul GA4 nu se încarcă
3. Verifică că nu se trimit evenimente

## Mentenanță

### Actualizări
- Verifică periodic versiunea GA4
- Actualizează tipurile de evenimente dacă este necesar
- Monitorizează performanța tracking-ului

### Debugging
- Folosește Google Analytics Debugger
- Verifică console-ul pentru erori
- Testează cu diferite setări de consimțământ

## Concluzie

Această implementare oferă o soluție completă de analytics care respectă regulamentul GDPR și oferă insights valoroase despre comportamentul utilizatorilor. Integrarea cu sistemul de consimțământ asigură că utilizatorii au controlul asupra datelor lor, în timp ce tracking-ul detaliat oferă informații valoroase pentru optimizarea site-ului.
