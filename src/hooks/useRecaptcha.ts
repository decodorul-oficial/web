'use client';

import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface UseRecaptchaOptions {
  siteKey: string;
  action?: string;
}

interface UseRecaptchaReturn {
  executeRecaptcha: (action?: string) => Promise<string | null>;
  isLoaded: boolean;
  isExecuting: boolean;
  error: string | null;
}

export function useRecaptcha({ siteKey, action = 'submit' }: UseRecaptchaOptions): UseRecaptchaReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = () => {
        if (window.grecaptcha) {
          setIsLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true);
          setError(null);
        });
      }
    };
    
    script.onerror = () => {
      setError('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const scriptElement = document.querySelector(`script[src*="recaptcha"]`);
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [siteKey]);

  const executeRecaptcha = useCallback(async (customAction?: string): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha) {
      setError('reCAPTCHA not loaded');
      return null;
    }

    setIsExecuting(true);
    setError(null);

    try {
      const token = await window.grecaptcha.execute(siteKey, {
        action: customAction || action
      });
      
      setIsExecuting(false);
      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute reCAPTCHA';
      setError(errorMessage);
      setIsExecuting(false);
      return null;
    }
  }, [isLoaded, siteKey, action]);

  return {
    executeRecaptcha,
    isLoaded,
    isExecuting,
    error
  };
}
