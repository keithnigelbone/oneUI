/**
 * Select interface (native).
 *
 * Self-contained native prop contract (mirrors the web shared shape at
 * `packages/ui/src/components/Select/Select.shared.ts` without a cross-package
 * import — same pattern as Button/Input, so the published types + the sample
 * app resolve cleanly). `ComponentAppearance` comes from `@oneui/shared`, which
 * resolves on every platform. No Base UI — the dropdown is built from RN
 * primitives in `Select.native.tsx`.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

/** Which trigger surface opens the menu (Figma `trigger` axis). */
export type SelectTrigger = 'input' | 'button' | 'iconButton';
/** Menu behaviour: single / multi (checkboxes) / actions (fire + close). */
export type SelectMenuKind = 'single' | 'multi' | 'actions';
/** Where the menu opens relative to the trigger. */
export type SelectMenuDirection = 'below' | 'above' | 'alignWithTrigger';
/** Multi-accent appearance role. */
export type SelectAppearance = ComponentAppearance;
/** Attention for button / iconButton triggers. */
export type SelectAttention = 'high' | 'medium' | 'low';
/** Trigger / row size (aligns with Input + IconButton S/M/L). */
export type SelectSize = 's' | 'm' | 'l';

/** A selectable option (or an action row when `menu="actions"`). */
export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  secondaryText?: string;
  disabled?: boolean;
  icon?: ReactNode;
  color?: string;
  swatch?: string;
  badge?: string;
  group?: string;
}

/** A titled group of options rendered with a section divider + label. */
export interface SelectSection {
  id: string;
  label?: string;
}

/** Native Select props. */
export interface SelectProps<T extends string | number = string> {
  /** Options to display. */
  options: SelectOption<T>[];
  /** Optional sections; options grouped by `option.group`. */
  sections?: SelectSection[];
  /** Single-select value (controlled). */
  value?: T;
  /** Single-select change handler. */
  onChange?: (value: T) => void;
  /** Multi-select values (controlled, `menu="multi"`). */
  values?: T[];
  /** Multi-select change handler. */
  onValuesChange?: (values: T[]) => void;
  /** Fired for `menu="actions"` rows. */
  onAction?: (value: T) => void;
  /** Menu behaviour. @default "single" */
  menu?: SelectMenuKind;
  /** Trigger surface. @default "input" */
  trigger?: SelectTrigger;
  /** Where the menu opens. @default "below" */
  menuDirection?: SelectMenuDirection;
  /** Multi-accent role. 'auto' → 'primary'. @default "auto" */
  appearance?: SelectAppearance;
  /** Attention for button / iconButton triggers. @default "medium" */
  attention?: SelectAttention;
  /** Trigger size. @default "m" */
  size?: SelectSize;
  /** Show a search/filter input in the menu header. @default false */
  searchable?: boolean;
  /** Placeholder on the trigger when nothing is selected. */
  placeholder?: string;
  /** Disables the control. @default false */
  disabled?: boolean;
  /** Accessible name. */
  'aria-label'?: string;
  /** Field label above the `input` trigger. */
  label?: string;
  /** Description under the label. */
  description?: string;
  /** Marks the field required (renders `*`). */
  required?: boolean;
  /** Helper text under the `input` trigger. */
  helperText?: string;
  /** Feedback/error message under the `input` trigger. */
  feedback?: string;
  /** Error chrome on the `input` trigger. */
  errorHighlight?: boolean;
  /** Leading node inside the trigger. */
  start?: ReactNode;
  /** Icon for the `iconButton` trigger. */
  triggerIcon?: ReactNode;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Inline style on the root. */
  style?: ViewStyle;
  /** React Native test id. */
  testID?: string;
  /** Describes the result of activating the control. */
  accessibilityHint?: string;
}

export const DEFAULT_SELECT_SIZE: SelectSize = 'm';

export function resolveSelectSize(size?: SelectSize): SelectSize {
  return size === 's' || size === 'm' || size === 'l' ? size : DEFAULT_SELECT_SIZE;
}

