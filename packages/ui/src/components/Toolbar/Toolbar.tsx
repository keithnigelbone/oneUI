/**
 * Toolbar.tsx
 * React (web) implementation using Base UI Toolbar
 *
 * Key features:
 * - Uses @base-ui/react Toolbar primitive (never fork)
 * - Token-only styling in CSS Module
 * - Interactive shape = Shape-M
 * - WCAG AA accessible with keyboard navigation (Arrow keys)
 * - Supports horizontal and vertical orientation
 */

import React from 'react';
import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import styles from './Toolbar.module.css';
import { ToolbarProps } from './Toolbar.shared';

export const Toolbar: React.FC<ToolbarProps> & {
  Button: typeof BaseToolbar.Button;
  Link: typeof BaseToolbar.Link;
  Separator: typeof ToolbarSeparator;
  Group: typeof BaseToolbar.Group;
} = ({
  children,
  orientation = 'horizontal',
  className,
  style,
}) => {
  const toolbarClassName = [styles.toolbar, className].filter(Boolean).join(' ');

  return (
    <BaseToolbar.Root orientation={orientation} className={toolbarClassName} style={style}>
      {children}
    </BaseToolbar.Root>
  );
};

const ToolbarSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <BaseToolbar.Separator className={className} />;
};

Toolbar.Button = BaseToolbar.Button;
Toolbar.Link = BaseToolbar.Link;
Toolbar.Separator = ToolbarSeparator;
Toolbar.Group = BaseToolbar.Group;
