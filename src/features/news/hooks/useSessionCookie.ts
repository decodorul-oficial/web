import { useEffect } from 'react';
import { ensureSessionCookie, hasSessionCookie, getSessionCookie, removeSessionCookie } from '@/lib/utils/sessionCookie';

/**
 * Hook pentru gestionarea cookie-ului mo_session în componentele React
 * Asigură că cookie-ul este setat când componenta se montează
 * DOAR dacă utilizatorul a dat consimțământul pentru analytics
 */
export function useSessionCookie(hasAnalyticsConsent: boolean) {
  useEffect(() => {
    if (hasAnalyticsConsent) {
      // Asigură că cookie-ul mo_session este setat pentru analytics
      ensureSessionCookie();
    } else {
      // Dacă nu avem consimțământ, elimină cookie-ul
      removeSessionCookie();
    }
  }, [hasAnalyticsConsent]);

  return {
    hasSession: hasAnalyticsConsent ? hasSessionCookie() : false,
    sessionId: hasAnalyticsConsent ? getSessionCookie() : null,
    ensureSession: () => hasAnalyticsConsent ? ensureSessionCookie() : null,
  };
}
