/**
 * Select.shared.ts
 * Shared, platform-agnostic types + pure helpers for the Select micropattern.
 * Parity contract enforced by `scripts/check-parity.ts` against native `interface.ts`.
 */

import type { ComponentAppearance, ComponentIconInput } from '@oneui/shared';
import type { ReactElement, ReactNode } from 'react';
import type { InputAppearance, InputAttention, InputShape } from '../Input/Input.shared';
import { FIGMA_SELECT_PLACEHOLDER } from './Select.figma';

/** Internal trigger kind (web + native). */
export type SelectTrigger = 'input' | 'button' | 'iconButton';

/** Figma `trigger` axis labels. */
export type SelectTriggerFigma =
  | 'selectableInput'
  | 'selectableButton'
  | 'selectableIconButton';

/** Menu behaviour (internal). */
export type SelectMenuKind = 'single' | 'multi' | 'actions';

/** Figma `menuType` axis labels. */
export type SelectMenuTypeFigma = 'singleSelect' | 'multiSelect' | 'actions';

/** Where the menu opens relative to the trigger. */
export type SelectMenuDirection = 'below' | 'above' | 'alignWithTrigger';

/** Menu alignment relative to trigger. */
export type SelectMenuAlignment = 'start' | 'middle' | 'end' | 'fill';

/** Menu width / density preset. */
export type SelectMenuSize = 'xs' | 's' | 'm' | 'l' | 'fill';

export type SelectAppearance = ComponentAppearance;
export type SelectAttention = 'high' | 'medium' | 'low';
export type SelectSize = 's' | 'm' | 'l';

/** Legacy web size aliases (platform app). */
export type SelectLegacySize = 'sm' | 'md' | 'lg';

export type SelectInputAttention = InputAttention;
export type SelectInputShape = InputShape;

export type SelectInputStart = 'none' | 'icon' | 'avatar' | 'image' | 'text';

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

export interface SelectSection {
  id: string;
  label?: string;
}

export interface SelectBaseProps<T extends string | number = string> {
  options: SelectOption<T>[];
  sections?: SelectSection[];
  value?: T;
  onChange?: (value: T) => void;
  /** Alias for controlled single-select updates (Figma / Base UI naming). */
  onValueChange?: (value: T) => void;
  values?: T[];
  onValuesChange?: (values: T[]) => void;
  onAction?: (value: T) => void;
  /** @default "single" */
  menu?: SelectMenuKind | SelectMenuTypeFigma;
  /** Figma alias for `menu`. */
  menuType?: SelectMenuTypeFigma;
  /** @default "input" */
  trigger?: SelectTrigger | SelectTriggerFigma;
  /** @default "below" */
  menuDirection?: SelectMenuDirection;
  /** @default "start" */
  menuAlignment?: SelectMenuAlignment;
  /** @default "m" */
  menuSize?: SelectMenuSize;
  /** @default "auto" */
  appearance?: SelectAppearance;
  /** Button / iconButton trigger prominence. @default "medium" */
  attention?: SelectAttention;
  /** Trigger size. @default "m" */
  size?: SelectSize | SelectLegacySize;
  /** Show search input in menu header. @default false */
  searchable?: boolean;
  /** Figma alias for `searchable`. */
  showSearch?: boolean;
  /** Figma alias — section headers when `sections` provided. */
  groups?: boolean;
  /** When true, options may render `secondaryText`. */
  secondaryText?: boolean;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  /** Controlled open state (menu visibility). */
  open?: boolean;

  // ── SelectableInput (input trigger) ─────────────────────────────────────
  label?: string;
  description?: string;
  required?: boolean;
  helperText?: string;
  feedback?: string;
  invalid?: boolean;
  filled?: boolean;
  shape?: SelectInputShape;
  inputAttention?: SelectInputAttention;
  start?: ReactNode;
  /** Figma `start` preset when `start` node is not provided. */
  inputStart?: SelectInputStart;
  infoIcon?: boolean;

  // ── SelectableButton ────────────────────────────────────────────────────
  condensed?: boolean;
  contained?: boolean;
  chevron?: boolean;
  triggerLabel?: string;

  // ── SelectableIconButton ────────────────────────────────────────────────
  // Feeds IconButton's `icon`, which accepts an icon name/component or a ready
  // element — not an arbitrary ReactNode.
  triggerIcon?: ComponentIconInput | ReactElement;
}

export const DEFAULT_SELECT_SIZE: SelectSize = 'm';

const TRIGGER_FIGMA_MAP: Record<SelectTriggerFigma, SelectTrigger> = {
  selectableInput: 'input',
  selectableButton: 'button',
  selectableIconButton: 'iconButton',
};

