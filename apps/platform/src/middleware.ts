import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Paths that bypass the auth gate.
// /api/auth/* is the Better Auth handler (sign-in/up/session/callbacks).
// /api/voice/sdk is the public Voice SDK — external products (BrandBook, etc.)
// consume it to fetch brand-specific compiled prompts, so it must be reachable
// without a session.
const PUBLIC_PATHS = [
  '/auth',
  '/api/auth',
  '/api/voice/sdk',
  // Strict-sandbox Experience Lab preview iframes. These routes authenticate via
  // short-lived opaque render tokens, not the editor cookie, so Playwright and
  // sandboxed iframes can load them without relaxing iframe origin isolation.
  '/internal/render-ast',
  '/internal/render-code',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets (SVGs, fonts, images)
  if (/\.(svg|png|jpg|jpeg|gif|ico|json|woff2?|ttf|eot)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Optimistic session-cookie presence check (no DB round-trip). This only
  // redirects unauthenticated visitors to the sign-in page — the real security
  // boundary is server-side: every Convex query/mutation derives identity from
  // ctx.auth and the RBAC helpers in convex/lib/auth.ts reject unauthorized writes.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
