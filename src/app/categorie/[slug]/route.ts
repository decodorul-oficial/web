import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const url = new URL(req.url);
  const page = url.searchParams.get('page');
  const dest = new URL(`/categorii/${params.slug}${page ? `?page=${page}` : ''}`, url.origin);
  return NextResponse.redirect(dest);
}


