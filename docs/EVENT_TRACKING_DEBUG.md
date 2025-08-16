# 🐛 Debug Event Tracking - Google Analytics

## 🔍 **Problema Identificată:**

Google Analytics se încarcă corect, dar **evenimentele nu sunt track-uite**. Nu vezi request-uri către Google Analytics pentru:
- Navigarea între pagini
- Căutări
- Click-uri pe știri
- Selecții de perioadă

## ✅ **Ce Funcționează:**
- ✅ Script-ul GA4 se încarcă cu succes
- ✅ Cookie-ul `mo_session` este setat
- ✅ Consimțământul este salvat corect
- ✅ `SectionViewTracker` este folosit în layout

## ❌ **Ce Nu Funcționează:**
- ❌ Evenimentele nu se trimit către Google Analytics
- ❌ Nu vezi request-uri `collect?v=...` în Network tab
- ❌ Nu vezi evenimente în Google Analytics dashboard

## 🧪 **Testare și Debug:**

### **Test 1: Verifică dacă `window.gtag` este disponibil**
În Console, scrie:
```javascript
window.gtag
```
**Rezultat așteptat:** O funcție, nu `undefined`

### **Test 2: Verifică dacă evenimentele sunt apelate**
În Console, ar trebui să vezi:
```
Analytics: trackSectionView called: {sectionName: "news"}
Analytics: event called: {action: "section_view", category: "content_engagement", label: "news"}
Analytics: gtag available, sending event
```

### **Test 3: Verifică dacă `trackSectionView` este apelat**
Navighează pe o pagină nouă (ex: `/stiri/...`) și verifică Console-ul.

### **Test 4: Verifică dacă `trackNewsClick` este apelat**
Click pe o știre și verifică Console-ul.

### **Test 5: Verifică dacă `trackSearch` este apelat**
Folosește bara de căutare și verifică Console-ul.

## 🔧 **Posibile Cauze:**

### **1. `window.gtag` nu este disponibil**
- Google Analytics nu s-a inițializat corect
- Script-ul se încarcă dar nu se execută

### **2. Evenimentele nu sunt apelate**
- Funcțiile de tracking nu sunt apelate
- Probleme cu import-urile

### **3. Probleme cu GA4 Configuration**
- ID-ul de tracking nu este corect
- Configurația GA4 nu este validă

## 📋 **Pași de Debug:**

### **Pasul 1: Verifică Console-ul**
Cu noile log-uri adăugate, ar trebui să vezi:
```
Analytics: trackSectionView called: {sectionName: "news"}
Analytics: event called: {action: "section_view", category: "content_engagement", label: "news"}
Analytics: gtag available, sending event
```

### **Pasul 2: Verifică dacă `window.gtag` este o funcție**
```javascript
typeof window.gtag === 'function'  // ar trebui să fie true
```

### **Pasul 3: Testează manual un eveniment**
În Console, scrie:
```javascript
window.gtag('event', 'test_event', {event_category: 'test', event_label: 'debug'})
```

### **Pasul 4: Verifică Network tab**
După testul manual, ar trebui să vezi un request către Google Analytics.

## 🎯 **Rezultatul Așteptat:**

După navigarea pe o pagină nouă, ar trebui să vezi în Console:
```
Analytics: trackSectionView called: {sectionName: "news"}
Analytics: event called: {action: "section_view", category: "content_engagement", label: "news"}
Analytics: gtag available, sending event
```

Și în Network tab (filtrat cu "google"):
```
collect?v=2&tid=G-LD1CM4W0PB&cid=...&t=event&ec=content_engagement&ea=section_view&el=news
```

## 🚨 **Dacă nu funcționează:**

1. **Verifică Console-ul** pentru erori
2. **Verifică dacă `window.gtag` este disponibil**
3. **Testează manual un eveniment**
4. **Verifică dacă GA_TRACKING_ID este corect**

## 📞 **Următorii Pași:**

1. **Reîncarcă aplicația** cu noile log-uri
2. **Navighează pe o pagină nouă**
3. **Verifică Console-ul** pentru mesajele de debug
4. **Raportează ce vezi** în Console

**Cu noile log-uri, vom putea identifica exact unde este problema!** 🔍
