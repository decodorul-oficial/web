import { MetadataRoute } from 'next';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Fetch all news (with a reasonable limit for sitemap)
    const { stiri } = await fetchLatestNews({ limit: 1000, orderBy: 'publicationDate', orderDirection: 'desc' });
    
    const newsPages = stiri.map((news) => ({
      url: `${baseUrl}/stiri/${createNewsSlug(news.title, news.id)}`,
      lastModified: new Date(news.publicationDate),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...newsPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages if news fetch fails
    return staticPages;
  }
}
