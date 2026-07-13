/**
 * Checkbox interface (native)
 *
 * Mirrors `packages/ui/src/components/Checkbox/Checkbox.shared.ts` —
 * `appearance` drives BOTH the unchecked context (border, hover) and the
 * checked-state fill. `appearance="auto"` resolves to the **secondary**
 * stack on both platforms.
 *
 * Cross-check: Layers `JDSCheckbox` (`libs/react-4/.../jdscheckbox-4` +
 * `libs/react-native/.../jdscheckbox`) — Layers exposes
 *   - `selected` instead of `checked`
 *   - `accent: 'auto' | 'primary' | 'secondary' | 'sparkle'` (legacy alias,
 *     ignored at runtime in OneUI; kept for API symmetry)
 *   - `ariaLabel` / `ariaDescribedby` (camelCase) — OneUI uses dashed
 *     `aria-label` / `aria-describedby` so component code looks the same
 *     as the web peer.
 *
 * Native props differ from web in three ways:
 *   1. Field-stack helpers (`labelAssociation`, `labelWrapper`,
 *      `labelSuffixInside`, `labelTrailing`, `supplementaryDescribedById`)
 *      are dropped — RN does not have a corresponding `<Field>` wrapper. A
 *      `description` string is still rendered next to the box.
 *   2. Form-only props (`name`, `value`, `required`, `id`, `data-testid`,
 *      `className`) are dropped. `testID` replaces `data-testid`.
 *   3. `style` is `ViewStyle`, not `CSSProperties`.
 *
 * No imports from `@oneui/ui/components/Checkbox/shared` — the contract is
 * owned here per the native build playbook.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type CheckboxAppearance = ComponentAppearance;

/**
 * @deprecated Ignored at runtime — use `appearance` for colour. Kept for
 * Layers/web parity so existing call sites continue to type-check.
 */
export type CheckboxAccent = 'primary' | 'secondary' | 'sparkle';

/**
 * Checkbox sizes aligned with Figma spec: S, M, L. Legacy
 * `'small' | 'medium' | 'large'` aliases accepted for transitional call
 * sites; both web and native canonicalise to `'s' | 'm' | 'l'`.
 */
export type CheckboxSize = 's' | 'm' | 'l' | 'small' | 'medium' | 'large';

const SIZE_ALIASES: Record<string, 's' | 'm' | 'l'> = {
  small: 's',
  medium: 'm',
  large: 'l',
};

/** Resolve any `CheckboxSize` to canonical `'s' | 'm' | 'l'`. */
export function resolveSize(size: CheckboxSize): 's' | 'm' | 'l' {
  return SIZE_ALIASES[size] ?? (size as 's' | 'm' | 'l');
}

export interface CheckboxProps {
  /** Visible label beside the control (string). */
  label?: string;
  /**
   * Supplementary copy below the label row when using the integrated stack
   * (mirrors `Input.description`). Plain text only — RN renders this in a
   * second `<Text>` row beside the box.
   */
  description?: string;
  /**
   * Rendered inline after `label` text — used by `CheckboxField` to inject a
   * required-asterisk node into the integrated label row.
   */
  labelSuffixInside?: ReactNode;
  /**
   * Rendered after the label/description column on the same row — used by
   * `CheckboxField` for the trailing `infoIconSlot` (e.g. info `IconButton`).
   */
  labelTrailing?: ReactNode;
  /**
   * Optional identifier for this option. Not used by Checkbox itself, but
   * higher-level orchestrators (e.g. `CheckboxField` multi-option mode)
   * read it to map each Checkbox child to a selection key.
   */
  value?: string;
  /** Invalid chrome on the wrapper (mirrors `Input.errorHighlight`). */
  errorHighlight?: boolean;
  /** Whether the checkbox is selected (controlled). */
  selected?: boolean;
  /** Default selected state (uncontrolled). */
  defaultSelected?: boolean;
  /** Whether the checkbox is in indeterminate (mixed) state. */
  indeterminate?: boolean;
  /** Change handler — fires with the next selected value on press. */
  onSelectedChange?: (selected: boolean) => void;
  /** Press handler (alias for `onSelectedChange` toggle — mirrors RN convention). */
  onPress?: () => void;
  /** Size preset. Default: `'m'`. */
  size?: CheckboxSize;
  /** Appearance role — border, hover, and checked fill. `auto` → secondary stack. */
  appearance?: CheckboxAppearance;
  /** @deprecated Ignored — use `appearance` only. */
  accent?: CheckboxAccent;
  /** Whether the checkbox is disabled (non-interactive, dimmed). */
  disabled?: boolean;
  /** Whether the checkbox is read-only (visually distinct from disabled — solid dark fill). */
  readOnly?: boolean;
  /** Inline native styles. */
  style?: ViewStyle;
  /** Accessible name when there is no `label` (RN `accessibilityLabel`). */
  'aria-label'?: string;
  /** Describes the element via `accessibilityLabelledBy` on RN. */
  'aria-describedby'?: string;
  /** Invalid state for assistive tech — paired with `errorHighlight` chrome. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Hide the checkbox from the accessibility tree. */
  'aria-hidden'?: boolean;
  /** Describes the result of toggling the control (React Native). */
  accessibilityHint?: string;
  /** React Native test identifier — forwarded to the Pressable. */
  testID?: string;
}

