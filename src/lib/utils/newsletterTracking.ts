import { getSessionCookie } from './sessionCookie';

const NEWSLETTER_TRACKING_KEY = 'newsletter_tracking';
const NEWSLETTER_SUBSCRIPTION_KEY = 'newsletter_subscribed';

interface NewsletterTrackingData {
  newsViewed: number;
  lastModalShown: number;
  isSubscribed: boolean;
  lastReset: number;
  lastViewedNews?: string; // ID-ul ultimei știri vizualizate
}

interface NewsletterIntervals {
  first: number;
  second: number;
  third: number;
}

const DEFAULT_INTERVALS: NewsletterIntervals = {
  first: 3,   // Prima afișare după 3 știri
  second: 9,  // A doua afișare după 9 știri
  third: 18   // A treia afișare după 18 știri
};

/**
 * Obține datele de tracking pentru newsletter din localStorage
 */
export function getNewsletterTrackingData(): NewsletterTrackingData {
  if (typeof window === 'undefined') {
    return {
      newsViewed: 0,
      lastModalShown: 0,
      isSubscribed: false,
      lastReset: Date.now()
    };
  }

  try {
    const sessionId = getSessionCookie();
    const key = `${NEWSLETTER_TRACKING_KEY}_${sessionId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to get newsletter tracking data:', error);
  }

  return {
    newsViewed: 0,
    lastModalShown: 0,
    isSubscribed: false,
    lastReset: Date.now()
  };
}

/**
 * Salvează datele de tracking pentru newsletter în localStorage
 */
export function saveNewsletterTrackingData(data: NewsletterTrackingData): void {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getSessionCookie();
    const key = `${NEWSLETTER_TRACKING_KEY}_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save newsletter tracking data:', error);
  }
}

/**
 * Verifică dacă o știre a fost deja trackată
 */
export function isNewsAlreadyTracked(newsId: string): boolean {
  const data = getNewsletterTrackingData();
  return data.lastViewedNews === newsId;
}

/**
 * Incrementează numărul de știri vizualizate (doar dacă știrea nu a fost deja trackată)
 */
export function incrementNewsViewed(newsId: string): boolean {
  // Verifică dacă știrea a fost deja trackată
  if (isNewsAlreadyTracked(newsId)) {
    return false; // Știrea a fost deja trackată
  }

  const data = getNewsletterTrackingData();
  data.newsViewed += 1;
  data.lastViewedNews = newsId; // Marchează știrea ca fiind trackată
  saveNewsletterTrackingData(data);
  
  return true; // Știrea a fost trackată cu succes
}

/**
 * Verifică dacă trebuie afișat modal-ul newsletter
 */
export function shouldShowNewsletterModal(intervals: NewsletterIntervals = DEFAULT_INTERVALS): boolean {
  const data = getNewsletterTrackingData();
  
  // Nu afișa dacă utilizatorul este deja abonat
  if (data.isSubscribed) {
    return false;
  }

  const { newsViewed, lastModalShown } = data;
  
  // Verifică dacă a trecut suficient timp de la ultima afișare (minim 24 ore)
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 ore în milisecunde
  
  if (now - lastModalShown < oneDay) {
    return false;
  }

  // Verifică intervalele
  if (newsViewed >= intervals.first && lastModalShown < intervals.first) {
    return true;
  }
  
  if (newsViewed >= intervals.second && lastModalShown < intervals.second) {
    return true;
  }
  
  if (newsViewed >= intervals.third && lastModalShown < intervals.third) {
    return true;
  }

  return false;
}

/**
 * Marchează modal-ul newsletter ca fiind afișat
 */
export function markNewsletterModalShown(): void {
  const data = getNewsletterTrackingData();
  data.lastModalShown = data.newsViewed;
  saveNewsletterTrackingData(data);
}

/**
 * Marchează utilizatorul ca fiind abonat la newsletter
 */
export function markNewsletterSubscribed(): void {
  const data = getNewsletterTrackingData();
  data.isSubscribed = true;
  saveNewsletterTrackingData(data);
  
  // Salvează și în localStorage pentru persistență
  if (typeof window !== 'undefined') {
    try {
      const sessionId = getSessionCookie();
      const key = `${NEWSLETTER_SUBSCRIPTION_KEY}_${sessionId}`;
      localStorage.setItem(key, 'true');
    } catch (error) {
      console.warn('Failed to save newsletter subscription:', error);
    }
  }
}

/**
 * Verifică dacă utilizatorul este abonat la newsletter
 */
export function isNewsletterSubscribed(): boolean {
  const data = getNewsletterTrackingData();
  
  if (data.isSubscribed) {
    return true;
  }

  // Verifică și în localStorage pentru redundanță
  if (typeof window !== 'undefined') {
    try {
    const sessionId = getSessionCookie();
    const key = `${NEWSLETTER_SUBSCRIPTION_KEY}_${sessionId}`;
    return localStorage.getItem(key) === 'true';
  } catch (error) {
    console.warn('Failed to check newsletter subscription:', error);
  }
  }

  return false;
}

/**
 * Resetează tracking-ul newsletter (pentru dezabonare)
 */
export function resetNewsletterTracking(): void {
  const data = getNewsletterTrackingData();
  data.isSubscribed = false;
  data.lastModalShown = 0;
  data.lastViewedNews = undefined;
  saveNewsletterTrackingData(data);
  
  // Elimină și din localStorage
  if (typeof window !== 'undefined') {
    try {
      const sessionId = getSessionCookie();
      const trackingKey = `${NEWSLETTER_TRACKING_KEY}_${sessionId}`;
      const subscriptionKey = `${NEWSLETTER_SUBSCRIPTION_KEY}_${sessionId}`;
      localStorage.removeItem(trackingKey);
      localStorage.removeItem(subscriptionKey);
    } catch (error) {
      console.warn('Failed to reset newsletter tracking:', error);
    }
  }
}

/**
 * Obține statistici despre tracking-ul newsletter
 */
export function getNewsletterStats(): {
  newsViewed: number;
  isSubscribed: boolean;
  lastModalShown: number;
  lastViewedNews?: string;
} {
  const data = getNewsletterTrackingData();
  return {
    newsViewed: data.newsViewed,
    isSubscribed: data.isSubscribed,
    lastModalShown: data.lastModalShown,
    lastViewedNews: data.lastViewedNews
  };
}
