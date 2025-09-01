import { NextResponse } from 'next/server';

export function middleware(/* request: NextRequest */) {
  // Middleware is no longer needed as routing is handled in the page component
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/stiri/:path*',
  ],
};
