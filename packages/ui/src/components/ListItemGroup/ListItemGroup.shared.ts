/**
 * ListItemGroup.shared.ts
 * Types for the ListItemGroup layout primitive.
 *
 * ListItemGroup is a thin shell that stacks <ListItem> children vertically,
 * optionally drawing a top hairline (`sectionDivider`) and framing the
 * block as an inset rounded card. The group can also inject a uniform
 * inter-row `divider` style into its <ListItem> children — children that
 * declare their own `divider` prop win over the group default.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ListItemDivider } from '../ListItem/ListItem.shared';

/** Container framing. `fullWidth` = edge-to-edge; `inset` = rounded card with horizontal margin. */
export type ListItemGroupContainer = 'fullWidth' | 'inset';

/** ARIA role for the group landmark. `'group'` is the default; use `'list'` when children are a true list. */
export type ListItemGroupRole = 'group' | 'list' | 'menu';

/** Re-exported for convenience. Same union as `ListItemDivider`. */
export type ListItemGroupDivider = ListItemDivider;

export interface ListItemGroupProps {
  /** <ListItem> children — maps to Figma's `content` slot. Optional so empty groups are valid. */
  children?: ReactNode;
  /** Top edge-to-edge hairline above the first row. Default: true. */
  sectionDivider?: boolean;
  /** Container framing. Default: 'fullWidth'. */
  container?: ListItemGroupContainer;
  /**
   * Inter-row divider style injected into all <ListItem> children. Matches Figma's
   * `divider` group property (`none` | `full` | `inset`). Per-child `divider` prop
   * overrides the group default. The last row auto-suppresses via `:last-child` so
   * there's no dangling hairline. Default: `'inset'`.
   */
  divider?: ListItemGroupDivider;
  /** Group landmark role. Default: 'group'. */
  role?: ListItemGroupRole;
  /** Accessible name for the group landmark. */
  'aria-label'?: string;
  /** Additional CSS class on the root. */
  className?: string;
  /** Inline styles on the root. */
  style?: CSSProperties;
}
