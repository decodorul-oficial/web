import type { NewsItem } from '@/features/news/types';

export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

export type NewsSitemapEntry = SitemapUrlEntry & {
  news: {
    title: string;
    publicationDate: string;
    keywords?: string;
  };
};

export type SitemapIndexEntry = {
  loc: string;
  lastmod?: string;
};

export type SitemapPartition = {
  categorySlug: string;
  page: number;
  items: NewsItem[];
};

export const MAX_URLS_PER_SITEMAP = 10_000;

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
}
