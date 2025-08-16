import { generateSessionId, hasSessionCookie, getSessionCookie, ensureSessionCookie } from '../sessionCookie';

// Mock pentru document.cookie
const mockCookie = {
  value: '',
  set: (val: string) => {
    mockCookie.value = val;
  },
  get: () => mockCookie.value,
  clear: () => {
    mockCookie.value = '';
  }
};

// Mock pentru document
Object.defineProperty(document, 'cookie', {
  get: () => mockCookie.get(),
  set: (val: string) => mockCookie.set(val),
  configurable: true
});

describe('sessionCookie', () => {
  beforeEach(() => {
    mockCookie.clear();
  });

  describe('generateSessionId', () => {
    it('should generate a valid UUID v4', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('hasSessionCookie', () => {
    it('should return false when no cookie exists', () => {
      expect(hasSessionCookie()).toBe(false);
    });

    it('should return true when cookie exists', () => {
      document.cookie = 'mo_session=test-uuid; path=/';
      expect(hasSessionCookie()).toBe(true);
    });

    it('should return false for other cookies', () => {
      document.cookie = 'other_cookie=value; path=/';
      expect(hasSessionCookie()).toBe(false);
    });
  });

  describe('getSessionCookie', () => {
    it('should return null when no cookie exists', () => {
      expect(getSessionCookie()).toBe(null);
    });

    it('should return cookie value when exists', () => {
      const testUuid = 'test-uuid-123';
      document.cookie = `mo_session=${testUuid}; path=/`;
      expect(getSessionCookie()).toBe(testUuid);
    });

    it('should handle multiple cookies', () => {
      document.cookie = 'other_cookie=value; path=/';
      document.cookie = 'mo_session=test-uuid; path=/';
      expect(getSessionCookie()).toBe('test-uuid');
    });
  });

  describe('ensureSessionCookie', () => {
    it('should set cookie when none exists', () => {
      expect(hasSessionCookie()).toBe(false);
      ensureSessionCookie();
      expect(hasSessionCookie()).toBe(true);
      expect(getSessionCookie()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should not change existing cookie', () => {
      const existingUuid = 'existing-uuid-123';
      document.cookie = `mo_session=${existingUuid}; path=/`;
      ensureSessionCookie();
      expect(getSessionCookie()).toBe(existingUuid);
    });

    it('should set cookie with correct attributes', () => {
      ensureSessionCookie();
      const cookieValue = document.cookie;
      expect(cookieValue).toContain('mo_session=');
      expect(cookieValue).toContain('path=/');
      expect(cookieValue).toContain('secure');
      expect(cookieValue).toContain('samesite=lax');
    });
  });
});
