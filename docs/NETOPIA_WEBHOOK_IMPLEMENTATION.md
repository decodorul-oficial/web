# Implementarea Webhook-urilor Netopia

## Prezentare generală

Acest document descrie implementarea completă a webhook-urilor pentru sistemul de plăți Netopia în aplicația Monitorul Oficial. Implementarea include două endpoint-uri principale:

1. **Webhook IPN (Instant Payment Notification)** - `/api/payment/netopia/webhook`
2. **Success Redirect URL** - `/api/payment/netopia/success`

## Arhitectura implementării

### Componente principale

```
src/
├── app/api/payment/netopia/
│   ├── webhook/route.ts          # Webhook IPN endpoint
│   └── success/route.ts          # Success redirect endpoint
├── lib/payment/
│   ├── netopiaValidation.ts      # Validare și securitate
│   └── netopiaLogger.ts          # Logging avansat
└── docs/
    └── NETOPIA_WEBHOOK_IMPLEMENTATION.md
```

## 1. Webhook IPN (Instant Payment Notification)

### Scop
Webhook-ul IPN primește notificări despre starea tranzacțiilor de la Netopia și actualizează starea comenzilor în sistemul nostru.

### Endpoint
```
POST /api/payment/netopia/webhook
```

### Funcționalități

#### Validare și securitate
- **Validare semnătură**: Verifică autenticitatea webhook-ului folosind HMAC SHA256
- **Validare IP**: Verifică că webhook-ul vine de la IP-uri autorizate
- **Validare timestamp**: Previne atacurile de replay

#### Procesare date
- Parsează datele primite în format form-data
- Mapează statusurile Netopia la statusurile interne
- Actualizează comanda prin GraphQL API

#### Logging și audit
- Log-uri structurate pentru toate operațiunile
- Măsurare timp de procesare
- Log-uri de eroare cu severitate

### Configurare environment variables

```env
# Cheia secretă pentru validarea semnăturii webhook-urilor
NETOPIA_WEBHOOK_SECRET=your_webhook_secret_key

# IP-urile permise pentru webhook-uri (separate prin virgulă)
NETOPIA_ALLOWED_IPS=192.168.1.1,10.0.0.1

# Endpoint-ul GraphQL pentru actualizarea comenzilor
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-api.com/graphql

# Cheia API internă pentru autentificare
INTERNAL_API_KEY=your_internal_api_key
```

### Exemplu de utilizare

```typescript
// Netopia va trimite POST la acest endpoint cu datele plății
const webhookData = {
  orderId: "order_123",
  status: "confirmed",
  transactionId: "txn_456",
  amount: "99.99",
  currency: "RON",
  signature: "generated_signature"
};
```

## 2. Success Redirect URL

### Scop
Acest endpoint redirecționează utilizatorul înapoi în aplicație după finalizarea plății pe platforma Netopia.

### Endpoint
```
GET /api/payment/netopia/success
```

### Funcționalități

#### Procesare parametri
- Extrage parametrii din URL (orderId, status, transactionId, etc.)
- Validează prezența orderId-ului
- Mapează statusurile la statusuri interne

#### Redirect inteligent
- Construiește URL-ul de destinație cu parametrii necesari
- Gestionare erori cu redirect către pagina de eroare
- Cache busting cu timestamp

#### Logging și audit
- Log-uri pentru toate redirect-urile
- Măsurare timp de procesare
- Tracking utilizatori și sesiuni

### Exemplu de utilizare

```typescript
// Netopia va redirecționa utilizatorul la:
// /api/payment/netopia/success?orderId=order_123&status=confirmed&transactionId=txn_456

// Aplicația va redirecționa către:
// /payment/result?orderId=order_123&status=success&transactionId=txn_456&timestamp=1234567890
```

## 3. Sistemul de validare și securitate

### netopiaValidation.ts

#### Funcții principale

```typescript
// Validare completă webhook
validateNetopiaWebhook(webhookData, clientIP, options)

// Validare semnătură
validateNetopiaSignature(webhookData, secretKey)

// Validare IP
validateNetopiaIP(clientIP, allowedIPs)

// Validare timestamp
validateWebhookTimestamp(timestamp, maxAgeSeconds)
```

#### Configurare securitate

```typescript
const validation = validateNetopiaWebhook(webhookData, clientIP, {
  secretKey: process.env.NETOPIA_WEBHOOK_SECRET,
  allowedIPs: process.env.NETOPIA_ALLOWED_IPS?.split(',') || [],
  validateTimestamp: true,
  maxAgeSeconds: 300 // 5 minute
});
```