const MENU_FIGMA_MAP: Record<SelectMenuTypeFigma, SelectMenuKind> = {
  singleSelect: 'single',
  multiSelect: 'multi',
  actions: 'actions',
};

const LEGACY_SIZE_MAP: Record<SelectLegacySize, SelectSize> = {
  sm: 's',
  md: 'm',
  lg: 'l',
};

export function normalizeSelectTrigger(
  trigger?: SelectTrigger | SelectTriggerFigma,
): SelectTrigger {
  if (!trigger) return 'input';
  if (trigger in TRIGGER_FIGMA_MAP) {
    return TRIGGER_FIGMA_MAP[trigger as SelectTriggerFigma];
  }
  return trigger as SelectTrigger;
}

export function normalizeSelectMenu(
  menu?: SelectMenuKind | SelectMenuTypeFigma,
): SelectMenuKind {
  if (!menu) return 'single';
  if (menu in MENU_FIGMA_MAP) {
    return MENU_FIGMA_MAP[menu as SelectMenuTypeFigma];
  }
  return menu as SelectMenuKind;
}

export function resolveSelectSize(size?: SelectSize | SelectLegacySize): SelectSize {
  if (!size) return DEFAULT_SELECT_SIZE;
  if (size in LEGACY_SIZE_MAP) return LEGACY_SIZE_MAP[size as SelectLegacySize];
  return size === 's' || size === 'm' || size === 'l' ? size : DEFAULT_SELECT_SIZE;
}

/**
 * Narrow the Select's `ComponentAppearance` (9 roles) to the `InputAppearance`
 * accepted by the underlying Input/InputField trigger, which has no `brand-bg`.
 * `brand-bg` (and an unset value) fall back to `primary`; every other role is
 * identical in both unions.
 */
export function selectAppearanceToInputAppearance(
  appearance?: ComponentAppearance,
): InputAppearance {
  return appearance == null || appearance === 'brand-bg' ? 'primary' : appearance;
}

export function resolveDefaultMenuAlignment(
  props: Pick<SelectBaseProps, 'trigger' | 'menu' | 'menuAlignment'>,
): SelectMenuAlignment {
  if (props.menuAlignment) return props.menuAlignment;
  const trigger = resolveSelectTrigger(props.trigger);
  if (trigger === 'input') return 'fill';
  if (trigger === 'iconButton') return 'end';
  return 'start';
}

export function resolveDefaultMenuSize(
  props: Pick<SelectBaseProps, 'trigger' | 'menu' | 'menuSize'>,
): SelectMenuSize {
  if (props.menuSize) return props.menuSize;
  const trigger = resolveSelectTrigger(props.trigger);
  const menu = resolveSelectMenu(props.menu);
  if (trigger === 'input') return 'fill';
  if (menu === 'actions' || trigger === 'iconButton') return 's';
  return 'm';
}

export function resolveDefaultAttention(
  props: Pick<SelectBaseProps, 'trigger' | 'attention'>,
): SelectAttention {
  if (props.attention) return props.attention;
  return resolveSelectTrigger(props.trigger) === 'iconButton' ? 'high' : 'medium';
}

export function resolveSelectAppearance(
  appearance?: SelectAppearance,
): Exclude<SelectAppearance, 'auto'> {
  return !appearance || appearance === 'auto' ? 'primary' : appearance;
}

export function resolveSelectMenu(menu?: SelectMenuKind | SelectMenuTypeFigma): SelectMenuKind {
  return normalizeSelectMenu(menu);
}

export function resolveSelectTrigger(
  trigger?: SelectTrigger | SelectTriggerFigma,
): SelectTrigger {
  return normalizeSelectTrigger(trigger);
}

export function selectSizeToInputSize(size: SelectSize): 's' | 'm' | 'l' {
  return size;
}

export function selectSizeToButtonSize(size: SelectSize): 's' | 'm' | 'l' {
  return size;
}

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
    sections.map((section) => ({
      section,
      options: byId.get(section.id) ?? [],
    }));
  if (ungrouped.length > 0) groups.push({ section: null, options: ungrouped });
  return groups;
}

export interface SelectResolvedState<T extends string | number = string> {
  trigger: SelectTrigger;
  menu: SelectMenuKind;
  menuDirection: SelectMenuDirection;
  menuAlignment: SelectMenuAlignment;
  menuSize: SelectMenuSize;
  appearance: Exclude<SelectAppearance, 'auto'>;
  size: SelectSize;
  isDisabled: boolean;
  isMulti: boolean;
  isActions: boolean;
  selectedValue: T | undefined;
  selectedValues: T[];
  searchable: boolean;
  showSecondaryText: boolean;
}

