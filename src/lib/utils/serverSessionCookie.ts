import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'mo_session';

/**
 * Generează un UUID v4 pentru sesiune
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Setează cookie-ul mo_session pe partea de server
 * Expirare: ~1 an, Secure, SameSite=Lax, Path=/
 */
export function setServerSessionCookie(): void {
  const cookieStore = cookies();
  const sessionId = generateSessionId();
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: false, // Permite acces din JavaScript pentru analytics
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 an în secunde
  });
}

/**
 * Verifică dacă cookie-ul mo_session există pe partea de server
 */
export function hasServerSessionCookie(): boolean {
  const cookieStore = cookies();
  return cookieStore.has(SESSION_COOKIE_NAME);
}

/**
 * Obține valoarea cookie-ului mo_session de pe partea de server
 */
export function getServerSessionCookie(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

/**
 * Asigură că cookie-ul mo_session este setat pe partea de server
 * Dacă nu există, îl setează cu un UUID v4
 */
export function ensureServerSessionCookie(): void {
  if (!hasServerSessionCookie()) {
    setServerSessionCookie();
  }
}
