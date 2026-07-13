/**
 * Popover.tsx
 * React (web) implementation using Base UI Popover
 *
 * Key features:
 * - Uses @base-ui/react Popover primitive (never fork)
 * - Token-only styling in CSS Module
 * - Non-interactive shape = Shape-L
 * - WCAG AA accessible with focus management
 * - Supports arrow, backdrop, positioning
 */

import React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import styles from './Popover.module.css';
import { PopoverProps, PopoverPortalProps } from './Popover.shared';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';

export const Popover: React.FC<PopoverProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  dismissible = true,
}) => {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </BasePopover.Root>
  );
};

export const PopoverTrigger = BasePopover.Trigger;

export const PopoverPortal: React.FC<PopoverPortalProps> = ({
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  title,
  description,
  arrow = true,
  backdrop = false,
}) => {
  return (
    <BasePopover.Portal>
      <BrandScopePortal>
        {backdrop && <BasePopover.Backdrop className={styles.backdrop} />}
        <BasePopover.Positioner
          className={styles.positioner}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BasePopover.Popup className={styles.popup}>
            {arrow && (
              <BasePopover.Arrow className={styles.arrow}>
                <ArrowSvg />
              </BasePopover.Arrow>
            )}
            {title && <BasePopover.Title className={styles.title}>{title}</BasePopover.Title>}
            {description && (
              <BasePopover.Description className={styles.description}>
                {description}
              </BasePopover.Description>
            )}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BrandScopePortal>
    </BasePopover.Portal>
  );
};

export const PopoverClose = BasePopover.Close;

function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H17.8683C16.8801 8 15.9269 7.63423 15.1924 6.97318L10.3356 2.60207C10.1479 2.43119 9.85207 2.43119 9.66437 2.60207Z"
        className={styles.arrowFill}
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className={styles.arrowStroke}
      />
    </svg>
  );
}
