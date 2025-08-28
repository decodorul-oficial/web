import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  return NextResponse.redirect(new URL('/categorii', url.origin));
}


