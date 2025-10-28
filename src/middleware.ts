import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSignupEnabled = process.env.SIGNUP_ENABLED === 'true';

  if (isProduction && !isSignupEnabled) {
    if (request.nextUrl.pathname === '/signup') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('signup', 'disabled');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/stiri/:path*',
    '/signup',
  ],
};
