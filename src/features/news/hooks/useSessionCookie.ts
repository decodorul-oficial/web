import { useEffect } from 'react';
import { ensureSessionCookie, hasSessionCookie, getSessionCookie } from '@/lib/utils/sessionCookie';

/**
 * Hook pentru gestionarea cookie-ului mo_session în componentele React
 * Asigură că cookie-ul este setat când componenta se montează
 */
export function useSessionCookie() {
  useEffect(() => {
    // Asigură că cookie-ul mo_session este setat pentru analytics
    ensureSessionCookie();
  }, []);

  return {
    hasSession: hasSessionCookie(),
    sessionId: getSessionCookie(),
    ensureSession: ensureSessionCookie,
  };
}
