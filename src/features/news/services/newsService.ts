import { getGraphQLClient } from '@/lib/graphql/client';
import { requestWithEndpointFallback } from '@/lib/graphql/utils';
import { GET_STIRI, GET_STIRE_BY_ID } from '@/features/news/graphql/queries';
import type { GetStiriResponse, NewsItem } from '@/features/news/types';

export type FetchNewsParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc' | 'ASC' | 'DESC';
};

export async function fetchLatestNews(params: FetchNewsParams = {}) {
  const { limit = 10, offset = 0 } = params;

  const orderCandidates = [
    params.orderBy,
    'publicationDate',
    'publication_date',
    'id',
    'createdAt'
  ].filter(Boolean) as string[];

  const directionCandidates = [params.orderDirection, 'desc', 'DESC'].filter(Boolean) as Array<'asc' | 'desc' | 'ASC' | 'DESC'>;

  const client = getGraphQLClient();

  for (const ob of orderCandidates) {
    for (const od of directionCandidates) {
      try {
        const data = await client.request<GetStiriResponse>(GET_STIRI, {
          limit,
          offset,
          orderBy: ob,
          orderDirection: od
        });
        return data.getStiri;
      } catch (attemptError) {
        // try next combo
      }
    }
  }

  // Fallback: try endpoint alternatives too
  try {
    const { data } = await requestWithEndpointFallback<GetStiriResponse>(
      GET_STIRI,
      { limit, offset, orderBy: orderCandidates[0] ?? 'id', orderDirection: directionCandidates[0] ?? 'desc' },
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


