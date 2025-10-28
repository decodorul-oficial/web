import { SearchParams } from '@/features/saved-searches/types';

/**
 * Compares two SearchParams objects, excluding pagination-related parameters
 * @param params1 First search parameters
 * @param params2 Second search parameters
 * @returns true if the search parameters are equivalent (excluding pagination)
 */
export function compareSearchParams(params1: SearchParams, params2: SearchParams): boolean {
  // Normalize parameters by removing undefined values and sorting arrays
  const normalizeParams = (params: SearchParams): SearchParams => {
    const normalized: SearchParams = {};
    
    if (params.query) normalized.query = params.query.trim();
    if (params.keywords && params.keywords.length > 0) {
      normalized.keywords = params.keywords
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .sort();
    }
    if (params.publicationDateFrom) normalized.publicationDateFrom = params.publicationDateFrom;
    if (params.publicationDateTo) normalized.publicationDateTo = params.publicationDateTo;
    if (params.orderBy && params.orderBy !== 'publicationDate') normalized.orderBy = params.orderBy;
    if (params.orderDirection && params.orderDirection !== 'desc') normalized.orderDirection = params.orderDirection;
    
    return normalized;
  };

  const normalized1 = normalizeParams(params1);
  const normalized2 = normalizeParams(params2);

  // Compare query
  if (normalized1.query !== normalized2.query) return false;

  // Compare keywords arrays
  const keywords1 = normalized1.keywords || [];
  const keywords2 = normalized2.keywords || [];
  if (keywords1.length !== keywords2.length) return false;
  for (let i = 0; i < keywords1.length; i++) {
    if (keywords1[i] !== keywords2[i]) return false;
  }

  // Compare date filters
  if (normalized1.publicationDateFrom !== normalized2.publicationDateFrom) return false;
  if (normalized1.publicationDateTo !== normalized2.publicationDateTo) return false;

  // Compare sorting
  if (normalized1.orderBy !== normalized2.orderBy) return false;
  if (normalized1.orderDirection !== normalized2.orderDirection) return false;

  return true;
}

/**
 * Checks if search parameters have any meaningful content (not just empty/default values)
 * @param params Search parameters to check
 * @returns true if the search has meaningful parameters
 */
export function hasSearchContent(params: SearchParams): boolean {
  return !!(
    (params.query && params.query.trim()) ||
    (params.keywords && params.keywords.length > 0) ||
    params.publicationDateFrom ||
    params.publicationDateTo
  );
}

/**
 * Creates a normalized version of search parameters for comparison
 * @param params Search parameters to normalize
 * @returns Normalized search parameters
 */
export function normalizeSearchParams(params: SearchParams): SearchParams {
  const normalized: SearchParams = {};
  
  if (params.query && params.query.trim()) {
    normalized.query = params.query.trim();
  }
  
  if (params.keywords && params.keywords.length > 0) {
    normalized.keywords = params.keywords
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .sort();
  }
  
  if (params.publicationDateFrom) {
    normalized.publicationDateFrom = params.publicationDateFrom;
  }
  
  if (params.publicationDateTo) {
    normalized.publicationDateTo = params.publicationDateTo;
  }
  
  if (params.orderBy && params.orderBy !== 'publicationDate') {
    normalized.orderBy = params.orderBy;
  }
  
  if (params.orderDirection && params.orderDirection !== 'desc') {
    normalized.orderDirection = params.orderDirection;
  }
  
  return normalized;
}
