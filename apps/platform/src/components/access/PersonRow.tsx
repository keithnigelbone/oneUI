'use client';

/**
 * PersonRow.tsx
 *
 * Presentational row shared by the brand Members panel and the platform
 * Users panel: an Avatar + a name/subtitle block on the left, and a
 * caller-supplied `trailing` slot (role Select + optional action) on the
 * right. Keeping both surfaces on one component guarantees they read
 * identically. DS components only.
 */

import React from 'react';
import { Avatar } from '@oneui/ui/components/Avatar';
import s from './AccessPanel.module.css';

export interface PersonRowProps {
  /** Primary line — display name (or email when no name is set). */
  title: string;
  /** Secondary line — email, or status text for pending invites. */
  subtitle?: string;
  /** Avatar image URL, if any. Falls back to initials when absent. */
  image?: string;
  /** Trailing controls (role Select, remove/revoke action). */
  trailing?: React.ReactNode;
  /** Inline error message shown below the row. */
  error?: string | null;
}

export function PersonRow({
  title,
  subtitle,
  image,
  trailing,
  error,
}: PersonRowProps): React.ReactElement {
  return (
    <div className={s.row}>
      <div className={s.identity}>
        <Avatar
          size="xl"
          content={image ? 'image' : 'text'}
          src={image}
          alt={title}
        />
        <div className={s.identityText}>
          <span className={s.name}>{title}</span>
          {subtitle && <span className={s.subtitle}>{subtitle}</span>}
        </div>
      </div>
      {trailing && <div className={s.rowControls}>{trailing}</div>}
      {error && <span className={s.rowError}>{error}</span>}
    </div>
  );
}
