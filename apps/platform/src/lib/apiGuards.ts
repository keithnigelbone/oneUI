import { NextResponse } from 'next/server';

interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
}

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;

  try {
    if (new URL(origin).origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 400 });
  }

  return null;
}

export function rateLimitRequest(
  request: Request,
  { keyPrefix, maxRequests, windowMs }: RateLimitOptions,
): NextResponse | null {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = `${keyPrefix}:${forwardedFor || 'local'}`;
  const now = Date.now();
  const current = requestBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 },
    );
  }

  current.count += 1;
  return null;
}
