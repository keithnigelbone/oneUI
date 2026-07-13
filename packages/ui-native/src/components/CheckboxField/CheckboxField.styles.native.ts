/**
 * CheckboxField.styles.native.ts
 *
 * Static layout for `CheckboxField`. Mirrors the structural rules in
 * `packages/ui/src/components/CheckboxField/CheckboxField.module.css` and
 * the `FieldLabelStack.module.css` legend layout used in multi-option mode.
 *
 * Geometry only — every colour comes from theme tokens at render time
 * (`useSurfaceTokens`, `useTypographyTokens`). No literals beyond `0`,
 * `1` (flex), and the disabled opacity constant — all spacing and stroke
 * widths come from `@oneui/tokens`.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const FIELD_DISABLED_OPACITY = 0.5;

/** Matches web S/M/L → Body size token mapping. Used for header text. */
export const FIELD_HEADER_LABEL_SIZE = {
  s: 'S',
  m: 'M',
  l: 'L',
} as const;

/** Description always renders one tier smaller than the label, like Input. */
export const FIELD_HEADER_DESCRIPTION_SIZE = 'S' as const;

/** Feedback / dynamic-text body size by field size. */
export const FIELD_FEEDBACK_BODY_SIZE = {
  s: 'XS',
  m: 'S',
  l: 'M',
} as const;

export const styles = StyleSheet.create({
  /** Outer `<View>` — vertical stack of header + control + feedback + dynamic. */
  field: {
    flexDirection: 'column',
    gap: tokens.spacing['1-5'],
    alignItems: 'flex-start',
    width: 'auto',
  },
  fieldFullWidth: {
    width: '100%',
  },
  /** Multi-option header (label + description) above the checkbox list. */
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
    flex: 1,
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
  /** Stack of `<Checkbox>` items in multi-option mode. */
  multiOptions: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacing['1-5'],
    width: '100%',
  },
  /** Stretch the inner control to the full width when `fullWidth`. */
  controlStretch: {
    width: '100%',
  },
  /** Single inline row with feedback / dynamic content. */
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
