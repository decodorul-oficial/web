import { NextResponse } from 'next/server';
import type { NewsSitemapEntry, SitemapIndexEntry, SitemapUrlEntry } from './types';

export function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    };
    return entities[char] ?? char;
  });
}

export function buildUrlsetXml(urls: SitemapUrlEntry[]): string {
  const body = urls
    .map((url) => {
      const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];
      if (url.lastmod) parts.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
      if (url.changefreq) parts.push(`    <changefreq>${escapeXml(url.changefreq)}</changefreq>`);
      if (url.priority !== undefined) parts.push(`    <priority>${url.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export function buildNewsUrlsetXml(urls: NewsSitemapEntry[]): string {
  const body = urls
    .map((url) => {
      const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];
      if (url.lastmod) parts.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
      if (url.changefreq) parts.push(`    <changefreq>${escapeXml(url.changefreq)}</changefreq>`);
      if (url.priority !== undefined) parts.push(`    <priority>${url.priority}</priority>`);

      parts.push(`    <news:news>
      <news:publication>
        <news:name>Decodorul Oficial</news:name>
        <news:language>ro</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(url.news.publicationDate)}</news:publication_date>
      <news:title>${escapeXml(url.news.title)}</news:title>
      <news:keywords>${escapeXml(url.news.keywords ?? 'legislație română, Monitorul Oficial, acte normative')}</news:keywords>
    </news:news>`);

      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>`;
}

export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const body = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      return `  <sitemap>\n${parts.join('\n')}\n  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>`;
}

export function sitemapXmlResponse(
  xml: string,
  cacheMaxAge = 3600,
): NextResponse {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`,
    },
  });
}