export function resolveSelectAppearance(
  appearance?: SelectAppearance,
): Exclude<SelectAppearance, 'auto'> {
  return !appearance || appearance === 'auto' ? 'primary' : appearance;
}

export function resolveSelectMenu(menu?: SelectMenuKind): SelectMenuKind {
  return menu ?? 'single';
}

export function resolveSelectTrigger(trigger?: SelectTrigger): SelectTrigger {
  return trigger ?? 'input';
}

/** Group options into ordered sections for rendering. */
export function groupSelectOptions<T extends string | number>(
  options: SelectOption<T>[],
  sections?: SelectSection[],
): Array<{ section: SelectSection | null; options: SelectOption<T>[] }> {
  if (!sections || sections.length === 0) {
    return [{ section: null, options }];
  }
  const byId = new Map<string, SelectOption<T>[]>();
  const ungrouped: SelectOption<T>[] = [];
  for (const opt of options) {
    if (opt.group && sections.some((s) => s.id === opt.group)) {
      const bucket = byId.get(opt.group) ?? [];
      bucket.push(opt);
      byId.set(opt.group, bucket);
    } else {
      ungrouped.push(opt);
    }
  }
  const groups: Array<{ section: SelectSection | null; options: SelectOption<T>[] }> =
    sections.map((section) => ({ section, options: byId.get(section.id) ?? [] }));
  if (ungrouped.length > 0) groups.push({ section: null, options: ungrouped });
  return groups;
}

export interface SelectResolvedState<T extends string | number = string> {
  trigger: SelectTrigger;
  menu: SelectMenuKind;
  menuDirection: SelectMenuDirection;
  appearance: Exclude<SelectAppearance, 'auto'>;
  size: SelectSize;
  isDisabled: boolean;
  isMulti: boolean;
  selectedValue: T | undefined;
  selectedValues: T[];
}

/** Pure resolver — normalises props into the rendering config. */
export function useSelectState<T extends string | number = string>(
  props: SelectProps<T>,
): SelectResolvedState<T> {
  const menu = resolveSelectMenu(props.menu);
  return {
    trigger: resolveSelectTrigger(props.trigger),
    menu,
    menuDirection: props.menuDirection ?? 'below',
    appearance: resolveSelectAppearance(props.appearance),
    size: resolveSelectSize(props.size),
    isDisabled: props.disabled ?? false,
    isMulti: menu === 'multi',
    selectedValue: props.value,
    selectedValues: props.values ?? [],
  };
}

/** Accessibility props for the trigger wrapper. */
export function getSelectAccessibilityProps<T extends string | number>(
  props: SelectProps<T>,
  state: SelectResolvedState<T>,
  isOpen: boolean,
): {
  accessibilityRole: 'none';
  'aria-label'?: string;
  'aria-expanded': boolean;
  'aria-haspopup': 'listbox' | 'menu';
  accessibilityState: { disabled: boolean; expanded: boolean };
  accessibilityHint?: string;
} {
  return {
    accessibilityRole: 'none',
    'aria-label': props['aria-label'] ?? props.label,
    'aria-expanded': isOpen,
    'aria-haspopup': state.menu === 'actions' ? 'menu' : 'listbox',
    accessibilityState: { disabled: state.isDisabled, expanded: isOpen },
    accessibilityHint: props.accessibilityHint,
  };
}

/** Compute the displayed trigger text from current selection. */
export function selectTriggerText<T extends string | number>(
  options: SelectOption<T>[],
  state: SelectResolvedState<T>,
  placeholder?: string,
): { text: string; isPlaceholder: boolean } {
  if (state.isMulti) {
    const count = state.selectedValues.length;
    if (count === 0) return { text: placeholder ?? 'Select…', isPlaceholder: true };
    if (count === 1) {
      const only = options.find((o) => o.value === state.selectedValues[0]);
      return { text: only?.label ?? `${count} selected`, isPlaceholder: false };
    }
    return { text: `${count} selected`, isPlaceholder: false };
  }
  const selected = options.find((o) => o.value === state.selectedValue);
  if (!selected) return { text: placeholder ?? 'Select…', isPlaceholder: true };
  return { text: selected.label, isPlaceholder: false };
}
