/**
 * ConvexClientProvider.tsx
 *
 * Convex React provider wired for Better Auth. ConvexBetterAuthProvider attaches
 * the authenticated token to every Convex query/mutation (replacing the plain
 * ConvexProvider — see _generated/ai/guidelines.md § Authentication). Identity is
 * configured in src/lib/auth-client.ts; authorization lives in Convex (lib/auth.ts).
 */

'use client';

import { ConvexReactClient } from 'convex/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ConvexBetterAuthProvider, type AuthClient } from '@convex-dev/better-auth/react';
import { authClient } from '@/lib/auth-client';

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Lazy initialization — only runs on the client, not during SSR/prerendering
  const [convex] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  );
  return (
    // The provider's AuthClient prop type is a degenerate union (useSession().data
    // resolves to `never`), so a precisely-inferred client isn't structurally
    // assignable. Runtime is correct — this mirrors the component's own example.
    // Cast only at the boundary; the module-level authClient keeps its rich types.
    <ConvexBetterAuthProvider client={convex} authClient={authClient as unknown as AuthClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
