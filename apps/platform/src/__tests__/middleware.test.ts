import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { createRequire } from 'node:module';
import { middleware } from '../middleware';

const require = createRequire(import.meta.url);
const nextConfig = require('../../next.config.js');

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('platform middleware auth bypasses', () => {
  it('allows strict-sandbox preview iframe routes without the editor auth cookie', () => {
    const astRes = middleware(request('/internal/render-ast?token=opaque'));
    const codeRes = middleware(request('/internal/render-code?token=opaque'));
    const iconCatalogRes = middleware(request('/jio-icons-data.json'));

    expect(astRes.status).toBe(200);
    expect(codeRes.status).toBe(200);
    expect(iconCatalogRes.status).toBe(200);
    expect(astRes.headers.get('location')).toBeNull();
    expect(codeRes.headers.get('location')).toBeNull();
    expect(iconCatalogRes.headers.get('location')).toBeNull();
  });

  it('still redirects normal app routes without the editor auth cookie', () => {
    const res = middleware(request('/lab'));

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/auth?from=%2Flab');
  });

  it('serves strict-sandbox preview assets with CORS-readable headers', async () => {
    const headers = await nextConfig.headers();
    const bySource = new Map(headers.map((entry: { source: string; headers: unknown[] }) => [
      entry.source,
      entry.headers,
    ]));
    for (const source of [
      '/jio-icons-data.json',
      '/fonts/:path*',
      '/_next/static/media/:path*',
      '/__nextjs_font/:path*',
      '/media/:path*',
    ]) {
      expect(bySource.get(source)).toContainEqual({
        key: 'Access-Control-Allow-Origin',
        value: '*',
      });
    }
  });
});
