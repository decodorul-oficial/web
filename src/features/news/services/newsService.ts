import { getGraphQLClient } from '@/lib/graphql/client';
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
  const client = getGraphQLClient();
  const data = await client.request<GetStiriResponse>(GET_STIRI, {
    limit,
    offset,
    orderBy,
    orderDirection
  });
  return data.getStiri;
}


