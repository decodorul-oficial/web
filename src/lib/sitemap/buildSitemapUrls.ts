import { createNewsSlug } from '@/lib/utils/slugify';
import { getBaseUrl, type SitemapUrlEntry } from './types';

export function buildStaticSitemapUrls(): SitemapUrlEntry[] {
  const baseUrl = getBaseUrl();
  const lastmod = new Date().toISOString();

  return [
    { loc: baseUrl, lastmod, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseUrl}/sinteza-zilnica`, lastmod, changefreq: 'daily', priority: 0.9 },
    { loc: `${baseUrl}/arhiva`, lastmod, changefreq: 'daily', priority: 0.8 },
    { loc: `${baseUrl}/contact`, lastmod, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseUrl}/legal`, lastmod, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/privacy`, lastmod, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/cookies`, lastmod, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/preturi`, lastmod, changefreq: 'monthly', priority: 0.8 },
  ];
}

export function buildArchiveHubsSitemapUrls(
  publicationDates: string[],
): SitemapUrlEntry[] {
  const baseUrl = getBaseUrl();
  const lastmod = new Date().toISOString();
  const years = new Set(
    publicationDates.map((date) => new Date(date).getFullYear()),
  );

  return Array.from(years)
    .sort((a, b) => b - a)
    .map((year) => ({
      loc: `${baseUrl}/arhiva/${year}`,
      lastmod,
      changefreq: 'monthly',
      priority: 0.7,
    }));
}

export function buildCategoryHubsSitemapUrls(
  categories: Array<{ slug: string; count: number }>,
): SitemapUrlEntry[] {
  const baseUrl = getBaseUrl();
  const lastmod = new Date().toISOString();
  const perPage = 20;
  const urls: SitemapUrlEntry[] = [
    {
      loc: `${baseUrl}/categorii`,
      lastmod,
      changefreq: 'daily',
      priority: 0.7,
    },
  ];

  for (const category of categories) {
    const urlBase = `${baseUrl}/categorii/${category.slug}`;
    const totalPages = Math.max(1, Math.ceil(category.count / perPage));

    for (let page = 1; page <= totalPages; page++) {
      urls.push({
        loc: page === 1 ? urlBase : `${urlBase}?page=${page}`,
        lastmod,
        changefreq: 'daily',
        priority: page === 1 ? 0.8 : 0.6,
      });
    }
  }

  return urls;
}

export function buildNewsArticleUrls(
  items: Array<{ id: string; title: string; publicationDate: string }>,
): SitemapUrlEntry[] {
  const baseUrl = getBaseUrl();
  const now = new Date();

  return items.map((news) => {
    const publicationDate = new Date(news.publicationDate);
    const daysSincePublication = Math.floor(
      (now.getTime() - publicationDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let priority = 0.8;
    if (daysSincePublication <= 7) priority = 0.9;
    else if (daysSincePublication <= 30) priority = 0.85;
    else if (daysSincePublication > 90) priority = 0.7;

    let changefreq: SitemapUrlEntry['changefreq'] = 'weekly';
    if (daysSincePublication <= 7) changefreq = 'daily';
    else if (daysSincePublication > 30) changefreq = 'monthly';

    return {
      loc: `${baseUrl}/stiri/${createNewsSlug(news.title, news.id)}`,
      lastmod: publicationDate.toISOString(),
      changefreq,
      priority,
    };
  });
}