## 4. Sistemul de logging avansat

### netopiaLogger.ts

#### Caracteristici

- **Batch processing**: Log-urile sunt procesate în batch pentru performanță
- **Severitate erori**: low, medium, high, critical
- **Măsurare performanță**: Timp de procesare pentru fiecare operațiune
- **Context structurat**: Informații detaliate pentru debugging

#### Utilizare

```typescript
// Log success
await logWebhookSuccess({
  orderId: "order_123",
  webhookType: "netopia_ipn",
  status: "confirmed",
  transactionId: "txn_456",
  amount: 99.99,
  currency: "RON",
  rawData: webhookData,
  clientIP: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  processingTimeMs: 150
});

// Log error
await logWebhookError({
  orderId: "order_123",
  webhookType: "netopia_ipn",
  status: "failed",
  errorMessage: "Invalid signature",
  rawData: webhookData,
  clientIP: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  processingTimeMs: 50
});
```

## 5. Gestionarea erorilor

### Tipuri de erori

1. **Validation errors**: Erori de validare (semnătură, IP, timestamp)
2. **Processing errors**: Erori în procesarea plății
3. **Network errors**: Erori de comunicare cu API-ul
4. **Database errors**: Erori în salvarea datelor

### Răspunsuri HTTP

```typescript
// Success
200 OK - Webhook procesat cu succes

// Validation error
401 Unauthorized - Webhook validation failed

// Processing error
500 Internal Server Error - Eroare în procesarea plății

// Missing data
400 Bad Request - Date lipsă sau invalide
```

## 6. Configurarea în Netopia

### Webhook IPN URL
```
https://www.decodoruloficial.ro/api/payment/netopia/webhook
```

### Success Redirect URL
```
https://www.decodoruloficial.ro/api/payment/netopia/success
```

### Parametri necesari

Pentru webhook IPN, Netopia va trimite:
- `orderId` - ID-ul comenzii
- `status` - Statusul plății
- `transactionId` - ID-ul tranzacției
- `amount` - Suma plății
- `currency` - Moneda
- `signature` - Semnătura pentru validare
- `timestamp` - Timestamp-ul webhook-ului

## 7. Monitorizare și debugging

### Log-uri în consolă

Toate operațiunile sunt logate în consolă cu prefixe clare:
- `[Netopia Webhook IPN]` - Pentru webhook IPN
- `[Netopia Success Redirect]` - Pentru success redirect
- `[Netopia Validation]` - Pentru validări
- `[Netopia Logger]` - Pentru logging

### Log-uri în baza de date

Log-urile sunt salvate în tabelele:
- `webhook_logs` - Log-uri webhook
- `error_logs` - Log-uri erori

### Metrici disponibile

- Timp de procesare per webhook
- Rate de succes/eroare
- Distribuție erori pe tipuri
- Volume de trafic

## 8. Testare

### Testare locală

```bash
# Test webhook IPN
curl -X POST http://localhost:3000/api/payment/netopia/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "orderId=test_123&status=confirmed&signature=test_signature"

# Test success redirect
curl "http://localhost:3000/api/payment/netopia/success?orderId=test_123&status=confirmed"
```

### Testare în producție

1. Configurează webhook-urile în Netopia
2. Testează cu plăți reale (sumă mică)
3. Verifică log-urile în baza de date
4. Monitorizează performanța

## 9. Securitate

### Măsuri implementate

1. **Validare semnătură HMAC SHA256**
2. **Whitelist IP-uri**
3. **Validare timestamp pentru replay protection**
4. **Logging complet pentru audit**
5. **Rate limiting** (implementat la nivel de infrastructură)

### Recomandări

1. Păstrează cheia secretă în siguranță
2. Actualizează regulat IP-urile permise
3. Monitorizează log-urile pentru activități suspecte
4. Implementează alerting pentru erori critice

## 10. Întreținere

### Monitorizare zilnică

- Verifică log-urile de erori
- Monitorizează timpii de procesare
- Verifică rate-ul de succes

### Actualizări

- Actualizează IP-urile permise când Netopia schimbă infrastructura
- Revizuiește regulile de validare periodic
- Actualizează documentația când se fac modificări

## Concluzie

Implementarea webhook-urilor Netopia oferă o soluție robustă și sigură pentru procesarea plăților în aplicația Monitorul Oficial. Sistemul include validare completă, logging avansat și gestionarea erorilor, asigurând o experiență fiabilă pentru utilizatori și o ușurință de întreținere pentru dezvoltatori.
