'use client';

import { useCallback } from 'react';
import { useConsent } from '../../../components/cookies/ConsentProvider';
import { useNewsletterContext } from '../../../components/newsletter/NewsletterProvider';
import { 
  incrementNewsViewed, 
  shouldShowNewsletterModal, 
  markNewsletterModalShown,
  isNewsletterSubscribed 
} from '../../../lib/utils/newsletterTracking';

interface UseNewsletterTrackingOptions {
  enabled?: boolean;
  intervals?: {
    first: number;
    second: number;
    third: number;
  };
}

/**
 * Hook pentru tracking-ul newsletter-ului pe termen lung
 * Monitorizează știrile vizualizate și afișează modal-ul la intervale specifice
 */
export function useNewsletterTracking(options: UseNewsletterTrackingOptions = {}) {
  const { enabled = true, intervals } = options;
  const { hasAnalyticsConsent } = useConsent();
  const { showNewsletterModal } = useNewsletterContext();

  // Funcție pentru incrementarea știrilor vizualizate
  const trackNewsView = useCallback((newsId: string) => {
    if (!enabled || !hasAnalyticsConsent) return;

    // Verifică dacă utilizatorul este deja abonat
    if (isNewsletterSubscribed()) {
      return;
    }

    // Incrementează numărul de știri vizualizate (doar dacă știrea nu a fost deja trackată)
    const wasTracked = incrementNewsViewed(newsId);
    
    // Dacă știrea a fost deja trackată, nu face nimic
    if (!wasTracked) {
      return;
    }

    // Verifică dacă trebuie afișat modal-ul
    if (shouldShowNewsletterModal(intervals)) {
      // Marchează modal-ul ca fiind afișat
      markNewsletterModalShown();
      
      // Afișează modal-ul cu o mică întârziere pentru UX
      setTimeout(() => {
        showNewsletterModal();
      }, 1000); // 1 secundă întârziere
    }
  }, [enabled, hasAnalyticsConsent, intervals, showNewsletterModal]);

  return {
    trackNewsView,
    isSubscribed: isNewsletterSubscribed()
  };
}
