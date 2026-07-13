'use client';

/**
 * InviteToasts.tsx
 *
 * Bridges pending invites into the Base UI toast stack: one persistent toast
 * per invite, added when it appears and closed when it's accepted/revoked (the
 * live query drops it). Covers both per-brand invites
 * (`brandMembers.listMyInvites`) and platform-tier invites
 * (`users.listMyPlatformInvites`). Renders nothing itself — mount once inside
 * `<ToastProvider>` (so `useToastManager` resolves).
 */

import React, { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { Toast } from '@base-ui/react/toast';
import { api } from '@oneui/convex';
import type { InviteToastData } from './Toaster';

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function InviteToasts(): null {
  const invites = useQuery(api.brandMembers.listMyInvites, {});
  const platformInvites = useQuery(api.users.listMyPlatformInvites, {});
  const manager = Toast.useToastManager();
  // namespaced key ("brand:<token>" / "platform:<token>") → toast id, so we can
  // close toasts when their invite is gone (and never collide across the two).
  const shownRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    // Wait until both live queries have resolved before reconciling, so a
    // still-loading query doesn't look like "no invites" and close live toasts.
    if (!invites || !platformInvites) return;
    const shown = shownRef.current;
    const liveKeys = new Set<string>([
      ...invites.map((inv) => `brand:${inv.token}`),
      ...platformInvites.map((inv) => `platform:${inv.token}`),
    ]);

    // Close toasts whose invite has been accepted or revoked.
    for (const [key, id] of shown) {
      if (!liveKeys.has(key)) {
        manager.close(id);
        shown.delete(key);
      }
    }

    // Add a toast for each newly-seen invite (persistent: timeout 0).
    for (const inv of invites) {
      const key = `brand:${inv.token}`;
      if (shown.has(key)) continue;
      const data: InviteToastData = { kind: 'invite', token: inv.token };
      const id = manager.add({
        timeout: 0,
        priority: 'high',
        title: (
          <>
            You&apos;ve been invited to <strong>{inv.brandName ?? 'a brand'}</strong> as{' '}
            <strong>{titleCase(inv.role)}</strong>.
          </>
        ),
        data,
      });
      shown.set(key, id);
    }

    for (const inv of platformInvites) {
      const key = `platform:${inv.token}`;
      if (shown.has(key)) continue;
      const data: InviteToastData = { kind: 'platform-invite', token: inv.token };
      const id = manager.add({
        timeout: 0,
        priority: 'high',
        title: (
          <>
            You&apos;ve been invited to the platform as{' '}
            <strong>{titleCase(inv.role)}</strong>.
          </>
        ),
        data,
      });
      shown.set(key, id);
    }
  }, [invites, platformInvites, manager]);

  return null;
}
