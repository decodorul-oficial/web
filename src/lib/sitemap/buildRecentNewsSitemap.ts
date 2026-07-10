import { gql } from 'graphql-request';
import { createNewsSlug } from '@/lib/utils/slugify';
import { getSitemapGraphQLClient } from './sitemapGraphqlClient';
import { getBaseUrl, type NewsSitemapEntry } from './types';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

const GET_RECENT_STIRI_SITEMAP = gql`
  query GetRecentStiriSitemap($limit: Int!, $offset: Int!) {
    getStiri(limit: $limit, offset: $offset, orderBy: "publicationDate", orderDirection: "desc") {
      stiri {
        id
        title
        publicationDate
      }
    }
  }
`;

export async function buildRecentNewsSitemapEntries(): Promise<NewsSitemapEntry[]> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const cutoff = new Date(now.getTime() - FORTY_EIGHT_HOURS_MS);
  const client = getSitemapGraphQLClient();

  const data = await client.request<{
    getStiri: { stiri: Array<{ id: string; title: string; publicationDate: string }> };
  }>(GET_RECENT_STIRI_SITEMAP, { limit: 100, offset: 0 });

  return data.getStiri.stiri
    .filter((news) => new Date(news.publicationDate) >= cutoff)
    .map((news) => {
      const publicationDate = new Date(news.publicationDate).toISOString();
      return {
        loc: `${baseUrl}/stiri/${createNewsSlug(news.title, news.id)}`,
        lastmod: publicationDate,
        changefreq: 'hourly',
        priority: 1.0,
        news: {
          title: news.title,
          publicationDate,
        },
      };
    });
}
