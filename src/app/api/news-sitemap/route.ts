import { NextResponse } from 'next/server';
import { fetchLatestNews } from '@/features/news/services/newsService';
import { createNewsSlug } from '@/lib/utils/slugify';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  const currentDate = new Date();
  
  // Calculate 48 hours ago
  const fortyEightHoursAgo = new Date(currentDate.getTime() - (48 * 60 * 60 * 1000));
  
  try {
    // Fetch news from the last 48 hours (limit 100 with internal key when API allows; fallback 10 handled in service)
    const { stiri } = await fetchLatestNews({
      limit: 100,
      orderBy: 'publicationDate',
      orderDirection: 'desc',
      useInternalKey: true,
    });

    // Filter news from the last 48 hours only
    const recentNews = stiri.filter((news) => {
      const publicationDate = new Date(news.publicationDate);
      return publicationDate >= fortyEightHoursAgo;
    });
    
    // Generate XML sitemap
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentNews.map((news) => {
  const publicationDate = new Date(news.publicationDate);
  const formattedDate = publicationDate.toISOString();
  
  return `  <url>
    <loc>${baseUrl}/stiri/${createNewsSlug(news.title, news.id)}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <news:news>
      <news:publication>
        <news:name>Decodorul Oficial</news:name>
        <news:language>ro</news:language>
      </news:publication>
      <news:publication_date>${formattedDate}</news:publication_date>
      <news:title>${news.title.replace(/[<>&'"]/g, (char) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          "'": '&apos;',
          '"': '&quot;'
        };
        return entities[char];
      })}</news:title>
      <news:keywords>legislație română, Monitorul Oficial, acte normative</news:keywords>
      <news:stock_tickers></news:stock_tickers>
    </news:news>
  </url>`;
}).join('\n')}
</urlset>`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    
    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
    
    return new NextResponse(emptyXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }
}
