import { getGraphQLClient } from '@/lib/graphql/client';
import { requestWithEndpointFallback } from '@/lib/graphql/utils';
import { 
  GET_STIRI, 
  GET_STIRE_BY_ID, 
  GET_MOST_READ_STIRI, 
  SEARCH_STIRI_BY_KEYWORDS,
  GET_DAILY_SYNTHESIS,
  GET_STIRI_BY_CATEGORY,
  GET_CATEGORIES,
  GET_STIRI_BY_CATEGORY_SLUG
} from '../graphql/queries';
import { 
  GetStiriResponse, 
  NewsItem, 
  MostReadStiriResponse, 
  MostReadStiriParams,
  SearchStiriByKeywordsResponse,
  SearchStiriByKeywordsParams,
  GetDailySynthesisResponse,
  GetDailySynthesisParams,
  GetStiriByCategoryResponse,
  GetCategoriesResponse,
  CategoryCount
} from '../types';
import { ensureSessionCookie } from '@/lib/utils/sessionCookie';

export type FetchNewsParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};

export async function fetchLatestNews(params: FetchNewsParams = {}) {
  const { limit = 10, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc' } = params;
  // Allow higher limits for archive and sitemap purposes
  const limitClamped = Math.max(1, Math.min(100, limit));

  // Asigură că cookie-ul mo_session este setat pentru analytics
  ensureSessionCookie();

  try {
    const client = getGraphQLClient();
    const data = await client.request<GetStiriResponse>(GET_STIRI, {
      limit: limitClamped,
      offset,
      orderBy,
      orderDirection
    });
    return data.getStiri;
  } catch (primaryError: unknown) {
    if (process.env.NODE_ENV !== 'production') console.debug('fetchLatestNews primary failed; retrying endpoint', primaryError);
    try {
      const { data } = await requestWithEndpointFallback<GetStiriResponse>(
        GET_STIRI,
        { limit: limitClamped, offset, orderBy, orderDirection },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.getStiri;
    } catch (fallbackError) {
      if (process.env.NODE_ENV !== 'production') console.debug('endpoint fallback failed', fallbackError);
      return {
        stiri: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1 }
      };
    }
  }
}

export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  // Asigură că cookie-ul mo_session este setat pentru analytics
  ensureSessionCookie();
  
  try {
    const client = getGraphQLClient();
    const data = await client.request<{ getStireById?: NewsItem }>(GET_STIRE_BY_ID, { id });
    if (data?.getStireById) return data.getStireById;
  } catch (error) {
    console.warn('fetchNewsById primary query failed, trying list fallback', error);
  }

  // Fallback: find by id from list endpoint
  try {
    const { stiri } = await fetchLatestNews({ limit: 100, offset: 0 });
    return stiri.find((s) => s.id === id) ?? null;
  } catch (error) {
    console.error('fetchNewsById fallback failed', error);
    return null;
  }
}

export async function fetchNewsByDate(date: string, excludeId?: string, limit: number = 5): Promise<NewsItem[]> {
  // Asigură că cookie-ul mo_session este setat pentru analytics
  ensureSessionCookie();
  
  try {
    // Interogăm direct API-ul pentru ziua respectivă (fără keywords)
    // Keywords poate fi listă goală conform noii implementări din API
    const needsExtra = excludeId ? 1 : 0;
    const { stiri } = await searchStiriByKeywords({
      keywords: [],
      limit: limit + needsExtra,
      offset: 0,
      orderBy: 'publicationDate',
      orderDirection: 'desc',
      publicationDateFrom: date,
      publicationDateTo: date
    });

    const filtered = excludeId ? stiri.filter((s) => s.id !== excludeId) : stiri;
    return filtered.slice(0, limit);
  } catch (error) {
    console.error('fetchNewsByDate failed', error);
    return [];
  }
}

// Updated function for most read news
export async function fetchMostReadStiri(params: MostReadStiriParams = {}) {
  const { limit = 10, period = '7d' } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));

  // Asigură că cookie-ul mo_session este setat pentru analytics
  ensureSessionCookie();

  try {
    const client = getGraphQLClient();
    const data = await client.request<MostReadStiriResponse>(GET_MOST_READ_STIRI, {
      limit: limitClamped,
      period
    });
    return data.getMostReadStiri;
  } catch (primaryError: unknown) {
    if (process.env.NODE_ENV !== 'production') console.debug('fetchMostReadStiri primary failed; retrying endpoint', primaryError);
    try {
      const { data } = await requestWithEndpointFallback<MostReadStiriResponse>(
        GET_MOST_READ_STIRI,
        { limit: limitClamped, period },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.getMostReadStiri;
    } catch (fallbackError) {
      if (process.env.NODE_ENV !== 'production') console.debug('endpoint fallback failed', fallbackError);
      return {
        stiri: []
      };
    }
  }
}

// Note: trackNewsView is no longer needed as it's handled automatically by the API
// when calling getStireById

