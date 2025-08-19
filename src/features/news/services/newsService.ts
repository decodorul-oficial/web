import { getGraphQLClient } from '@/lib/graphql/client';
import { requestWithEndpointFallback } from '@/lib/graphql/utils';
import { GET_STIRI, GET_STIRE_BY_ID, GET_MOST_READ_STIRI, SEARCH_STIRI_BY_KEYWORDS } from '@/features/news/graphql/queries';
import type { GetStiriResponse, NewsItem, MostReadStiriResponse, MostReadStiriParams, SearchStiriByKeywordsResponse, SearchStiriByKeywordsParams } from '@/features/news/types';
import { ensureSessionCookie } from '@/lib/utils/sessionCookie';

export type FetchNewsParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};

export async function fetchLatestNews(params: FetchNewsParams = {}) {
  const { limit = 10, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc' } = params;
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
  } catch (primaryError: any) {
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
    const client = getGraphQLClient();
    // Obținem toate știrile și le filtrăm pe client pentru a găsi cele din aceeași zi
    // Optimizat pentru a fi mai rapid
    const { stiri } = await fetchLatestNews({ limit: 100, offset: 0, orderBy: 'id', orderDirection: 'desc' });
    
    // Filtrăm știrile din aceeași zi, excluzând știrea curentă
    const targetDate = new Date(date);
    const sameDayNews = stiri.filter(stire => {
      const stireDate = new Date(stire.publicationDate);
      const isSameDay = stireDate.toDateString() === targetDate.toDateString();
      const isNotCurrent = stire.id !== excludeId;
      return isSameDay && isNotCurrent;
    });
    
    // Returnăm primele 5 știri
    return sameDayNews.slice(0, limit);
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
  } catch (primaryError: any) {
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

// New function for searching news by keywords
export async function searchStiriByKeywords(params: SearchStiriByKeywordsParams) {
  const { keywords, limit = 20, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc', publicationDateFrom, publicationDateTo } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));

  // Asigură că cookie-ul mo_session este setat pentru analytics
  ensureSessionCookie();

  try {
    const client = getGraphQLClient();
    const data = await client.request<SearchStiriByKeywordsResponse>(SEARCH_STIRI_BY_KEYWORDS, {
      keywords,
      limit: limitClamped,
      offset,
      orderBy,
      orderDirection,
      publicationDateFrom,
      publicationDateTo
    });
    return data.searchStiriByKeywords;
  } catch (primaryError: any) {
    if (process.env.NODE_ENV !== 'production') console.debug('searchStiriByKeywords primary failed; retrying endpoint', primaryError);
    try {
      const { data } = await requestWithEndpointFallback<SearchStiriByKeywordsResponse>(
        SEARCH_STIRI_BY_KEYWORDS,
        { keywords, limit: limitClamped, offset, orderBy, orderDirection, publicationDateFrom, publicationDateTo },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.searchStiriByKeywords;
    } catch (fallbackError) {
      if (process.env.NODE_ENV !== 'production') console.debug('endpoint fallback failed', fallbackError);
      return {
        stiri: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      };
    }
  }
}


