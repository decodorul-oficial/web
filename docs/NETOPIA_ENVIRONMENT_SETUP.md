# Configurarea Environment Variables pentru Netopia

## Variabile necesare

Pentru a funcționa corect, webhook-urile Netopia necesită următoarele variabile de mediu:

### 1. Securitate și validare

```env
# Cheia secretă pentru validarea semnăturii webhook-urilor
# Obtine această cheie din panoul de administrare Netopia
NETOPIA_WEBHOOK_SECRET=your_webhook_secret_key_here

# IP-urile permise pentru webhook-uri (separate prin virgulă)
# Contactează Netopia pentru lista de IP-uri oficiale
NETOPIA_ALLOWED_IPS=192.168.1.1,10.0.0.1,203.0.113.0/24
```

### 2. API și baza de date

```env
# Endpoint-ul GraphQL pentru actualizarea comenzilor
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://decodorul-oficial-api.vercel.app/api/graphql

# Cheia API internă pentru autentificare
INTERNAL_API_KEY=your_internal_api_key_here

# Configurare Supabase pentru logging
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. URL-uri de bază

```env
# URL-ul de bază al aplicației (pentru redirect-uri)
NEXT_PUBLIC_BASE_URL=https://www.decodoruloficial.ro
```

## Configurarea în Netopia

### 1. Webhook IPN URL
```
https://www.decodoruloficial.ro/api/payment/netopia/webhook
```

### 2. Success Redirect URL
```
https://www.decodoruloficial.ro/api/payment/netopia/success
```

### 3. Parametri suportați

#### Pentru Webhook IPN:
- `orderId` - ID-ul comenzii
- `status` - Statusul plății (confirmed, pending, cancelled, failed)
- `transactionId` - ID-ul tranzacției
- `amount` - Suma plății
- `currency` - Moneda (RON)
- `signature` - Semnătura pentru validare
- `timestamp` - Timestamp-ul webhook-ului

#### Pentru Success Redirect:
- `orderId` - ID-ul comenzii
- `status` - Statusul plății
- `transactionId` - ID-ul tranzacției
- `amount` - Suma plății
- `currency` - Moneda
- `errorCode` - Codul de eroare (dacă există)
- `errorMessage` - Mesajul de eroare (dacă există)

## Verificarea configurației

### 1. Testare webhook IPN

```bash
curl -X POST https://www.decodoruloficial.ro/api/payment/netopia/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "orderId=test_123&status=confirmed&signature=test_signature&timestamp=$(date +%s)"
```

### 2. Testare success redirect

```bash
curl "https://www.decodoruloficial.ro/api/payment/netopia/success?orderId=test_123&status=confirmed"
```

### 3. Verificare health check

```bash
curl https://www.decodoruloficial.ro/api/payment/netopia/webhook
```

## Securitate

### 1. Cheia secretă webhook

- Păstrează cheia secretă în siguranță
- Nu o include în codul sursă
- Rotește-o periodic
- Folosește variabile de mediu pentru toate mediile

### 2. IP-uri permise

- Actualizează lista de IP-uri când Netopia schimbă infrastructura
- Folosește CIDR notation pentru intervale de IP-uri
- Monitorizează log-urile pentru încercări de acces de la IP-uri nepermise

### 3. Validare timestamp

- Webhook-urile expiră după 5 minute (300 secunde)
- Previne atacurile de replay
- Verifică că timestamp-ul nu este în viitor

## Monitorizare

### 1. Log-uri importante

- `[Netopia Webhook IPN]` - Procesarea webhook-urilor
- `[Netopia Success Redirect]` - Procesarea redirect-urilor
- `[Netopia Validation]` - Validările de securitate
- `[Netopia Logger]` - Logging-ul avansat

### 2. Metrici de monitorizat

- Rate de succes webhook-uri
- Timp de procesare mediu
- Numărul de erori pe tip
- Volume de trafic

### 3. Alerting

Configurează alerting pentru:
- Erori critice în procesarea webhook-urilor
- Rate de succes scăzute
- Timpi de procesare mari
- Încercări de acces neautorizate

## Troubleshooting

### 1. Webhook nu primește notificări

- Verifică că URL-ul este corect în Netopia
- Verifică că aplicația este accesibilă public
- Verifică log-urile pentru erori de validare

### 2. Erori de validare

- Verifică cheia secretă
- Verifică IP-urile permise
- Verifică formatul timestamp-ului

### 3. Probleme de redirect

- Verifică că URL-ul de bază este corect
- Verifică că parametrii sunt prezenți
- Verifică log-urile pentru erori de procesare

## Actualizări

### 1. Când să actualizezi

- Când Netopia schimbă API-ul
- Când se adaugă noi funcționalități
- Când se descoperă vulnerabilități de securitate

### 2. Procesul de actualizare

1. Testează în mediul de dezvoltare
2. Actualizează în staging
3. Testează cu plăți reale (sumă mică)
4. Deploy în producție
5. Monitorizează log-urile

## Suport

Pentru probleme tehnice:
- Verifică log-urile în baza de date
- Contactează echipa de dezvoltare
- Documentează problema cu log-uri relevante

Pentru probleme cu Netopia:
- Contactează suportul Netopia
- Furnizează ID-urile de comandă afectate
- Include log-urile de eroare relevante
