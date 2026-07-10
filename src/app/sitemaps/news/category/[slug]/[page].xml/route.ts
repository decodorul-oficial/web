import { fetchAllNewsForSitemap } from '@/lib/sitemap/fetchAllNewsForSitemap';
import { findPartition, partitionNews } from '@/lib/sitemap/partitionNews';
import { buildNewsArticleUrls } from '@/lib/sitemap/buildSitemapUrls';
import { buildUrlsetXml, sitemapXmlResponse } from '@/lib/sitemap/xml';

type RouteParams = {
  params: {
    slug: string;
    page: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const categorySlug = params.slug;
  const page = Number.parseInt(params.page, 10);

  if (!categorySlug || Number.isNaN(page) || page < 1) {
    return sitemapXmlResponse(buildUrlsetXml([]), 300);
  }

  try {
    const news = await fetchAllNewsForSitemap();
    const partitions = partitionNews(news);
    const partition = findPartition(partitions, categorySlug, page);

    if (!partition) {
      return sitemapXmlResponse(buildUrlsetXml([]), 300);
    }

    const urls = buildNewsArticleUrls(partition.items);
    return sitemapXmlResponse(buildUrlsetXml(urls), 3600);
  } catch (error) {
    console.error(`[sitemap news/category/${categorySlug}/${page}] Error:`, error);
    return sitemapXmlResponse(buildUrlsetXml([]), 300);
  }
}
