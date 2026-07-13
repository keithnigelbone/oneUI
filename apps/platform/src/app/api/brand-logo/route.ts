/**
 * GET /api/brand-logo
 *
 * Returns the first brand's logoSvg from Convex as an SVG image.
 * No auth required — used by the auth page and loading screen
 * to show the correct brand logo before the app fully loads.
 *
 * Caches for 5 minutes to avoid hitting Convex on every page load.
 */

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';

const FALLBACK_LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#333"/><text x="50" y="62" font-size="36" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui">O</text></svg>';

const BLOCKED_SVG_PATTERN =
  /<\s*(script|foreignObject|iframe|object|embed)\b|on[a-z]+\s*=|(?:href|xlink:href)\s*=\s*(['"]?)\s*(?:javascript:|data:text\/html)/i;

const SVG_RESPONSE_HEADERS = {
  'Content-Type': 'image/svg+xml',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
};

function isSafeLogoSvg(svg: unknown): svg is string {
  if (typeof svg !== 'string') return false;
  const trimmed = svg.trim();
  return trimmed.startsWith('<svg') && !BLOCKED_SVG_PATTERN.test(trimmed);
}

function svgResponse(svg: string, cacheControl: string, status = 200): NextResponse {
  return new NextResponse(svg, {
    status,
    headers: {
      ...SVG_RESPONSE_HEADERS,
      'Cache-Control': cacheControl,
    },
  });
}

export async function GET() {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    const convex = new ConvexHttpClient(convexUrl);
    const brands = await convex.query(api.brands.list);

    // Find the first brand that has a logoSvg
    const brand = brands?.find((b: any) => b.logoSvg);

    if (isSafeLogoSvg(brand?.logoSvg)) {
      return svgResponse(
        brand.logoSvg,
        'public, max-age=300, stale-while-revalidate=600',
      );
    }

    // No logo found — return a minimal fallback
    return svgResponse(FALLBACK_LOGO, 'public, max-age=60');
  } catch {
    return svgResponse(FALLBACK_LOGO, 'public, max-age=60');
  }
}
