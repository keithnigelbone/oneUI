/**
 * Shared Header helpers — used by SecondaryNav and showcases.
 */

import React from 'react';
import type { HeaderItemProps } from './interface';

/** Stable React key when sibling HeaderItem values may repeat. */
export function headerItemElementKey(value: string, index: number): string {
  return `${value}-${index}`;
}

export function hasNonEmptyReactChildren(node: React.ReactNode): boolean {
  return React.Children.toArray(node).length > 0;
}

/** Dev-only: warn when children exist but no valid HeaderItem elements were collected. */
export function warnIfHeaderItemChildrenDropped(
  children: React.ReactNode,
  items: React.ReactElement<HeaderItemProps>[],
  context = 'SecondaryNav',
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (items.length > 0) return;
  if (!hasNonEmptyReactChildren(children)) return;
  // eslint-disable-next-line no-console
  console.warn(
    `${context}: children were provided but no valid HeaderItem elements were found. Pass HeaderItem elements (with a \`value\` prop) as direct children or inside a Fragment.`,
  );
}

/** Flatten Fragment wrappers (e.g. InteractiveNavItems) into HeaderItem elements. */
export function collectHeaderItemElements(
  node: React.ReactNode,
): React.ReactElement<HeaderItemProps>[] {
  const items: React.ReactElement<HeaderItemProps>[] = [];
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      items.push(
        ...collectHeaderItemElements((child.props as { children?: React.ReactNode }).children),
      );
      return;
    }
    const props = child.props as Partial<HeaderItemProps>;
    if (props.value != null) {
      items.push(child as React.ReactElement<HeaderItemProps>);
    }
  });
  return items;
}
