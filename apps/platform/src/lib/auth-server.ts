import { convexBetterAuthNextJs } from '@convex-dev/better-auth/nextjs';

// Server-side Better Auth bindings for Next.js. `handler` backs the
// /api/auth/[...all] route; `isAuthenticated` / `getToken` are available for
// server components and middleware. Default basePath is /api/auth.
export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
