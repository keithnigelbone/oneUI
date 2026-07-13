/**
 * Menu.tsx
 * React (web) implementation using Base UI Menu
 *
 * Key features:
 * - Uses @base-ui/react Menu primitive (never fork)
 * - Token-only styling in CSS Module
 * - Non-interactive shape = Shape-L
 * - WCAG AA accessible with keyboard navigation
 * - Supports groups, separators, and disabled items
 */

import React, { ReactNode } from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import styles from './Menu.module.css';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';
import {
  MenuProps,
  MenuPortalProps,
  MenuItemProps,
  MenuGroupProps,
} from './Menu.shared';

export const Menu: React.FC<MenuProps> & {
  Trigger: typeof MenuTrigger;
  Portal: typeof MenuPortal;
  Item: typeof MenuItem;
  Separator: typeof MenuSeparator;
  Group: typeof MenuGroup;
} = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
}) => {
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </BaseMenu.Root>
  );
};

const MenuTrigger = BaseMenu.Trigger;

const MenuPortal: React.FC<MenuPortalProps> = ({
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
}) => {
  return (
    <BaseMenu.Portal>
      <BrandScopePortal>
        <BaseMenu.Positioner
          className={styles.positioner}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BaseMenu.Popup className={styles.popup}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BrandScopePortal>
    </BaseMenu.Portal>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  children,
  onClick,
  disabled,
  className,
}) => {
  const itemClassName = [styles.item, className].filter(Boolean).join(' ');

  return (
    <BaseMenu.Item
      className={itemClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseMenu.Item>
  );
};

const MenuSeparator: React.FC = () => {
  return <BaseMenu.Separator className={styles.separator} />;
};

const MenuGroup: React.FC<MenuGroupProps> = ({ label, children }) => {
  return (
    <BaseMenu.Group>
      {label && <BaseMenu.GroupLabel className={styles.groupLabel}>{label}</BaseMenu.GroupLabel>}
      {children}
    </BaseMenu.Group>
  );
};

Menu.Trigger = MenuTrigger;
Menu.Portal = MenuPortal;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
Menu.Group = MenuGroup;
