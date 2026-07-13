/**
 * RadioField.styles.native.ts
 *
 * Static layout for `RadioField` — mirrors `RadioField.module.css` plus the
 * `FieldLabelStack` legend layout used in multi-option mode. Token-only.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const FIELD_DISABLED_OPACITY = 0.5;

/** S/M/L → Body size token (label header). */
export const FIELD_HEADER_LABEL_SIZE = {
  s: 'S',
  m: 'M',
  l: 'L',
} as const;

/** Description always renders one tier smaller than the label. */
export const FIELD_HEADER_DESCRIPTION_SIZE = 'S' as const;

/** Feedback / dynamic-text body size by field size. */
export const FIELD_FEEDBACK_BODY_SIZE = {
  s: 'XS',
  m: 'S',
  l: 'M',
} as const;

export const styles = StyleSheet.create({
  field: {
    flexDirection: 'column',
    gap: tokens.spacing['1-5'],
    alignItems: 'flex-start',
    width: 'auto',
  },
  fieldFullWidth: {
    width: '100%',
  },

  // ─── Multi-option header (label + description) ─────────────────────────
  fieldset: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacing['1'],
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: tokens.spacing['1'],
  },
  legendLabel: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['0-5'],
  },
  legendTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },

  // ─── Integrated single-option layout ───────────────────────────────────
  integratedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: tokens.spacing['1'],
  },
  integratedLabelColumn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    gap: tokens.spacing['1'],
  },

  controlStretch: {
    width: '100%',
  },

  // ─── Multi-option Radio stack ──────────────────────────────────────────
  // Replaces the previous `<RadioGroup>` wrapper — RadioField stacks the
  // cloned Radio options itself now that the group orchestrator is gone.
  groupVertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacing['3-5'],
    width: '100%',
  },
  groupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacing['4'],
    width: '100%',
  },

  // ─── Feedback / dynamic rows ───────────────────────────────────────────
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: tokens.spacing['2'],
  },
  dynamicLeading: {
    flex: 1,
    minWidth: 0,
  },
});
