import { MetadataRoute } from 'next';
import { fetchLatestNews, fetchCategories } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  const currentDate = new Date();
  
  // Static pages with enhanced metadata
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sinteza-zilnica`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arhiva`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/preturi`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  try {
    // Fetch all news (with a reasonable limit for sitemap)
    const { stiri } = await fetchLatestNews({ limit: 100, orderBy: 'publicationDate', orderDirection: 'desc' });
    
    const newsPages = stiri.map((news) => {
      const publicationDate = new Date(news.publicationDate);
      const daysSincePublication = Math.floor((currentDate.getTime() - publicationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Adjust priority based on recency
      let priority = 0.8;
      if (daysSincePublication <= 7) priority = 0.9;
      else if (daysSincePublication <= 30) priority = 0.85;
      else if (daysSincePublication <= 90) priority = 0.8;
      else priority = 0.7;
      
      // Adjust change frequency based on recency
      let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly';
      if (daysSincePublication <= 7) changeFrequency = 'daily';
      else if (daysSincePublication <= 30) changeFrequency = 'weekly';
      else changeFrequency = 'monthly';
      
      return {
        url: `${baseUrl}/stiri/${createNewsSlug(news.title, news.id)}`,
        lastModified: publicationDate,
        changeFrequency,
        priority,
      };
    });

    // Generate year archive pages
    const yearArchivePages = [];
    const years = new Set(stiri.map(news => new Date(news.publicationDate).getFullYear()));
    
    for (const year of years) {
      yearArchivePages.push({
        url: `${baseUrl}/arhiva/${year}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }

    // Categories root and top pages
    const cats = await fetchCategories(100);
    const categoryPages: MetadataRoute.Sitemap = cats.flatMap((c) => {
      const slug = c.slug;
      const urlBase = `${baseUrl}/categorii/${slug}`;
      const total = c.count;
      const perPage = 20;
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      // Only include first 5 pages to keep sitemap light
      const maxPages = Math.min(totalPages, 5);
      const pages: MetadataRoute.Sitemap = [];
      for (let p = 1; p <= maxPages; p++) {
        pages.push({
          url: p === 1 ? urlBase : `${urlBase}?page=${p}`,
          lastModified: currentDate,
          changeFrequency: 'daily',
          priority: p === 1 ? 0.8 : 0.6,
        });
      }
      return pages;
    });

    // Include categories root
    const categoriesRoot = [{
      url: `${baseUrl}/categorii`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }];

    return [...staticPages, ...categoriesRoot, ...yearArchivePages, ...categoryPages, ...newsPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages if news fetch fails
    return staticPages;
  }
}
