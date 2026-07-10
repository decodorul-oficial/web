import { slugify } from '@/lib/utils/slugify';

/**
 * Normalizes a category name or slug so diacritic variants map to the same slug
 * (e.g. "justiție" and "justitie" → "justitie").
 */
export function normalizeCategorySlug(category: string): string {
  const normalized = slugify(category, 80);
  return normalized || 'general';
}
