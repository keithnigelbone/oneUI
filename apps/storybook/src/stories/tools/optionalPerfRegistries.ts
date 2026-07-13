/**
 * Dynamically loads perf registry chunks for third-party libraries. Missing
 * packages must not break Storybook — failed imports are swallowed.
 */

import type { TestComponentEntry } from './componentRegistry.types';

export async function loadOptionalPerfRegistries(): Promise<TestComponentEntry[]> {
  const out: TestComponentEntry[] = [];

  try {
    const base = await import('./componentRegistry.baseui');
    out.push(...base.BASEUI_COMPONENTS);
  } catch {
    /* @base-ui/react not installed or incompatible */
  }

  try {
    const radix = await import('./componentRegistry.radix');
    out.push(...radix.RADIX_COMPONENTS);
  } catch {
    /* @radix-ui/* not installed or incompatible */
  }

  try {
    const mui = await import('./componentRegistry.mui');
    out.push(...mui.MUI_COMPONENTS);
  } catch {
    /* @mui/material not installed or incompatible */
  }

  try {
    const mantine = await import('./componentRegistry.mantine');
    out.push(...mantine.MANTINE_COMPONENTS);
  } catch {
    /* @mantine/core not installed or incompatible */
  }

  return out;
}
