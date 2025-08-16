/**
 * Converts a title to a URL-friendly slug
 * Supports Romanian diacritics and handles edge cases
 * Optimizat pentru a fi mai rapid
 */
export function slugify(title: string, maxLength: number = 60): string {
  if (!title) return '';
  
  // Normalize Romanian diacritics
  const diacriticsMap: Record<string, string> = {
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
  };
  
  let slug = title
    // Replace Romanian diacritics
    .replace(/[ăâîșțĂÂÎȘȚ]/g, (char) => diacriticsMap[char] || char)
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, maxLength)
    // Remove trailing hyphens after truncation
    .replace(/-+$/, '');
  
  return slug;
}

/**
 * Creates a full slug with ID for uniqueness
 * Optimizat pentru a fi mai rapid
 */
export function createNewsSlug(title: string, id: string, maxSlugLength: number = 60): string {
  const baseSlug = slugify(title, maxSlugLength);
  return `${baseSlug}-${id}`;
}

/**
 * Extracts ID from a slug
 * Optimizat pentru a fi mai rapid
 */
export function extractIdFromSlug(slug: string): string | null {
  const match = slug.match(/-(\d+)$/);
  return match ? match[1] : null;
}

/**
 * Checks if a slug is valid (contains ID at the end)
 * Optimizat pentru a fi mai rapid
 */
export function isValidNewsSlug(slug: string): boolean {
  return /^[a-z0-9-]+-\d+$/.test(slug);
}
