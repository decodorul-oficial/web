import { fetchLatestNews } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';
import { getBaseUrl, type NewsSitemapEntry } from './types';

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export async function buildRecentNewsSitemapEntries(): Promise<NewsSitemapEntry[]> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const cutoff = new Date(now.getTime() - FORTY_EIGHT_HOURS_MS);

  let { stiri } = await fetchLatestNews({
    limit: 100,
    orderBy: 'publicationDate',
    orderDirection: 'desc',
    useInternalKey: true,
  });

  if (stiri.length === 0) {
    const fallback = await fetchLatestNews({
      limit: 10,
      orderBy: 'publicationDate',
      orderDirection: 'desc',
      useInternalKey: false,
    });
    stiri = fallback.stiri;
  }

  return stiri
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
