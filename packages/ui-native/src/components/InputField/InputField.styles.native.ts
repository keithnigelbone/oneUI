/**
 * InputField.styles.native.ts
 *
 * Geometry-only StyleSheet for the InputField aggregator. Mirrors the web
 * peer at `packages/ui/src/components/InputField/InputField.module.css`:
 *
 *   .field        → styles.field   (vertical stack, gap = Spacing-1-5)
 *   .labelArea    → styles.labelArea (label + description column)
 *   .labelRow     → styles.labelRow (label text + required + info-icon row)
 *
 * Brand paint (label / description colour, asterisk colour) merges inline in
 * `InputField.native.tsx` via `useSurfaceTokens`. Verified by
 * `pnpm check:literals`.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const styles = StyleSheet.create({
  // Root vertical stack — label → input → feedback → dynamic row.
  // Web: `.field { display: flex; flex-direction: column; gap: var(--Spacing-1-5); }`.
  field: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: tokens.spacing['1-5'],
    width: '100%',
  },

  // Label header column — label text + description, gap = Spacing-0-5.
  labelArea: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: tokens.spacing['0-5'],
    width: '100%',
  },

  // Single label row (string label + required asterisk + trailing info icon).
  // Web: `.labelRow { display: flex; align-items: center; justify-content:
  // flex-start; gap: var(--Spacing-1); }`. The info icon sits immediately
  // after the label + asterisk (left-aligned) — NOT pushed to the far edge.
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: tokens.spacing['1'],
    width: '100%',
  },

  // The label hugs its content (web `.label { flex: 0 1 auto; min-width: 0 }`)
  // so the trailing info icon follows it directly. `minWidth: 0` lets a long
  // label shrink/wrap instead of shoving the icon off-row.
  labelText: {
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
  },

  // Trailing info icon — content-sized, no auto margin (web `flex: 0 0 auto`),
  // so it stays adjacent to the label rather than the row's right edge.
  labelTrailing: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  description: {
    width: '100%',
  },
});
