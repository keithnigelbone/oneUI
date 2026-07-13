/**
 * TabGroup.tsx — flat API that matches Figma layer naming.
 *
 * Wraps `<Tabs.Root>` and auto-renders an inner `<Tabs.List>` (with an
 * auto `<Tabs.Indicator />`). Propagates size / appearance / orientation
 * to child TabItems via TabsContext.
 *
 * Smart child splitting: direct `TabPanel` children are rendered as siblings
 * of the List (still inside Root, which is what Base UI requires). Everything
 * else (TabItems, dividers, custom wrappers) goes inside the List.
 *
 * @example
 * ```tsx
 * <TabGroup size="m" orientation="horizontal" defaultValue="home">
 *   <TabItem value="home">Home</TabItem>
 *   <TabItem value="inbox" end={<CounterBadge value={3} />}>Inbox</TabItem>
 *   <TabPanel value="home">Home content</TabPanel>
 *   <TabPanel value="inbox">Inbox content</TabPanel>
 * </TabGroup>
 * ```
 */

'use client';

import React, { isValidElement, useMemo } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import clsx from 'clsx';
import styles from './Tabs.module.css';
import type { TabGroupProps } from './Tabs.shared';
import { TabsContext } from './TabsContext';
import { Tabs } from './Tabs';
import { useSurfaceAppearance } from '../Surface';

/** Detect a TabPanel child by reference — both flat `TabPanel` and compound `Tabs.Panel` resolve to the same component. */
function isTabPanelChild(node: React.ReactNode): boolean {
  if (!isValidElement(node)) return false;
  return node.type === Tabs.Panel;
}

export function TabGroup({
  children,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  size = 'm',
  appearance = 'auto',
  activateOnFocus = false,
  loopFocus = true,
  showIndicator = true,
  className,
  style,
  ref,
}: TabGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance =
    appearance && appearance !== 'auto'
      ? appearance
      : (parentAppearance ?? 'primary');

  const contextValue = useMemo(
    () => ({ size, orientation, appearance: resolvedAppearance }),
    [size, orientation, resolvedAppearance],
  );

  // Split children: panels render as siblings of List (still inside Root).
  const { items, panels } = useMemo(() => {
    const items: React.ReactNode[] = [];
    const panels: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (isTabPanelChild(child)) {
        panels.push(child);
      } else {
        items.push(child);
      }
    });
    return { items, panels };
  }, [children]);

  const listCls = clsx(styles.list, className);

  return (
    <TabsContext.Provider value={contextValue}>
      <BaseTabs.Root
        ref={ref}
        value={value ?? undefined}
        defaultValue={defaultValue ?? undefined}
        onValueChange={onValueChange as any}
        orientation={orientation}
        className={styles.root}
        style={style}
      >
        <BaseTabs.List
          activateOnFocus={activateOnFocus}
          loopFocus={loopFocus}
          className={listCls}
          data-size={size}
          data-appearance={resolvedAppearance}
          data-orientation={orientation}
        >
          {items}
          {showIndicator && (
            <BaseTabs.Indicator
              className={styles.selectedIndicator}
              data-orientation={orientation}
            />
          )}
        </BaseTabs.List>
        {panels}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
}
