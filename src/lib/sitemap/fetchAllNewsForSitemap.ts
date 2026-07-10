import { gql } from 'graphql-request';
import type { NewsItem } from '@/features/news/types';
import { getSitemapGraphQLClient } from './sitemapGraphqlClient';

const PAGE_SIZE = 100;

const GET_STIRI_SITEMAP = gql`
  query GetStiriSitemap($limit: Int!, $offset: Int!, $orderBy: String!, $orderDirection: String!) {
    getStiri(limit: $limit, offset: $offset, orderBy: $orderBy, orderDirection: $orderDirection) {
      stiri {
        id
        title
        publicationDate
        category
      }
      pagination {
        totalCount
      }
    }
  }
`;

type SitemapStiriResponse = {
  getStiri: {
    stiri: Array<{
      id: string;
      title: string;
      publicationDate: string;
      category?: string | null;
    }>;
    pagination: { totalCount: number };
  };
};

/**
 * Fetches all news articles for sitemap generation via paginated getStiri (internal API key).
 */
export async function fetchAllNewsForSitemap(): Promise<NewsItem[]> {
  const client = getSitemapGraphQLClient();
  const all: NewsItem[] = [];
  let offset = 0;
  let totalCount = Number.POSITIVE_INFINITY;

  while (offset < totalCount) {
    const data = await client.request<SitemapStiriResponse>(GET_STIRI_SITEMAP, {
      limit: PAGE_SIZE,
      offset,
      orderBy: 'publicationDate',
      orderDirection: 'desc',
    });

    const { stiri, pagination } = data.getStiri;
    if (stiri.length === 0) break;

    for (const item of stiri) {
      all.push({
        id: item.id,
        title: item.title,
        publicationDate: item.publicationDate,
        category: item.category ?? undefined,
        content: {},
      } as NewsItem);
    }

    totalCount = pagination.totalCount;
    offset += stiri.length;
  }

  return all;
}
