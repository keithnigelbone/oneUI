'use client';

/**
 * BrandEditGate.tsx
 *
 * Real read-only enforcement for viewers. Wraps an editor surface; when the
 * signed-in user lacks edit access to the current brand (viewer role, or no
 * membership), it renders the ReadOnlyBanner and makes the wrapped subtree
 * genuinely non-interactive via the HTML `inert` attribute (React 19 boolean
 * prop), dimmed with the semantic disabled-opacity token.
 *
 * Server-side RBAC in convex/lib/auth.ts remains the security boundary —
 * this gate is UX honesty: without it a viewer can operate every control and
 * only discover they can't save when the mutation throws.
 *
 * Notes:
 * - The banner renders OUTSIDE the inert region so it stays readable by AT.
 * - `inert` disables hit-testing inside the subtree, but wheel scrolling
 *   still reaches the shell's main scroll container, so pages stay scrollable.
 * - While the role is still resolving, children render ungated (same
 *   no-flash pattern as the original foundations banner logic).
 */

import React from 'react';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useBrandRole } from '@/hooks/useBrandRole';
import { ReadOnlyBanner } from '@/components/ReadOnlyBanner';
import styles from './BrandEditGate.module.css';

export interface BrandEditGateProps {
  children: React.ReactNode;
  /** Override the banner copy for section-specific wording. */
  message?: string;
}

export function BrandEditGate({ children, message }: BrandEditGateProps): React.ReactElement {
  const { currentBrand } = usePlatformContext();
  const { canEdit, isLoading } = useBrandRole(currentBrand?.id);

  const readOnly = currentBrand != null && !isLoading && !canEdit;

  if (!readOnly) return <>{children}</>;

  return (
    <>
      <div className={styles.bannerSlot}>
        <ReadOnlyBanner message={message} />
      </div>
      <div inert className={styles.gate} data-readonly="true">
        {children}
      </div>
    </>
  );
}
