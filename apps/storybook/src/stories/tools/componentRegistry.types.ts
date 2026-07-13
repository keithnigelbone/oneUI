/**
 * Shared types for the perf-tool component registry. Pulled into a separate
 * module so optional per-library entry files can reference `TestComponentEntry`
 * without importing the full registry (which would create a cycle).
 */

import type { ReactNode } from 'react';

export type LibraryId = 'oneui' | 'mui' | 'mantine' | 'baseui' | 'radix';

export interface TestComponentEntry {
  id: string;
  label: string;
  library: LibraryId;
  /**
   * Cross-library perf row — when set, the harness can suggest/select
   * counterparts in other enabled libraries.
   */
  familyKey?: string;
  /**
   * Render one instance. `tick` is bumped each Update-test iteration so the
   * returned element must depend on it for a real React commit to happen —
   * otherwise React will bail out and the update phase never fires.
   */
  renderInstance: (i: number, tick: number) => ReactNode;
}

/** Stable sort order for components inside a family row in the picker UI. */
export const PERF_LIBRARY_ORDER: LibraryId[] = [
  'oneui',
  'baseui',
  'radix',
  'mui',
  'mantine',
];

export const LIBRARY_LABELS: Record<LibraryId, string> = {
  oneui: 'OneUI',
  mui: 'MUI',
  mantine: 'Mantine',
  baseui: 'Base UI (floor)',
  radix: 'Radix (shadcn primitives)',
};
