import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/sitemap/types';

export async function GET() {
  const target = `${getBaseUrl()}/sitemaps/news/recent.xml`;
  return NextResponse.redirect(target, 301);
}