/** @deprecated Prefer `CheckboxProps` — kept for transitional imports. */
export type CheckboxNativeProps = CheckboxProps;

/**
 * Resolve a `CheckboxProps` shape into the runtime decisions used by
 * `Checkbox.native.tsx`. Mirrors `useCheckboxState` in
 * `Checkbox.shared.ts`:
 *
 *   - `auto`/missing appearance → `secondary`
 *   - legacy size aliases canonicalise to `'s' | 'm' | 'l'`
 *   - `dataAttrs` are kept for API symmetry with web (web uses them as
 *     CSS selectors); native does not consume them today.
 */
export function useCheckboxState(
  props: Pick<
    CheckboxProps,
    | 'appearance'
    | 'accent'
    | 'disabled'
    | 'readOnly'
    | 'size'
    | 'selected'
    | 'defaultSelected'
    | 'indeterminate'
  >,
): {
  isDisabled: boolean;
  isReadOnly: boolean;
  resolvedAppearance: Exclude<ComponentAppearance, 'auto'>;
  resolvedSize: 's' | 'm' | 'l';
  dataAttrs: Record<string, string | undefined>;
} {
  const isDisabled = props.disabled ?? false;
  const isReadOnly = props.readOnly ?? false;
  const rawAppearance = props.appearance;
  const isAutoAppearance = !rawAppearance || rawAppearance === 'auto';
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> = isAutoAppearance
    ? 'secondary'
    : (rawAppearance as Exclude<ComponentAppearance, 'auto'>);
  const resolvedSize = resolveSize(props.size ?? 'm');

  const isIndeterminate = props.indeterminate === true;
  const isSelected = isIndeterminate ? false : (props.selected ?? props.defaultSelected ?? false);

  return {
    isDisabled,
    isReadOnly,
    resolvedAppearance,
    resolvedSize,
    dataAttrs: {
      'data-size': resolvedSize,
      'data-appearance': resolvedAppearance,
      ...(isReadOnly ? { 'data-readonly': '' } : {}),
      ...(isIndeterminate
        ? { 'data-indeterminate': '' }
        : isSelected
          ? { 'data-selected': '' }
          : { 'data-unselected': '' }),
    },
  };
}

/**
 * Map `CheckboxProps` to React Native accessibility props.
 *
 * Native checkbox is interactive (web `<BaseCheckbox.Root>` renders a
 * focusable element with `role="checkbox"`); the RN peer uses
 * `accessibilityRole: 'checkbox'` and exposes the tri-state via
 * `accessibilityState.checked`:
 *   - `'mixed'` when `indeterminate`
 *   - boolean `true | false` for the determinate states
 *
 * Read-only is conveyed via `accessibilityState.disabled = false` plus the
 * `accessibilityHint` (RN has no native read-only flag); disabled uses the
 * standard `accessibilityState.disabled = true`.
 */
export function getCheckboxAccessibilityProps(
  props: Pick<
    CheckboxProps,
    | 'aria-label'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-hidden'
    | 'label'
    | 'accessibilityHint'
  >,
  state: {
    isDisabled: boolean;
    isReadOnly: boolean;
    isSelected: boolean;
    isIndeterminate: boolean;
  },
): {
  accessible: boolean;
  focusable?: boolean;
  accessibilityRole: 'checkbox';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: {
    disabled: boolean;
    checked: boolean | 'mixed';
  };
  accessibilityLabelledBy?: string;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  'aria-disabled'?: boolean;
  'aria-readonly'?:boolean;
} {
  const ariaHidden = props['aria-hidden'] === true;
  const accessibilityLabel = props['aria-label'] ?? props.label ?? undefined;

  const accessibilityState = {
    disabled: state.isDisabled || state.isReadOnly,
    checked: state.isIndeterminate ? ('mixed' as const) : state.isSelected,
  };

  return {
    accessible: !ariaHidden,
    focusable: !ariaHidden,
    accessibilityRole: 'checkbox',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState,
    ...(props['aria-describedby']
      ? { accessibilityLabelledBy: props['aria-describedby'] }
      : {}),
    'aria-disabled': state.isDisabled || undefined,
    'aria-readonly': state.isReadOnly || undefined,
    accessibilityElementsHidden: ariaHidden,
    importantForAccessibility: ariaHidden ? 'no-hide-descendants' : undefined,
  };
}
