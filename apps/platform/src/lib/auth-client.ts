import { createAuthClient } from 'better-auth/react';
import { convexClient } from '@convex-dev/better-auth/client/plugins';

// Browser auth client. Same-origin: talks to the Next handler at /api/auth/*.
// Used by the sign-in page, the session display in PlatformShell, and sign-out.
export const authClient = createAuthClient({
  plugins: [convexClient()],
});
