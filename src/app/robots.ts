import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.decodoruloficial.ro';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/stiri/*',
          '/contact',
          '/legal',
          '/privacy',
          '/cookies'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/login',
          '/test-news/',
          '/*.json'
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/stiri/*',
          '/contact',
          '/legal',
          '/privacy',
          '/cookies'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/login',
          '/test-news/',
          '/*.json'
        ],
        crawlDelay: 0.5,
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/stiri/*',
          '/contact',
          '/legal',
          '/privacy',
          '/cookies'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/login',
          '/test-news/',
          '/*.json'
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
