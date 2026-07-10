import type { NewsItem } from '@/features/news/types';
import { normalizeCategorySlug } from './normalizeCategorySlug';
import { MAX_URLS_PER_SITEMAP, type SitemapPartition } from './types';

/**
 * Groups news by normalized category slug and splits into chunks of at most 10 000 URLs.
 */
export function partitionNews(news: NewsItem[]): SitemapPartition[] {
  const byCategory = new Map<string, NewsItem[]>();

  for (const item of news) {
    const slug = normalizeCategorySlug(item.category ?? 'general');
    const bucket = byCategory.get(slug);
    if (bucket) {
      bucket.push(item);
    } else {
      byCategory.set(slug, [item]);
    }
  }

  const partitions: SitemapPartition[] = [];

  for (const [categorySlug, items] of byCategory) {
    for (let i = 0; i < items.length; i += MAX_URLS_PER_SITEMAP) {
      partitions.push({
        categorySlug,
        page: Math.floor(i / MAX_URLS_PER_SITEMAP) + 1,
        items: items.slice(i, i + MAX_URLS_PER_SITEMAP),
      });
    }
  }

  return partitions.sort(
    (a, b) => a.categorySlug.localeCompare(b.categorySlug) || a.page - b.page,
  );
}

export function findPartition(
  partitions: SitemapPartition[],
  categorySlug: string,
  page: number,
): SitemapPartition | undefined {
  return partitions.find((p) => p.categorySlug === categorySlug && p.page === page);
}
