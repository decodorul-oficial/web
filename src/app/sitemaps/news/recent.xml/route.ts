import { buildRecentNewsSitemapEntries } from '@/lib/sitemap/buildRecentNewsSitemap';
import { buildNewsUrlsetXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

export async function GET() {
  try {
    const entries = await buildRecentNewsSitemapEntries();
    // Short cache so Google News sees new articles quickly (≤10 min).
    const cacheMaxAge = entries.length === 0 ? 300 : 600;
    return sitemapXmlResponse(buildNewsUrlsetXml(entries), cacheMaxAge);
  } catch (error) {
    console.error('[sitemap news/recent] Error:', error);
    return sitemapXmlResponse(buildNewsUrlsetXml([]), 300);
  }
}
