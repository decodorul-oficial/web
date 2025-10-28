# Configurarea Proxy-ului GraphQL

## Problema Rezolvată

Aplicația folosește un proxy GraphQL pentru a gestiona requesturile către API-ul extern. Problema cu eroarea **508 Loop Detected** a fost cauzată de configurarea greșită a endpoint-urilor.

## Soluția Implementată

### Variabile de Environment

```bash
# Pentru browser requests (prin proxy local)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql

# Pentru server requests (direct la API extern)
EXTERNAL_GRAPHQL_ENDPOINT=https://decodorul-oficial-api.vercel.app/api/graphql

# Cheia API internă pentru autentificare
INTERNAL_API_KEY=your_internal_api_key_here

# Debug logging (opțional)
DEBUG_INTERNAL_API_KEY=true
```

### Logica Proxy-ului

1. **Browser requests** folosesc `NEXT_PUBLIC_GRAPHQL_ENDPOINT` (de obicei `/api/graphql`)
2. **Proxy-ul local** detectează tipul de endpoint:
   - Dacă `NEXT_PUBLIC_GRAPHQL_ENDPOINT` este relativ (`/api/graphql`) → folosește `EXTERNAL_GRAPHQL_ENDPOINT`
   - Dacă `NEXT_PUBLIC_GRAPHQL_ENDPOINT` este absolut (`https://...`) → folosește direct acel endpoint
   - Fallback → folosește `EXTERNAL_GRAPHQL_ENDPOINT`
3. **Server requests** (webhook-uri, etc.) folosesc direct `EXTERNAL_GRAPHQL_ENDPOINT`

### Fluxul de Date

```
Browser → /api/graphql (proxy local) → EXTERNAL_GRAPHQL_ENDPOINT (API extern)
Server → EXTERNAL_GRAPHQL_ENDPOINT (API extern direct)
```

## Configurarea pentru Diferite Medii

### Development
```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql
EXTERNAL_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### Production
```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql
EXTERNAL_GRAPHQL_ENDPOINT=https://decodorul-oficial-api.vercel.app/api/graphql
```

## Beneficiile Soluției

1. **✅ Eliminarea buclei infinite** - Nu mai există loop-uri 508
2. **✅ Flexibilitate** - Configurare separată pentru browser și server
3. **✅ Securitate** - CORS headers gestionate de proxy-ul local
4. **✅ Debugging** - Logging detaliat pentru monitorizare
5. **✅ Fără valori hardcodate** - Totul prin variabile de environment

## Debugging

Pentru a activa logging-ul detaliat:

```bash
DEBUG_INTERNAL_API_KEY=true
```

Log-urile vor afișa:
- `browserEndpoint` - Endpoint-ul folosit de browser
- `externalApiEndpoint` - Endpoint-ul extern pentru server
- `finalEndpoint` - Endpoint-ul final folosit pentru request
- `operationName` - Numele operației GraphQL
- `hasInternalKey` - Dacă cheia API internă este prezentă

## Verificarea Configurației

1. **Verifică variabilele de environment:**
   ```bash
   echo $NEXT_PUBLIC_GRAPHQL_ENDPOINT
   echo $EXTERNAL_GRAPHQL_ENDPOINT
   ```

2. **Testează un request GraphQL** și verifică în Network tab că:
   - Request-ul merge la `/api/graphql` (proxy local)
   - Nu primești eroare CORS sau 508
   - Response-ul vine cu CORS headers

3. **Verifică log-urile** pentru a confirma că endpoint-urile sunt corecte

## Troubleshooting

### Eroarea 508 Loop Detected
- Verifică că `NEXT_PUBLIC_GRAPHQL_ENDPOINT` este `/api/graphql`
- Verifică că `EXTERNAL_GRAPHQL_ENDPOINT` pointează către API-ul extern real

### Eroarea CORS
- Verifică că browser-ul folosește `/api/graphql` (proxy local)
- Verifică că proxy-ul local adaugă CORS headers

### Eroarea 500
- Verifică că `EXTERNAL_GRAPHQL_ENDPOINT` este accesibil și este un URL absolut (începe cu `http://` sau `https://`)
- Verifică că `INTERNAL_API_KEY` este setată corect
- Activează `DEBUG_INTERNAL_API_KEY=true` pentru mai multe detalii
- Verifică că nu există probleme de conectivitate către API-ul extern
