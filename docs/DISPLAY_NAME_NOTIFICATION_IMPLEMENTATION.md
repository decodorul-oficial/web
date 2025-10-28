# Implementarea Notificării pentru Numele de Afișare în Comentarii

## Prezentare generală

Această funcționalitate notifică utilizatorii autentificați care nu au setat un nume de afișare în profilul lor când încearcă să adauge un comentariu. Utilizatorii pot alege să își seteze numele direct în pagina de comentarii sau să continue fără nume (în acest caz, comentariile vor apărea cu "Utilizator necunoscut").

## Componente implementate

### 1. DisplayNameNotification Component

**Fișier:** `src/components/comments/DisplayNameNotification.tsx`

Un component React care afișează o notificare vizuală când utilizatorul nu are nume de afișare setat.

**Funcționalități:**
- Afișează o notificare cu design amber pentru atenționare
- Permite utilizatorului să introducă un nume de afișare
- Oferă opțiunea de a continua fără nume
- Gestionează starea de loading în timpul salvării
- Actualizează profilul utilizatorului prin UserService

**Props:**
- `onDisplayNameSet?: (displayName: string) => void` - Callback când numele este setat cu succes
- `onContinueWithoutName?: () => void` - Callback când utilizatorul alege să continue fără nume
- `className?: string` - Clase CSS suplimentare

### 2. CommentForm Updates

**Fișier:** `src/features/comments/components/CommentForm.tsx`

Modificări la formularul de comentarii pentru a integra notificarea de nume de afișare.

**Modificări:**
- Verifică dacă utilizatorul are nume de afișare setat înainte de trimiterea comentariului
- Afișează notificarea DisplayNameNotification când este necesar
- Gestionează fluxul de setare a numelui și continuarea fără nume
- Păstrează conținutul comentariului în timpul procesului de setare a numelui

### 3. CommentItem Updates

**Fișier:** `src/features/comments/components/CommentItem.tsx`

Îmbunătățiri la afișarea comentariilor pentru a gestiona corect numele de afișare.

**Modificări:**
- Actualizat `getUserInitials` pentru a verifica atât `displayName` cât și `full_name`
- Actualizat afișarea numelui pentru a folosi `displayName` sau `full_name` ca fallback
- Păstrează "Utilizator necunoscut" ca fallback final

## Logica de funcționare

### 1. Verificarea numelui de afișare

Când utilizatorul încearcă să trimită un comentariu:

```typescript
// În CommentForm.handleSubmit
if (user && !profile?.displayName && !profile?.full_name) {
  setShowDisplayNameNotification(true);
  return;
}
```

### 2. Setarea numelui de afișare

Când utilizatorul alege să își seteze numele:

```typescript
const handleSetDisplayName = async (e: React.FormEvent) => {
  const success = await UserService.updateProfile({ displayName: displayName.trim() });
  if (success) {
    await refreshProfile();
    onDisplayNameSet?.(displayName.trim());
    setShowDisplayNameNotification(false);
  }
};
```

### 3. Continuarea fără nume

Când utilizatorul alege să continue fără nume, comentariul este trimis normal, dar va apărea cu "Utilizator necunoscut".

## Integrarea cu sistemul existent

### UserService Integration

Funcționalitatea folosește `UserService.updateProfile()` pentru a actualiza numele de afișare:

```typescript
await UserService.updateProfile({ displayName: newDisplayName });
```

### AuthProvider Integration

Folosește `useAuth()` hook pentru a accesa:
- `profile` - pentru a verifica dacă numele este setat
- `refreshProfile()` - pentru a actualiza profilul după modificare

### GraphQL Integration

Actualizarea profilului se face prin mutația GraphQL `UPDATE_PROFILE` definită în `src/features/user/graphql/userQueries.ts`.

## Stilizare

Notificarea folosește un design amber pentru a indica atenționarea:

```css
bg-amber-50 border border-amber-200
text-amber-800 text-amber-700
bg-amber-600 hover:bg-amber-700
```

## Testare

S-a creat un fișier de test `src/components/comments/__tests__/DisplayNameNotification.test.tsx` care testează:

- Afișarea notificării
- Funcționalitatea de setare a numelui
- Funcționalitatea de continuare fără nume
- Starea butoanelor (disabled/enabled)

## Utilizare

Componentul `DisplayNameNotification` este folosit automat în `CommentForm` și nu necesită configurare suplimentară. Se afișează doar pentru utilizatorii autentificați care nu au nume de afișare setat.

## Compatibilitate

Funcționalitatea este compatibilă cu:
- Sistemul de autentificare existent
- Sistemul de comentarii existent
- Sistemul de profil utilizator
- Design system-ul aplicației (Tailwind CSS)
