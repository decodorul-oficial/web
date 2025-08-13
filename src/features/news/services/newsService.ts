import { getGraphQLClient } from '@/lib/graphql/client';
import { requestWithEndpointFallback } from '@/lib/graphql/utils';
import { GET_STIRI } from '@/features/news/graphql/queries';
import type { GetStiriResponse } from '@/features/news/types';

export type FetchNewsParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};

export async function fetchLatestNews(params: FetchNewsParams = {}) {
  const { limit = 10, offset = 0, orderBy = 'publication_date', orderDirection = 'desc' } = params;
  try {
    // Try direct client first (fast path)
    const client = getGraphQLClient();
    const data = await client.request<GetStiriResponse>(GET_STIRI, {
      limit,
      offset,
      orderBy,
      orderDirection
    });
    return data.getStiri;
  } catch (error) {
    console.error('fetchLatestNews failed', error);
    // Fallback: try alternate endpoint candidates
    try {
      const { data } = await requestWithEndpointFallback<GetStiriResponse>(
        GET_STIRI,
        { limit, offset, orderBy, orderDirection },
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
      );
      return data.getStiri;
    } catch (fallbackError) {
      console.error('fallback request failed', fallbackError);
      return {
        stiri: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 1 }
      };
    }
  }
}


