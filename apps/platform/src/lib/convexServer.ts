/**
 * convexServer.ts
 *
 * Server-route helper for talking to Convex with the CALLER's identity.
 *
 * A bare `new ConvexHttpClient(url)` is anonymous. Once a Convex mutation is
 * gated (requireUser / requireBrandRole), an anonymous client throws
 * "Not authenticated" — which the run/verify/eval routes swallow as a non-fatal
 * persistence failure, silently dropping the user's generated data. Attaching the
 * Better Auth session token via `setAuth` makes server-route calls pass the exact
 * same per-brand auth gates the browser client does.
 *
 * Falls back to an anonymous client when no session token is present: public
 * read paths still work, and gated calls correctly reject rather than running
 * unauthenticated.
 */
import { ConvexHttpClient } from 'convex/browser';

async function getServerAuthToken(): Promise<string | null> {
  try {
    // Imported lazily: ./auth-server runs convexBetterAuthNextJs() at module load
    // and throws when CONVEX_SITE_URL is unset (e.g. unit tests), so a static
    // import would break any route that pulls this helper into its import graph.
    const { getToken } = await import('./auth-server');
    return (await getToken()) ?? null;
  } catch {
    // getToken reads request cookies; outside a request scope (e.g. unit tests)
    // it throws. Callers decide whether anonymous fallback is acceptable.
    return null;
  }
}

/** A ConvexHttpClient carrying the current request's Better Auth identity. */
export async function createAuthedConvexClient(convexUrl: string): Promise<ConvexHttpClient> {
  const convex = new ConvexHttpClient(convexUrl);
  const token = await getServerAuthToken();
  if (token) convex.setAuth(token);
  return convex;
}

/**
 * Convex client for platform API routes where anonymous tooling fallback is NOT
 * acceptable. This keeps Storybook/CDN anonymous read paths intact while making
 * user-owned platform routes fail closed before they query or mutate sensitive
 * rows.
 */
export async function createRequiredAuthedConvexClient(
  convexUrl: string,
): Promise<ConvexHttpClient | null> {
  const token = await getServerAuthToken();
  if (!token) return null;
  const convex = new ConvexHttpClient(convexUrl);
  convex.setAuth(token);
  return convex;
}
