import { getGraphQLClient } from '@/lib/graphql/client';
import { requestWithEndpointFallback } from '@/lib/graphql/utils';
import { GET_STIRI, GET_STIRE_BY_ID } from '@/features/news/graphql/queries';
import type { GetStiriResponse, NewsItem } from '@/features/news/types';

export type FetchNewsParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};

export async function fetchLatestNews(params: FetchNewsParams = {}) {
  const { limit = 10, offset = 0, orderBy = 'publicationDate', orderDirection = 'desc' } = params;
  const limitClamped = Math.max(1, Math.min(100, limit));

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


