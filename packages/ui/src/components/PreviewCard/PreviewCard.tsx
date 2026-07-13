/**
 * PreviewCard.tsx
 * React (web) implementation using Base UI PreviewCard
 *
 * Key features:
 * - Uses @base-ui/react PreviewCard primitive (never fork)
 * - Token-only styling in CSS Module
 * - Non-interactive shape = Shape-L
 * - WCAG AA accessible
 * - Hover-triggered rich content preview
 */

import React from 'react';
import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import styles from './PreviewCard.module.css';
import { PreviewCardProps, PreviewCardPortalProps } from './PreviewCard.shared';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';

export const PreviewCard: React.FC<PreviewCardProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
}) => {
  return (
    <BasePreviewCard.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
    >
      {children}
    </BasePreviewCard.Root>
  );
};

export const PreviewCardTrigger = BasePreviewCard.Trigger;

export const PreviewCardPortal: React.FC<PreviewCardPortalProps> = ({
  children,
  side = 'top',
  align = 'center',
  sideOffset = 8,
  arrow = true,
}) => {
  return (
    <BasePreviewCard.Portal>
      <BrandScopePortal>
        <BasePreviewCard.Positioner
          className={styles.positioner}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BasePreviewCard.Popup className={styles.popup}>
            {arrow && (
              <BasePreviewCard.Arrow className={styles.arrow}>
                <ArrowSvg />
              </BasePreviewCard.Arrow>
            )}
            {children}
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BrandScopePortal>
    </BasePreviewCard.Portal>
  );
};

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H17.8683C16.8801 8 15.9269 7.63423 15.1924 6.97318L10.3356 2.60207C10.1479 2.43119 9.85207 2.43119 9.66437 2.60207Z"
        fill="currentColor"
      />
    </svg>
  );
}
