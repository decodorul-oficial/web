import { fetchAllNewsForSitemap } from './fetchAllNewsForSitemap';
import { partitionNews } from './partitionNews';
import { getBaseUrl, type SitemapIndexEntry } from './types';

export async function buildSitemapIndex(): Promise<SitemapIndexEntry[]> {
  const baseUrl = getBaseUrl();
  const lastmod = new Date().toISOString();

  // Category hubs (/categorii) are paywalled — do not list them in the sitemap
  // (avoids flooding GSC with Discovered-not-indexed URLs).
  const entries: SitemapIndexEntry[] = [
    { loc: `${baseUrl}/sitemaps/static.xml`, lastmod },
    { loc: `${baseUrl}/sitemaps/archive-hubs.xml`, lastmod },
    { loc: `${baseUrl}/sitemaps/news/recent.xml`, lastmod },
  ];

  const news = await fetchAllNewsForSitemap();
  const partitions = partitionNews(news);

  for (const partition of partitions) {
    entries.push({
      loc: `${baseUrl}/sitemaps/news/category/${partition.categorySlug}/${partition.page}.xml`,
      lastmod,
    });
  }

  return entries;
}
