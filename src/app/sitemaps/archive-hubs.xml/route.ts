import { fetchAllNewsForSitemap } from '@/lib/sitemap/fetchAllNewsForSitemap';
import { buildArchiveHubsSitemapUrls } from '@/lib/sitemap/buildSitemapUrls';
import { buildUrlsetXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

export async function GET() {
  try {
    const news = await fetchAllNewsForSitemap();
    const urls = buildArchiveHubsSitemapUrls(news.map((item) => item.publicationDate));
    return sitemapXmlResponse(buildUrlsetXml(urls), 3600);
  } catch (error) {
    console.error('[sitemap archive-hubs] Error:', error);
    return sitemapXmlResponse(buildUrlsetXml([]), 300);
  }
}