// Enhanced function for searching news with fuzzy search, keywords, and date filters
export async function searchStiriByKeywords(params: SearchStiriByKeywordsParams) {
  const { query, keywords, limit = 20, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc', publicationDateFrom, publicationDateTo } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));

  // Asigură că cookie-ul mo_session este setat pentru analytics
  ensureSessionCookie();

  try {
    const client = getGraphQLClient({
      getAuthToken: () => (typeof window !== 'undefined' ? localStorage.getItem('DO_TOKEN') ?? undefined : undefined)
    });
    
    const data = await client.request<SearchStiriByKeywordsResponse>(SEARCH_STIRI_BY_KEYWORDS, {
      query,
      keywords,
      limit: limitClamped,
      offset,
      orderBy,
      orderDirection,
      publicationDateFrom,
      publicationDateTo
    });
    return data.searchStiriByKeywords;
  } catch (primaryError: unknown) {
    console.error('searchStiriByKeywords failed:', primaryError);
    
    // Try endpoint fallback with proper headers
    try {
      const { data } = await requestWithEndpointFallback<SearchStiriByKeywordsResponse>(
        SEARCH_STIRI_BY_KEYWORDS,
        { query, keywords, limit: limitClamped, offset, orderBy, orderDirection, publicationDateFrom, publicationDateTo },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.searchStiriByKeywords;
    } catch (fallbackError) {
      console.error('Endpoint fallback also failed:', fallbackError);
      return {
        stiri: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      };
    }
  }
}

export async function getDailySynthesis(params: GetDailySynthesisParams): Promise<GetDailySynthesisResponse> {
  try {
    const client = getGraphQLClient();
    const response = await client.request<GetDailySynthesisResponse>(
      GET_DAILY_SYNTHESIS,
      params
    );
    return response;
  } catch (error) {
    console.error('Error fetching daily synthesis:', error);
    throw error;
  }
}

// Fetch categories with counts
export async function fetchCategories(limit: number = 100): Promise<CategoryCount[]> {
  try {
    const client = getGraphQLClient();
    const data = await client.request<GetCategoriesResponse>(GET_CATEGORIES, { limit });
    return data.getCategories;
  } catch (primaryError: unknown) {
    console.error('fetchCategories failed:', primaryError);
    try {
      const { data } = await requestWithEndpointFallback<GetCategoriesResponse>(
        GET_CATEGORIES,
        { limit },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.getCategories;
    } catch (fallbackError) {
      console.error('Endpoint fallback also failed (fetchCategories):', fallbackError);
      return [];
    }
  }
}

// Fetch news by category with pagination
export async function fetchStiriByCategory(params: { category: string; limit?: number; offset?: number }): Promise<GetStiriByCategoryResponse['getStiriByCategory']> {
  const { category, limit = 20, offset = 0 } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));

  // Ensure session cookie for analytics
  ensureSessionCookie();

  try {
    const client = getGraphQLClient();
    const data = await client.request<GetStiriByCategoryResponse>(GET_STIRI_BY_CATEGORY, {
      category,
      limit: limitClamped,
      offset
    });
    return data.getStiriByCategory;
  } catch (primaryError: unknown) {
    console.error('fetchStiriByCategory failed:', primaryError);
    try {
      const { data } = await requestWithEndpointFallback<GetStiriByCategoryResponse>(
        GET_STIRI_BY_CATEGORY,
        { category, limit: limitClamped, offset },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.getStiriByCategory;
    } catch (fallbackError) {
      console.error('Endpoint fallback also failed (fetchStiriByCategory):', fallbackError);
      return {
        stiri: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      };
    }
  }
}

// Fetch news by category slug with pagination
export async function fetchStiriByCategorySlug(params: { slug: string; limit?: number; offset?: number }): Promise<GetStiriByCategoryResponse['getStiriByCategory']> {
  const { slug, limit = 20, offset = 0 } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));

  ensureSessionCookie();

  try {
    const client = getGraphQLClient();
    const data = await client.request<GetStiriByCategoryResponse>(GET_STIRI_BY_CATEGORY_SLUG, {
      slug,
      limit: limitClamped,
      offset
    });
    return (data as unknown as { getStiriByCategorySlug: GetStiriByCategoryResponse['getStiriByCategory'] }).getStiriByCategorySlug;
  } catch (primaryError: unknown) {
    console.error('fetchStiriByCategorySlug failed:', primaryError);
    try {
      const { data } = await requestWithEndpointFallback<GetStiriByCategoryResponse>(
        GET_STIRI_BY_CATEGORY_SLUG,
        { slug, limit: limitClamped, offset },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return (data as unknown as { getStiriByCategorySlug: GetStiriByCategoryResponse['getStiriByCategory'] }).getStiriByCategorySlug;
    } catch (fallbackError) {
      console.error('Endpoint fallback also failed (fetchStiriByCategorySlug):', fallbackError);
      return {
        stiri: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      };
    }
  }
}


