# Ghid de Testare pentru Sistemul de Tracking Newsletter

## Testare Manuală

### 1. Pregătirea Mediului

1. **Asigură-te că ai acceptat cookie-urile de analytics**
   - Deschide site-ul
   - Acceptă cookie-urile de analytics din banner
   - Verifică că `mo_session` cookie este setat

2. **Deschide Developer Tools**
   - F12 sau click dreapta → Inspect
   - Mergi la tab-ul Application → Local Storage
   - Caută cheile care încep cu `newsletter_tracking_`

### 2. Testarea Fluxului de Tracking

#### Pasul 1: Verifică Starea Inițială
```javascript
// În Console, rulează:
localStorage.getItem('newsletter_tracking_' + document.cookie.match(/mo_session=([^;]+)/)[1])
```
Ar trebui să returneze `null` sau un obiect cu `newsViewed: 0`

#### Pasul 2: Vizualizează Prima Știre
1. Mergi la o știre
2. Verifică în Console:
```javascript
// Verifică că contorul s-a incrementat
localStorage.getItem('newsletter_tracking_' + document.cookie.match(/mo_session=([^;]+)/)[1])
```

#### Pasul 3: Vizualizează 3 Știri
1. Vizualizează în total 3 știri diferite
2. Modal-ul newsletter ar trebui să apară după a 3-a știre
3. Verifică în Console:
```javascript
// Ar trebui să vezi modal-ul afișat
// Și lastModalShown să fie 3
```

#### Pasul 4: Testează Cooldown-ul
1. Încearcă să vizualizezi încă 3 știri imediat
2. Modal-ul nu ar trebui să apară din nou (cooldown 24 ore)

#### Pasul 5: Testează Al Doilea Interval
1. Așteaptă 24 ore sau modifică manual timestamp-ul
2. Vizualizează încă 6 știri (total 9)
3. Modal-ul ar trebui să apară din nou

### 3. Testarea Abonării

#### Pasul 1: Abonează-te la Newsletter
1. Completează formularul de newsletter
2. Verifică în Console:
```javascript
// isSubscribed ar trebui să fie true
localStorage.getItem('newsletter_subscribed_' + document.cookie.match(/mo_session=([^;]+)/)[1])
```

#### Pasul 2: Verifică că Modal-ul Nu Mai Apare
1. Vizualizează mai multe știri
2. Modal-ul nu ar trebui să apară deloc

### 4. Testarea Dezabonării

#### Pasul 1: Dezabonează-te
1. Mergi la `/newsletter/unsubscribe`
2. Completează formularul de dezabonare
3. Verifică în Console:
```javascript
// Datele de tracking ar trebui să fie șterse
localStorage.getItem('newsletter_tracking_' + document.cookie.match(/mo_session=([^;]+)/)[1])
// Ar trebui să returneze null
```

#### Pasul 2: Verifică Resetarea
1. Vizualizează din nou știri
2. Tracking-ul ar trebui să înceapă din nou de la 0

### 5. Testarea Revocării Consimțământului

#### Pasul 1: Revocă Consimțământul pentru Analytics
1. Mergi la footer → Cookie-uri
2. Revocă consimțământul pentru analytics
3. Verifică că `mo_session` cookie a fost șters

#### Pasul 2: Verifică că Tracking-ul S-a Opri
1. Vizualizează știri
2. Tracking-ul nu ar trebui să funcționeze
3. Modal-ul nu ar trebui să apară

## Testare cu Componentul de Debugging

### Adaugă Componentul de Statistici

În orice pagină, poți adăuga componentul de debugging:

```tsx
import { NewsletterTrackingStats } from '@/components/newsletter/NewsletterTrackingStats';

// În componenta ta
<NewsletterTrackingStats showDetails={true} />
```

### Verifică Statisticile în Timp Real

Componentul va afișa:
- Numărul de știri vizualizate
- Status-ul de abonare
- Ultima afișare a modal-ului
- Detalii despre intervale și cooldown

## Testare Programatică

### Funcții de Debugging

```javascript
// În Console
import { getNewsletterStats, shouldShowNewsletterModal } from '@/lib/utils/newsletterTracking';

// Obține statisticile curente
const stats = getNewsletterStats();
console.log('Stats:', stats);

// Verifică dacă ar trebui afișat modal-ul
const shouldShow = shouldShowNewsletterModal();
console.log('Should show modal:', shouldShow);
```

### Simularea Intervalelelor

```javascript
// Simulează vizualizarea a 3 știri
for (let i = 0; i < 3; i++) {
  // Apelează funcția de tracking
  // (aceasta se face automat la vizualizarea știrilor)
}

// Verifică dacă modal-ul ar trebui să apară
const shouldShow = shouldShowNewsletterModal();
console.log('Should show after 3 news:', shouldShow);
```

## Testare în Diferite Scenarii

### 1. Utilizator Nou
- Cookie-uri acceptate
- Prima vizită
- Tracking-ul începe de la 0

### 2. Utilizator Revenit
- Cookie-uri deja acceptate
- Tracking-ul continuă de unde a rămas
- Modal-ul apare la intervalele corecte

### 3. Utilizator Abonat
- Nu ar trebui să apară modal-ul
- Tracking-ul continuă pentru analiză

### 4. Utilizator Dezabonat
- Tracking-ul se resetează
- Poate fi trackat din nou

### 5. Utilizator Fără Consimțământ
- Nu se face tracking
- Modal-ul nu apare

## Verificarea Conformității GDPR

### 1. Consimțământ Explicit
- Verifică că tracking-ul nu funcționează fără consimțământ
- Verifică că se oprește la revocarea consimțământului

### 2. Controlul Utilizatorului
- Verifică că datele se șterg la dezabonare
- Verifică că utilizatorul poate revoca consimțământul

### 3. Transparența
- Verifică că informațiile sunt clare în Politica de Cookie-uri
- Verifică că informațiile sunt clare în Politica de Confidențialitate

## Troubleshooting

### Modal-ul Nu Apare
1. Verifică că ai acceptat cookie-urile de analytics
2. Verifică că nu ești deja abonat
3. Verifică că ai vizualizat suficiente știri
4. Verifică cooldown-ul de 24 ore

### Tracking-ul Nu Funcționează
1. Verifică că `mo_session` cookie există
2. Verifică localStorage pentru datele de tracking
3. Verifică că nu ai erori în Console

### Datele Nu Se Salvează
1. Verifică că localStorage este disponibil
2. Verifică că nu ai erori de permisiuni
3. Verifică că sessionCookie este setat corect

## Concluzie

Sistemul de tracking newsletter este proiectat să fie robust, transparent și conform GDPR. Testarea manuală și programatică asigură că toate funcționalitățile lucrează corect în toate scenariile posibile.
