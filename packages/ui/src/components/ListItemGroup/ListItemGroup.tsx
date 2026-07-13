/**
 * ListItemGroup.tsx
 * Layout shell that stacks <ListItem> children and optionally draws a top
 * section divider + inset rounded frame.
 *
 * API mirrors Figma's `ListItemGroup` (file F7KEYdO8R8Nbe2N4gI8dIU) 1:1:
 *   content         → React children (ListItem[])
 *   sectionDivider  → top hairline (default true)
 *
 * Plus one layout extension (`container`) to match the `inset` framing
 * used in most compositions, and standard a11y props.
 *
 * The group does NOT inject divider state into its children. Consumers set
 * `<ListItem divider="inset" />` per row as needed. This matches the Figma
 * model where the divider is a property of the ListItem, not the group.
 *
 * @example
 * ```tsx
 * <ListItemGroup aria-label="Airplane & network" container="inset">
 *   <ListItem title="Airplane Mode" start={<Icon name="plane" />} end={<Switch />} divider="inset" />
 *   <ListItem title="Wi-Fi" start={<Icon name="wifi" />} end={<Icon name="chevronRight" />} divider="inset" />
 *   <ListItem title="Bluetooth" start={<Icon name="bluetooth" />} end={<Icon name="chevronRight" />} />
 * </ListItemGroup>
 * ```
 */

'use client';

import React, { Children, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';
import styles from './ListItemGroup.module.css';
import { ListItem } from '../ListItem';
import type { ListItemProps } from '../ListItem/ListItem.shared';
import type { ListItemGroupProps } from './ListItemGroup.shared';

export const ListItemGroup = React.forwardRef<HTMLDivElement, ListItemGroupProps>(function ListItemGroup(
  {
    children,
    sectionDivider = true,
    container = 'fullWidth',
    divider = 'inset',
    role = 'group',
    'aria-label': ariaLabel,
    className,
    style,
  },
  ref,
) {
    // Inject the group's `divider` into <ListItem> children unless they specified
    // their own. Non-ListItem children (and Fragments) pass through untouched.
    const decoratedChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      if (child.type !== ListItem) return child;
      const childProps = child.props as ListItemProps;
      if (childProps.divider !== undefined) return child;
      return cloneElement(child as React.ReactElement<ListItemProps>, { divider });
    });

    return (
      <div
        ref={ref}
        role={role}
        aria-label={ariaLabel}
        className={clsx(styles.root, className)}
        style={style}
        data-section-divider={sectionDivider ? '' : undefined}
        data-container={container}
      >
        {decoratedChildren}
      </div>
    );
});
