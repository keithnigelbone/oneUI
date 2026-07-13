/**
 * NavigationMenu.tsx
 * React (web) implementation using Base UI NavigationMenu
 *
 * Key features:
 * - Uses @base-ui/react NavigationMenu primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive shape = Shape-M (triggers), Shape-L (content)
 * - WCAG AA accessible with keyboard navigation
 * - Supports horizontal and vertical orientation
 */

import React, { ReactNode } from 'react';
import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu';
import styles from './NavigationMenu.module.css';
import {
  NavigationMenuProps,
  NavigationMenuItemProps,
  NavigationMenuTriggerProps,
  NavigationMenuContentProps,
} from './NavigationMenu.shared';

export const NavigationMenu: React.FC<NavigationMenuProps> & {
  Item: typeof NavigationMenuItem;
  Trigger: typeof NavigationMenuTrigger;
  Content: typeof NavigationMenuContent;
  Link: typeof NavigationMenuLink;
  Viewport: typeof NavigationMenuViewport;
} = ({
  children,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  className,
}) => {
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const handleValueChange = React.useCallback(
    (nextValue: string | null) => {
      if (nextValue !== null) onValueChange?.(nextValue);
    },
    [onValueChange],
  );

  return (
    <BaseNavigationMenu.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      orientation={orientation}
      className={rootClassName}
    >
      <BaseNavigationMenu.List className={styles.list}>
        {children}
      </BaseNavigationMenu.List>
      <BaseNavigationMenu.Viewport className={styles.viewport} />
    </BaseNavigationMenu.Root>
  );
};

const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  children,
  value,
  className,
}) => {
  const itemClassName = [styles.item, className].filter(Boolean).join(' ');

  return (
    <BaseNavigationMenu.Item value={value} className={itemClassName}>
      {children}
    </BaseNavigationMenu.Item>
  );
};

const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({
  children,
  className,
}) => {
  const triggerClassName = [styles.trigger, className].filter(Boolean).join(' ');

  return (
    <BaseNavigationMenu.Trigger className={triggerClassName}>
      {children}
    </BaseNavigationMenu.Trigger>
  );
};

const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({
  children,
  className,
}) => {
  const contentClassName = [styles.content, className].filter(Boolean).join(' ');

  return (
    <BaseNavigationMenu.Content className={contentClassName}>
      {children}
    </BaseNavigationMenu.Content>
  );
};

const NavigationMenuLink: React.FC<{
  children: ReactNode;
  href: string;
  className?: string;
}> = ({ children, href, className }) => {
  const linkClassName = [styles.link, className].filter(Boolean).join(' ');

  return (
    <BaseNavigationMenu.Link href={href} className={linkClassName}>
      {children}
    </BaseNavigationMenu.Link>
  );
};

const NavigationMenuViewport: React.FC<{ className?: string }> = ({ className }) => {
  const viewportClassName = [styles.viewport, className].filter(Boolean).join(' ');
  return <BaseNavigationMenu.Viewport className={viewportClassName} />;
};

NavigationMenu.Item = NavigationMenuItem;
NavigationMenu.Trigger = NavigationMenuTrigger;
NavigationMenu.Content = NavigationMenuContent;
NavigationMenu.Link = NavigationMenuLink;
NavigationMenu.Viewport = NavigationMenuViewport;
