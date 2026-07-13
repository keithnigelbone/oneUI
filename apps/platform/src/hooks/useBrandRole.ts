'use client';

/**
 * useBrandRole.ts
 *
 * Resolves the signed-in user's role on a brand and derives the capability
 * flags the UI gates on (edit / manage members / delete). Backed by the
 * deployed `brandMembers.getMyRole` query.
 *
 * Per-brand role ladder: viewer < editor < admin, plus the platform `owner`
 * super-admin who outranks everyone on every brand.
 *
 *   - canEdit            — editor | admin | owner   (mutate foundations)
 *   - canManageMembers   — admin  | owner           (invite / remove / role)
 *   - canDelete          — admin  | owner           (destructive brand ops)
 *   - isViewer           — role === 'viewer'        (read-only)
 */

import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';

export type BrandRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface UseBrandRoleResult {
  /** The resolved role, or null when the user has no access / no brand selected. */
  role: BrandRole | null;
  isOwner: boolean;
  /** editor | admin | owner — may mutate foundations. */
  canEdit: boolean;
  /** admin | owner — may invite, remove, and change member roles. */
  canManageMembers: boolean;
  /** admin | owner — may perform destructive brand operations. */
  canDelete: boolean;
  /** role === 'viewer' — read-only access. */
  isViewer: boolean;
  /** True while the role query is in flight (and a brand id was supplied). */
  isLoading: boolean;
}

export function useBrandRole(brandId?: string): UseBrandRoleResult {
  const role = useQuery(
    api.brandMembers.getMyRole,
    brandId ? { brandId: brandId as Id<'brands'> } : 'skip',
  );

  const resolved = (role ?? null) as BrandRole | null;
  const isLoading = brandId != null && role === undefined;

  const isOwner = resolved === 'owner';
  const canManageMembers = resolved === 'owner' || resolved === 'admin';
  const canDelete = canManageMembers;
  const canEdit =
    resolved === 'owner' || resolved === 'admin' || resolved === 'editor';
  const isViewer = resolved === 'viewer';

  return {
    role: resolved,
    isOwner,
    canEdit,
    canManageMembers,
    canDelete,
    isViewer,
    isLoading,
  };
}
