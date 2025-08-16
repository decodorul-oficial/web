"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

const STORAGE_KEY = 'cookie-consent.v1';

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentCategories | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      console.log('🔍 ConsentProvider: Loading from localStorage:', raw);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log('✅ ConsentProvider: Parsed consent:', parsed);
        setConsentState(parsed);
      } else {
        console.log('❌ ConsentProvider: No consent found in localStorage');
      }
    } catch (error) {
      console.error('❌ ConsentProvider: Error loading consent:', error);
    }
  }, []);

  const setConsent = (c: ConsentCategories) => {
    console.log('🔍 ConsentProvider: Setting consent to:', c);
    setConsentState(c);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
      console.log('✅ ConsentProvider: Consent saved to localStorage');
      
      // Dacă utilizatorul revocă consimțământul pentru analytics,
      // elimină cookie-ul mo_session
      if (consent?.analytics && !c.analytics) {
        console.log('🔄 ConsentProvider: Revoking analytics consent, removing mo_session cookie');
        removeSessionCookie();
      }
    } catch (error) {
      console.error('❌ ConsentProvider: Error saving consent:', error);
    }
  };

  const resetConsent = () => {
    console.log('🔄 ConsentProvider: Resetting consent');
    setConsentState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ ConsentProvider: Consent removed from localStorage');
      // Elimină cookie-ul mo_session când se resetează consimțământul
      removeSessionCookie();
    } catch (error) {
      console.error('❌ ConsentProvider: Error resetting consent:', error);
    }
  };

  const hasAnalyticsConsent = consent?.analytics ?? false;
  const hasEssentialConsent = consent?.essential ?? true;

  console.log('🔍 ConsentProvider: Current state:', {
    consent,
    hasAnalyticsConsent,
    hasEssentialConsent
  });

  const value = useMemo(() => ({ 
    consent, 
    setConsent, 
    resetConsent, 
    hasAnalyticsConsent, 
    hasEssentialConsent 
  }), [consent, hasAnalyticsConsent, hasEssentialConsent]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}


