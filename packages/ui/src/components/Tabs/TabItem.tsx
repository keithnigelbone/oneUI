/**
 * TabItem.tsx — flat API that matches Figma layer naming.
 *
 * Alias for `Tabs.Item` — same component, same behavior, exported under
 * the Figma-aligned name so callers can write:
 *
 * @example
 * ```tsx
 * <TabGroup>
 *   <TabItem value="home">Home</TabItem>
 * </TabGroup>
 * ```
 *
 * Consumes `TabsContext` for size / appearance / orientation defaults
 * (item-level props always win).
 */

'use client';

import { Tabs } from './Tabs';
import type { TabItemProps } from './Tabs.shared';

export const TabItem: typeof Tabs.Item = Tabs.Item;
export type { TabItemProps };
