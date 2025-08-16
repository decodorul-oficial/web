"use client";

import { useSessionCookie } from '@/features/news/hooks/useSessionCookie';
import { useConsent } from '@/components/cookies/ConsentProvider';

/**
 * Componentă pentru inițializarea cookie-ului mo_session
 * Se execută doar pe client și setează cookie-ul pentru analytics
 * DOAR dacă utilizatorul a dat consimțământul pentru analytics
 */
export function SessionCookieInitializer() {
  const { hasAnalyticsConsent } = useConsent();
  
  // Hook-ul se execută automat când componenta se montează
  // Dar doar dacă avem consimțământ pentru analytics
  useSessionCookie(hasAnalyticsConsent);
  
  // Această componentă nu renderizează nimic vizibil
  return null;
}
