import { buildSitemapIndex } from '@/lib/sitemap/buildSitemapIndex';
import { buildSitemapIndexXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

export async function GET() {
  try {
    const entries = await buildSitemapIndex();
    return sitemapXmlResponse(buildSitemapIndexXml(entries), 3600);
  } catch (error) {
    console.error('[sitemap-index] Error generating sitemap index:', error);
    return sitemapXmlResponse(
      buildSitemapIndexXml([
        {
          loc: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro'}/sitemaps/static.xml`,
          lastmod: new Date().toISOString(),
        },
      ]),
      300,
    );
  }
}
