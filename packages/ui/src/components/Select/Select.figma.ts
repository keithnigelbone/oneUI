/**
 * Select.figma.ts — canonical copy + preset props from Figma micropattern frames.
 * File: ❖ OneUI Micropatterns (y4r5eCoZhqvPw1U1bm2qfw)
 */

import type { SelectBaseProps, SelectOption } from './Select.shared';

/** Figma Select.SelectableInput idle placeholder (node 3877:38142). */
export const FIGMA_SELECT_PLACEHOLDER = 'Choose an option';

export const FIGMA_SELECT_LABEL = 'Label';

export const FIGMA_SELECT_SECTION_LABEL = 'Section label';

export const FIGMA_SELECT_OPTION_SECONDARY =
  'Short description of this option';

/** Single-select rows — all titled "Option title" (nodes 3877:38141, 3877:38149). */
export const FIGMA_SELECT_SINGLE_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Option title' },
  { value: '2', label: 'Option title' },
  { value: '3', label: 'Option title' },
];

/** Multi-select rows with secondary text (node 3877:38143). */
export const FIGMA_SELECT_MULTI_OPTIONS: SelectOption[] = FIGMA_SELECT_SINGLE_OPTIONS.map(
  (o) => ({ ...o, secondaryText: FIGMA_SELECT_OPTION_SECONDARY, group: 'main' }),
);

export const FIGMA_SELECT_MULTI_SECTIONS = [{ id: 'main', label: FIGMA_SELECT_SECTION_LABEL }];

/** Actions menu rows (node 3877:38144). */
export const FIGMA_SELECT_ACTION_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Action' },
  { value: '2', label: 'Action' },
  { value: '3', label: 'Action' },
];

/**
 * Figma SelectableInput column width (328px, node 3877:38141).
 * Token composition: 2×`--Spacing-40` (160px) + `--Spacing-2` (8px) = 328px.
 */
export const FIGMA_SELECT_INPUT_WIDTH =
  'calc(2 * var(--Spacing-40) + var(--Spacing-2))';

/** Figma SelectMenuWrapper vertical offset — gap comes from wrapper `padding: 8px 0` (--Spacing-2). */
export const FIGMA_SELECT_MENU_SIDE_OFFSET_PX = 0;

/** node 3877:38142 — SelectableInput idle */
export const FIGMA_PRESET_INPUT_IDLE: Partial<SelectBaseProps> = {
  trigger: 'selectableInput',
  label: FIGMA_SELECT_LABEL,
  placeholder: FIGMA_SELECT_PLACEHOLDER,
  options: FIGMA_SELECT_SINGLE_OPTIONS,
  filled: false,
  inputAttention: 'medium',
};

/** node 3877:38141 — SelectableInput active + singleSelect menu (fill width) */
export const FIGMA_PRESET_INPUT_ACTIVE: Partial<SelectBaseProps> = {
  ...FIGMA_PRESET_INPUT_IDLE,
  menuAlignment: 'fill',
  menuSize: 'fill',
  value: '3',
};

/** node 3877:38143 — SelectableInput active + multiSelect + search + groups */
export const FIGMA_PRESET_INPUT_MULTI: Partial<SelectBaseProps> = {
  ...FIGMA_PRESET_INPUT_IDLE,
  menuType: 'multiSelect',
  menuAlignment: 'fill',
  menuSize: 'fill',
  secondaryText: true,
  groups: true,
  sections: FIGMA_SELECT_MULTI_SECTIONS,
  options: FIGMA_SELECT_MULTI_OPTIONS,
  showSearch: true,
  values: ['1'],
};

/** node 3877:38145 — SelectableButton idle */
export const FIGMA_PRESET_BUTTON_IDLE: Partial<SelectBaseProps> = {
  trigger: 'selectableButton',
  menuType: 'actions',
  triggerLabel: 'Button',
  attention: 'medium',
  contained: true,
  chevron: true,
  options: FIGMA_SELECT_ACTION_OPTIONS,
};

/** node 3877:38144 — SelectableButton active + actions menu */
export const FIGMA_PRESET_BUTTON_ACTIVE: Partial<SelectBaseProps> = {
  ...FIGMA_PRESET_BUTTON_IDLE,
  menuAlignment: 'start',
  menuSize: 's',
};

/** node 3877:38148 — SelectableIconButton idle */
export const FIGMA_PRESET_ICON_IDLE: Partial<SelectBaseProps> = {
  trigger: 'selectableIconButton',
  menuType: 'singleSelect',
  attention: 'high',
  contained: true,
  options: FIGMA_SELECT_SINGLE_OPTIONS,
  'aria-label': 'Favourites',
};

/** node 3877:38149 — SelectableIconButton active + menu above */
export const FIGMA_PRESET_ICON_ACTIVE: Partial<SelectBaseProps> = {
  ...FIGMA_PRESET_ICON_IDLE,
  menuDirection: 'above',
  menuAlignment: 'end',
  menuSize: 's',
  value: '2',
};
