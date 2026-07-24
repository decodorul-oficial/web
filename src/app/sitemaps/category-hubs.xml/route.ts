import { buildUrlsetXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

/**
 * Category hubs are behind login/premium. Keep this route for backwards
 * compatibility with previously submitted sitemap URLs, but return an empty
 * urlset so Google stops discovering gated pages.
 */
export async function GET() {
  return sitemapXmlResponse(buildUrlsetXml([]), 86400);
}
