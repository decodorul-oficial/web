import { MetadataRoute } from 'next';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';

export default async function newsSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  const currentDate = new Date();
  
  // Calculate 48 hours ago
  const fortyEightHoursAgo = new Date(currentDate.getTime() - (48 * 60 * 60 * 1000));
  
  try {
    // Fetch news from the last 48 hours with higher limit to ensure we get all recent news
    const { stiri } = await fetchLatestNews({ 
      limit: 100, 
      orderBy: 'publicationDate', 
      orderDirection: 'desc' 
    });
    
    // Filter news from the last 48 hours only
    const recentNews = stiri.filter((news) => {
      const publicationDate = new Date(news.publicationDate);
      return publicationDate >= fortyEightHoursAgo;
    });
    
    const newsPages = recentNews.map((news) => {
      const publicationDate = new Date(news.publicationDate);
      
      return {
        url: `${baseUrl}/stiri/${createNewsSlug(news.title, news.id)}`,
        lastModified: publicationDate,
        changeFrequency: 'hourly' as const, // News sitemap should be hourly
        priority: 1.0, // Maximum priority for recent news
      };
    });

    return newsPages;
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return [];
  }
}
