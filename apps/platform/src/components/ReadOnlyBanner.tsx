'use client';

/**
 * ReadOnlyBanner.tsx
 *
 * Small Surface-based notice shown at the top of editor pages when the
 * signed-in user lacks edit access to the current brand (viewer role, or
 * no membership). Rendered by foundation editor pages via:
 *
 *   const { canEdit } = useBrandRole(currentBrand?.id);
 *   {!canEdit && <ReadOnlyBanner />}
 *
 * Uses `<Surface mode="subtle" appearance="informative">` so the banner's
 * fill + content tokens remap automatically (no hardcoded colors), per the
 * Surface Context rules.
 */

import React from 'react';
import { Surface } from '@oneui/ui/components/Surface';
import { Icon } from '@oneui/ui/icons/Icon';
import styles from './ReadOnlyBanner.module.css';

export interface ReadOnlyBannerProps {
  /** Override copy. Defaults to a brand view-only message. */
  message?: string;
  className?: string;
}

export function ReadOnlyBanner({
  message = 'You have view-only access to this brand. Editing is disabled — ask an admin for editor access.',
  className,
}: ReadOnlyBannerProps): React.ReactElement {
  return (
    <Surface
      mode="subtle"
      appearance="informative"
      className={[styles.banner, className].filter(Boolean).join(' ')}
      role="status"
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon name="eye" />
      </span>
      <span className={styles.text}>{message}</span>
    </Surface>
  );
}
