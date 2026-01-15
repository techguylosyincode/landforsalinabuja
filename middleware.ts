import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/agent/dashboard',
    '/agent/listings',
    '/onboarding/payment',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for Supabase auth token in cookies
  // Supabase stores auth in cookies with the pattern: sb-<project-id>-auth-token
  const allCookies = request.cookies.getAll();
  const hasAuthToken = allCookies.some(cookie =>
    cookie.name.includes('auth-token') ||
    (cookie.name.includes('auth') && cookie.name.startsWith('sb-'))
  );

  if (!hasAuthToken) {
    // No auth token found, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Let the client component handle more complex checks (payment status, email verification, etc)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/agent/dashboard/:path*',
    '/agent/listings/:path*',
    '/onboarding/payment/:path*',
  ],
};
