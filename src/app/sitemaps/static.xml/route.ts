import { buildStaticSitemapUrls } from '@/lib/sitemap/buildSitemapUrls';
import { buildUrlsetXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

export async function GET() {
  const urls = buildStaticSitemapUrls();
  return sitemapXmlResponse(buildUrlsetXml(urls), 86400);
}
