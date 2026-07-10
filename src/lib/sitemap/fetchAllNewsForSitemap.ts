import { fetchLatestNews } from '@/features/news/services/newsService';
import type { NewsItem } from '@/features/news/types';

const PAGE_SIZE = 100;

/**
 * Fetches all news articles for sitemap generation via paginated getStiri calls.
 */
export async function fetchAllNewsForSitemap(): Promise<NewsItem[]> {
  const all: NewsItem[] = [];
  let offset = 0;
  let totalCount = Number.POSITIVE_INFINITY;

  while (offset < totalCount) {
    const { stiri, pagination } = await fetchLatestNews({
      limit: PAGE_SIZE,
      offset,
      orderBy: 'publicationDate',
      orderDirection: 'desc',
      useInternalKey: true,
    });

    if (stiri.length === 0) break;

    all.push(...stiri);
    totalCount = pagination.totalCount;
    offset += stiri.length;
  }

  return all;
}
