/**
 * TabPanel.tsx — flat API alias for `Tabs.Panel`.
 *
 * Lives outside TabGroup so callers can declare panels alongside (or below)
 * their TabGroup without nesting them inside the group's list.
 *
 * @example
 * ```tsx
 * <TabGroup value={v} onValueChange={setV}>
 *   <TabItem value="a">A</TabItem>
 *   <TabItem value="b">B</TabItem>
 * </TabGroup>
 * <TabPanel value="a">Panel A</TabPanel>
 * <TabPanel value="b">Panel B</TabPanel>
 * ```
 */

'use client';

import { Tabs } from './Tabs';
import type { TabPanelProps } from './Tabs.shared';

export const TabPanel: typeof Tabs.Panel = Tabs.Panel;
export type { TabPanelProps };
