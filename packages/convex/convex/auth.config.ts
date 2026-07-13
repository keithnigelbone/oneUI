import { getAuthConfigProvider } from '@convex-dev/better-auth/auth-config';

// MANDATORY for auth: without this file `ctx.auth.getUserIdentity()` always
// returns null (see _generated/ai/guidelines.md § Authentication). The Better
// Auth component supplies its own JWT issuer provider here.
export default {
  providers: [getAuthConfigProvider()],
};
