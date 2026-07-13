/**
 * Resolves which brand contexts the Button Applitools suite should exercise.
 * Invoked from `scripts/write-applitools-brand-cases.mts` before Playwright loads tests.
 */

import { ConvexHttpClient } from 'convex/browser';

import { api } from '@oneui/convex';

export type ApplitoolsBrandCaseFixture = { mode: 'fixture' };

export type ApplitoolsBrandCaseConvex = {
  mode: 'convex';
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type ApplitoolsBrandCase = ApplitoolsBrandCaseFixture | ApplitoolsBrandCaseConvex;

export function readConvexUrlForApplitools(): string | undefined {
  const raw =
    process.env.VITE_CONVEX_URL?.trim() ||
    process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ||
    process.env.CONVEX_URL?.trim();
  return raw || undefined;
}

/**
 * When a Convex deployment URL is available, returns one case per non-deprecated
 * brand (active + draft). Otherwise a single offline fixture case.
 */
export async function resolveApplitoolsBrandCases(): Promise<ApplitoolsBrandCase[]> {
  const url = readConvexUrlForApplitools();
  if (!url) {
    return [{ mode: 'fixture' }];
  }

  try {
    const client = new ConvexHttpClient(url);
    const rows = await client.query(api.brands.list, {});
    if (!Array.isArray(rows) || rows.length === 0) {
      return [{ mode: 'fixture' }];
    }

    const eligible = rows
      .filter((b: { status?: string }) => b.status !== 'deprecated')
      .map((b: { _id: string; name: string; slug: string; status: string }) => ({
        mode: 'convex' as const,
        id: b._id,
        name: b.name,
        slug: b.slug,
        status: b.status,
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug));

    return eligible.length > 0 ? eligible : [{ mode: 'fixture' }];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[applitools] Convex brand list failed; falling back to fixture mode.',
      err instanceof Error ? err.message : err,
    );
    return [{ mode: 'fixture' }];
  }
}
