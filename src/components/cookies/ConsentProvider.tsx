"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { removeSessionCookie } from '../../lib/utils/sessionCookie';

type ConsentCategories = {
  essential: true; // always true
  analytics: boolean;
};

type ConsentContextValue = {
  consent: ConsentCategories | null; // null = not decided
  setConsent: (c: ConsentCategories) => void;
  resetConsent: () => void;
  hasAnalyticsConsent: boolean;
  hasEssentialConsent: boolean;
  isLoaded: boolean;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

const STORAGE_KEY = 'cookie-consent.v1';

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentCategories | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConsentState(parsed);
      }
    } catch {
      // Silent error handling for production
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setConsent = useCallback((c: ConsentCategories) => {
    setConsentState(c);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
      
      // Dacă utilizatorul revocă consimțământul pentru analytics,
      // elimină cookie-ul mo_session
      if (consent?.analytics && !c.analytics) {
        removeSessionCookie();
      }
    } catch {
      // Silent error handling for production
    }
  }, [consent?.analytics]);

  const resetConsent = useCallback(() => {
    setConsentState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Elimină cookie-ul mo_session când se resetează consimțământul
      removeSessionCookie();
    } catch {
      // Silent error handling for production
    }
  }, []);

  const hasAnalyticsConsent = consent?.analytics ?? false;
  const hasEssentialConsent = consent?.essential ?? true;

  const value = useMemo(() => ({ 
    consent, 
    setConsent, 
    resetConsent, 
    hasAnalyticsConsent, 
    hasEssentialConsent,
    isLoaded
  }), [consent, hasAnalyticsConsent, hasEssentialConsent, isLoaded, setConsent, resetConsent]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}


