"use client";

import { useSessionCookie } from '@/features/news/hooks/useSessionCookie';

/**
 * Componentă pentru inițializarea cookie-ului mo_session
 * Se execută doar pe client și setează cookie-ul pentru analytics
 */
export function SessionCookieInitializer() {
  // Hook-ul se execută automat când componenta se montează
  useSessionCookie();
  
  // Această componentă nu renderizează nimic vizibil
  return null;
}