export function useSelectState<T extends string | number = string>(
  props: SelectBaseProps<T>,
): SelectResolvedState<T> {
  const menu = resolveSelectMenu(props.menu ?? props.menuType);
  return {
    trigger: resolveSelectTrigger(props.trigger),
    menu,
    menuDirection: props.menuDirection ?? 'below',
    menuAlignment: resolveDefaultMenuAlignment(props),
    menuSize: resolveDefaultMenuSize(props),
    appearance: resolveSelectAppearance(props.appearance),
    size: resolveSelectSize(props.size),
    isDisabled: props.disabled ?? false,
    isMulti: menu === 'multi',
    isActions: menu === 'actions',
    selectedValue: props.value,
    selectedValues: props.values ?? [],
    searchable: props.searchable ?? props.showSearch ?? false,
    showSecondaryText: props.secondaryText ?? false,
  };
}

export function getSelectAccessibilityProps<T extends string | number>(
  props: Partial<SelectBaseProps<T>>,
  state: SelectResolvedState<T>,
  isOpen: boolean,
): {
  role?: 'combobox';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded': boolean;
  'aria-haspopup': 'listbox' | 'menu';
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
} {
  return {
    role: state.isActions ? undefined : 'combobox',
    'aria-label': props['aria-label'] ?? (props.label || undefined),
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': props['aria-describedby'],
    'aria-expanded': isOpen,
    'aria-haspopup': state.isActions ? 'menu' : 'listbox',
    'aria-required': props.required || undefined,
    'aria-invalid': props.invalid || !!props.feedback || undefined,
  };
}

export function selectTriggerText<T extends string | number>(
  options: SelectOption<T>[],
  state: SelectResolvedState<T>,
  placeholder?: string,
  triggerLabel?: string,
): { text: string; isPlaceholder: boolean } {
  if (triggerLabel) return { text: triggerLabel, isPlaceholder: false };
  if (state.isMulti) {
    const count = state.selectedValues.length;
    if (count === 0) return { text: placeholder ?? FIGMA_SELECT_PLACEHOLDER, isPlaceholder: true };
    if (count === 1) {
      const only = options.find((o) => o.value === state.selectedValues[0]);
      return { text: only?.label ?? `${count} selected`, isPlaceholder: false };
    }
    return { text: `${count} selected`, isPlaceholder: false };
  }
  const selected = options.find((o) => o.value === state.selectedValue);
  if (!selected) return { text: placeholder ?? FIGMA_SELECT_PLACEHOLDER, isPlaceholder: true };
  return { text: selected.label, isPlaceholder: false };
}

export function menuSideFromDirection(
  direction: SelectMenuDirection,
): 'top' | 'bottom' | 'inline-start' | 'inline-end' {
  if (direction === 'above') return 'top';
  return 'bottom';
}

export function menuAlignFromAlignment(
  alignment: SelectMenuAlignment,
): 'start' | 'center' | 'end' {
  if (alignment === 'middle') return 'center';
  if (alignment === 'fill') return 'start';
  return alignment;
}

// ── Compound sub-component prop types (Figma API) ───────────────────────────

export type SelectInputState = 'idle' | 'active' | 'feedback';

export interface SelectSelectableInputProps {
  size?: SelectSize;
  attention?: SelectInputAttention;
  state?: SelectInputState;
  filled?: boolean;
  shape?: SelectInputShape;
  start?: SelectInputStart;
  label?: boolean | string;
  required?: boolean;
  description?: boolean | string;
  infoIcon?: boolean;
  feedback?: boolean | string;
  helperText?: boolean | string;
  appearance?: SelectAppearance;
}

export interface SelectSelectableButtonProps {
  size?: SelectSize;
  attention?: SelectAttention;
  state?: 'idle' | 'active';
  condensed?: boolean;
  contained?: boolean;
  start?: 'none' | 'icon' | 'avatar';
  chevron?: boolean;
  appearance?: SelectAppearance;
}

export interface SelectSelectableIconButtonProps {
  size?: SelectSize;
  attention?: SelectAttention;
  state?: 'idle' | 'active';
  condensed?: boolean;
  contained?: boolean;
  appearance?: SelectAppearance;
}

export interface SelectMenuProps {
  menuDirection?: SelectMenuDirection;
  menuAlignment?: SelectMenuAlignment;
  menuSize?: SelectMenuSize;
  menuType?: SelectMenuTypeFigma;
  groups?: boolean;
  secondaryText?: boolean;
  showSearch?: boolean;
}
