import { slugify, createNewsSlug, extractIdFromSlug, isValidNewsSlug } from '../slugify';

describe('slugify', () => {
  test('should convert title to lowercase slug', () => {
    expect(slugify('O nouă lege pentru educație')).toBe('o-noua-lege-pentru-educatie');
  });

  test('should handle Romanian diacritics', () => {
    expect(slugify('Știri despre învățământ')).toBe('stiri-despre-invatamant');
  });

  test('should remove special characters', () => {
    expect(slugify('Legea nr. 123/2024!')).toBe('legea-nr-123-2024');
  });

  test('should handle multiple spaces and hyphens', () => {
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  test('should limit length', () => {
    const longTitle = 'A'.repeat(100);
    expect(slugify(longTitle, 20).length).toBeLessThanOrEqual(20);
  });

  test('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('createNewsSlug', () => {
  test('should create slug with ID', () => {
    expect(createNewsSlug('O nouă lege', '123')).toBe('o-noua-lege-123');
  });

  test('should handle long titles', () => {
    const longTitle = 'A'.repeat(100);
    const slug = createNewsSlug(longTitle, '456', 30);
    expect(slug).toMatch(/^[a-z0-9-]+-456$/);
    expect(slug.length).toBeLessThanOrEqual(33); // 30 + 3 for "-456"
  });
});

describe('extractIdFromSlug', () => {
  test('should extract ID from valid slug', () => {
    expect(extractIdFromSlug('o-noua-lege-123')).toBe('123');
  });

  test('should return null for invalid slug', () => {
    expect(extractIdFromSlug('invalid-slug')).toBe(null);
  });

  test('should handle empty string', () => {
    expect(extractIdFromSlug('')).toBe(null);
  });
});

describe('isValidNewsSlug', () => {
  test('should validate correct slug format', () => {
    expect(isValidNewsSlug('o-noua-lege-123')).toBe(true);
    expect(isValidNewsSlug('stiri-456')).toBe(true);
  });

  test('should reject invalid formats', () => {
    expect(isValidNewsSlug('invalid-slug')).toBe(false);
    expect(isValidNewsSlug('123-slug')).toBe(false);
    expect(isValidNewsSlug('slug-')).toBe(false);
    expect(isValidNewsSlug('')).toBe(false);
  });
});
