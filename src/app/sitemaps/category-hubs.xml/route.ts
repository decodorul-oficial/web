import { fetchCategories } from '@/features/news/services/newsService';
import { buildCategoryHubsSitemapUrls } from '@/lib/sitemap/buildSitemapUrls';
import { buildUrlsetXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

export async function GET() {
  try {
    const categories = await fetchCategories(100);
    const urls = buildCategoryHubsSitemapUrls(categories);
    return sitemapXmlResponse(buildUrlsetXml(urls), 3600);
  } catch (error) {
    console.error('[sitemap category-hubs] Error:', error);
    return sitemapXmlResponse(buildUrlsetXml([]), 300);
  }
}
