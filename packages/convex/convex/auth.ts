import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth/minimal';
import { components } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import authConfig from './auth.config';

// Identity layer (Better Auth running inside Convex via @convex-dev/better-auth).
// Authorization lives separately in ./lib/auth.ts + the brandMembers table.
const siteUrl = process.env.SITE_URL!;

// Better Auth rejects any sign-in/sign-up whose browser Origin isn't trusted,
// defaulting to just `baseURL`. In local dev Next binds to whatever port is
// free (3000, 3001, 3002…), which otherwise surfaces as "Invalid origin" on
// the auth screen. Trust the common localhost dev ports when SITE_URL is local;
// production stays locked to SITE_URL only.
const isLocalDev = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
const trustedOrigins = isLocalDev
  ? Array.from(
      new Set([
        siteUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
      ]),
    )
  : [siteUrl];

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    // Google is enabled only when both env vars are present, so dev works with
    // email/password alone. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in the
    // Convex deployment env to turn it on.
    socialProviders:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : undefined,
    plugins: [convex({ authConfig })],
  });

/** Client-facing: the current Better Auth user (or null). */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
