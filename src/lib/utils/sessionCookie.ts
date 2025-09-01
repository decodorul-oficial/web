import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'mo_session';

/**
 * Generează un UUID v4 pentru sesiune
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Setează cookie-ul mo_session cu un UUID v4
 * Expirare: ~1 an, Secure, SameSite=Lax, Path=/
 */
export function setSessionCookie(): void {
  if (typeof document === 'undefined') return; // Server-side rendering
  
  const sessionId = generateSessionId();
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  
  const cookieValue = `${SESSION_COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/; secure; samesite=lax`;
  document.cookie = cookieValue;
}

/**
 * Elimină cookie-ul mo_session
 */
export function removeSessionCookie(): void {
  if (typeof document === 'undefined') return; // Server-side rendering
  
  // Setăm cookie-ul să expire în trecut pentru a-l elimina
  const expires = new Date(0);
  const cookieValue = `${SESSION_COOKIE_NAME}=; expires=${expires.toUTCString()}; path=/; secure; samesite=lax`;
  document.cookie = cookieValue;
}

/**
 * Verifică dacă cookie-ul mo_session există
 */
export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  
  return document.cookie
    .split(';')
    .some(cookie => cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
}

/**
 * Obține valoarea cookie-ului mo_session
 */
export function getSessionCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  
  if (sessionCookie) {
    return sessionCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Asigură că cookie-ul mo_session este setat
 * Dacă nu există, îl setează cu un UUID v4
 */
export function ensureSessionCookie(): void {
  if (!hasSessionCookie()) {
    setSessionCookie();
  }
}
