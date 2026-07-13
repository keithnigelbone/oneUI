'use client';

/**
 * usePlatformRole.ts
 *
 * Resolves the signed-in user's platform-wide tier from the deployed
 * `users.getCurrentUserRecord` query, and derives the platform-level
 * capability flags the shell gates on.
 *
 * Platform tier ladder: member (viewer default) < creator (can create
 * brands) < owner (super-admin / users admin).
 */

import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';

export type PlatformRole = 'owner' | 'creator' | 'member';

export interface UsePlatformRoleResult {
  /** The resolved platform tier, or null when not signed in / unresolved. */
  platformRole: PlatformRole | null;
  isOwner: boolean;
  /** owner | creator — may create new brands. */
  canCreateBrands: boolean;
  /** True while the user record query is in flight. */
  isLoading: boolean;
}

export function usePlatformRole(): UsePlatformRoleResult {
  const record = useQuery(api.users.getCurrentUserRecord, {});

  const isLoading = record === undefined;
  const platformRole = (record?.platformRole ?? null) as PlatformRole | null;

  const isOwner = platformRole === 'owner';
  const canCreateBrands = platformRole === 'owner' || platformRole === 'creator';

  return {
    platformRole,
    isOwner,
    canCreateBrands,
    isLoading,
  };
}
