import {
  getNewsletterTrackingData,
  incrementNewsViewed,
  isNewsAlreadyTracked,
  shouldShowNewsletterModal,
  markNewsletterSubscribed,
  isNewsletterSubscribed,
  resetNewsletterTracking,
  getNewsletterStats
} from '../newsletterTracking';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionCookie
jest.mock('../sessionCookie', () => ({
  getSessionCookie: jest.fn(() => 'test-session-id'),
  setSessionCookie: jest.fn(),
  removeSessionCookie: jest.fn(),
}));

describe('Newsletter Tracking', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('getNewsletterTrackingData', () => {
    it('should return default data when no stored data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getNewsletterTrackingData();
      
      expect(result).toEqual({
        newsViewed: 0,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: expect.any(Number)
      });
    });

    it('should return stored data when it exists', () => {
      const mockData = {
        newsViewed: 5,
        lastModalShown: 3,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const result = getNewsletterTrackingData();
      
      expect(result).toEqual(mockData);
    });
  });

  describe('isNewsAlreadyTracked', () => {
    it('should return true for already tracked news', () => {
      const data = {
        newsViewed: 2,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: Date.now(),
        lastViewedNews: 'news-123'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = isNewsAlreadyTracked('news-123');
      
      expect(result).toBe(true);
    });

    it('should return false for new news', () => {
      const data = {
        newsViewed: 2,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: Date.now(),
        lastViewedNews: 'news-456'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = isNewsAlreadyTracked('news-123');
      
      expect(result).toBe(false);
    });

    it('should return false when no news was tracked', () => {
      const data = {
        newsViewed: 0,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = isNewsAlreadyTracked('news-123');
      
      expect(result).toBe(false);
    });
  });

  describe('incrementNewsViewed', () => {
    it('should increment news viewed count for new news', () => {
      const initialData = {
        newsViewed: 2,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialData));
      
      const result = incrementNewsViewed('news-123');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'newsletter_tracking_test-session-id',
        JSON.stringify({
          ...initialData,
          newsViewed: 3,
          lastViewedNews: 'news-123'
        })
      );
    });

    it('should not increment for already tracked news', () => {
      const initialData = {
        newsViewed: 2,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: Date.now(),
        lastViewedNews: 'news-123'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialData));
      
      const result = incrementNewsViewed('news-123');
      
      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('shouldShowNewsletterModal', () => {
    it('should return false if user is subscribed', () => {
      const data = {
        newsViewed: 5,
        lastModalShown: 0,
        isSubscribed: true,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = shouldShowNewsletterModal();
      
      expect(result).toBe(false);
    });

    it('should return true at first interval (3 news)', () => {
      const data = {
        newsViewed: 3,
        lastModalShown: 0,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = shouldShowNewsletterModal();
      
      expect(result).toBe(true);
    });

    it('should return true at second interval (9 news)', () => {
      const data = {
        newsViewed: 9,
        lastModalShown: 3,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = shouldShowNewsletterModal();
      
      expect(result).toBe(true);
    });

    it('should return false if modal was already shown at current interval', () => {
      const data = {
        newsViewed: 9,
        lastModalShown: 9,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = shouldShowNewsletterModal();
      
      expect(result).toBe(false);
    });
  });

  describe('markNewsletterSubscribed', () => {
    it('should mark user as subscribed', () => {
      const initialData = {
        newsViewed: 5,
        lastModalShown: 3,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(initialData));
      
      markNewsletterSubscribed();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'newsletter_tracking_test-session-id',
        JSON.stringify({
          ...initialData,
          isSubscribed: true
        })
      );
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'newsletter_subscribed_test-session-id',
        'true'
      );
    });
  });

  describe('isNewsletterSubscribed', () => {
    it('should return true if user is subscribed in tracking data', () => {
      const data = {
        newsViewed: 5,
        lastModalShown: 3,
        isSubscribed: true,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = isNewsletterSubscribed();
      
      expect(result).toBe(true);
    });

    it('should return true if user is subscribed in localStorage', () => {
      const data = {
        newsViewed: 5,
        lastModalShown: 3,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(data))
        .mockReturnValueOnce('true');
      
      const result = isNewsletterSubscribed();
      
      expect(result).toBe(true);
    });

    it('should return false if user is not subscribed', () => {
      const data = {
        newsViewed: 5,
        lastModalShown: 3,
        isSubscribed: false,
        lastReset: Date.now()
      };
      
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(data))
        .mockReturnValueOnce(null);
      
      const result = isNewsletterSubscribed();
      
      expect(result).toBe(false);
    });
  });

  describe('resetNewsletterTracking', () => {
    it('should reset tracking data', () => {
      resetNewsletterTracking();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'newsletter_tracking_test-session-id'
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'newsletter_subscribed_test-session-id'
      );
    });
  });

  describe('getNewsletterStats', () => {
    it('should return newsletter statistics', () => {
      const data = {
        newsViewed: 7,
        lastModalShown: 6,
        isSubscribed: false,
        lastReset: Date.now(),
        lastViewedNews: 'news-789'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const result = getNewsletterStats();
      
      expect(result).toEqual({
        newsViewed: 7,
        isSubscribed: false,
        lastModalShown: 6,
        lastViewedNews: 'news-789'
      });
    });
  });
});
