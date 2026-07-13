/**
 * SecondaryNav.tsx
 * Second row navigation bar with 3 layout types
 *
 * Types:
 * - navStart: Start-aligned header items (tabs)
 * - navEnd: End-aligned header items (tabs)
 * - marketing: Subheader text + spacer + end slot (CTA buttons)
 */

import React from 'react';
import styles from './WebHeader.module.css';
import type { SecondaryNavProps } from './WebHeader.shared';

export const SecondaryNav: React.FC<SecondaryNavProps> = ({
  type = 'navStart',
  secondaryNavItems = true,
  subheader,
  end,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const rootClassName = [styles.secondaryNav, className]
    .filter(Boolean)
    .join(' ');

  const showNavItems =
    secondaryNavItems &&
    (type === 'navStart' || type === 'navEnd');

  return (
    <nav
      className={rootClassName}
      aria-label={ariaLabelledBy ? undefined : ariaLabel ?? 'Secondary navigation'}
      aria-labelledby={ariaLabelledBy}
      data-type={type}
    >
      {type === 'marketing' && subheader && (
        <span className={styles.secondaryNavSubheader}>{subheader}</span>
      )}

      {showNavItems && (
        <div className={styles.secondaryNavItems}>{children}</div>
      )}

      {type === 'marketing' && (
        <>
          <div className={styles.secondaryNavSpacer} />
          {end && <div className={styles.secondaryNavEnd}>{end}</div>}
        </>
      )}
    </nav>
  );
};
