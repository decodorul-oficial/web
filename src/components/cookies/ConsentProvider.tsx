"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ConsentCategories = {
  essential: true; // always true
  analytics: boolean;
};

type ConsentContextValue = {
  consent: ConsentCategories | null; // null = not decided
  setConsent: (c: ConsentCategories) => void;
  resetConsent: () => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

const STORAGE_KEY = 'cookie-consent.v1';

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentCategories | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConsentState(JSON.parse(raw));
    } catch {}
  }, []);

  const setConsent = (c: ConsentCategories) => {
    setConsentState(c);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    } catch {}
  };

  const resetConsent = () => {
    setConsentState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const value = useMemo(() => ({ consent, setConsent, resetConsent }), [consent]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}


