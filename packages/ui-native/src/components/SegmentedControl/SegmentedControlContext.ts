/**
 * SegmentedControlContext (native)
 *
 * Propagates the resolved group config + selection down to each
 * `SegmentedControl.Item`. Native peer of the web
 * `SegmentedControlContext` in `SegmentedControl.shared.ts` — merged with the
 * selection channel so items can read the active value and toggle it without a
 * second provider (mirrors the `TabsContext` + `TabsSelectionContext` split on
 * native, collapsed here because segments never render detached panels).
 */

import { createContext, useContext } from 'react';
import type {
  ResolvedSegmentedAppearance,
  SegmentedControlAttention,
  SegmentedControlShape,
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
  SegmentedControlType,
} from './interface';

export interface SegmentedControlContextValue {
  size: SegmentedControlSize;
  attention: SegmentedControlAttention;
  /** Resolved appearance for high/medium selected segments and slots. */
  appearance: ResolvedSegmentedAppearance;
  /** Selected-segment appearance when attention is `low` (parent Surface ?? neutral). */
  selectedAppearance: ResolvedSegmentedAppearance;
  /** Track (container) role — parent Surface appearance ?? neutral. */
  trackAppearance: ResolvedSegmentedAppearance;
  trackEmphasis: SegmentedControlTrackEmphasis;
  shape: SegmentedControlShape;
  type: SegmentedControlType;
  equalWidth: boolean;
  /** Whole-group disabled — items inherit it. */
  groupDisabled: boolean;
  /** Currently selected segment value. */
  selectedValue?: string;
  /** Select a segment by value. No-op when the group is disabled. */
  selectValue: (value: string) => void;
}

export const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  size: 'm',
  attention: 'high',
  appearance: 'primary',
  selectedAppearance: 'primary',
  trackAppearance: 'neutral',
  trackEmphasis: 'high',
  shape: 'pill',
  type: 'text',
  equalWidth: true,
  groupDisabled: false,
  selectValue: () => {},
});

export function useSegmentedControlContext(): SegmentedControlContextValue {
  return useContext(SegmentedControlContext);
}
