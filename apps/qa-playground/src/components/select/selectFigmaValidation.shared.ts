/**
 * selectFigmaValidation.shared.ts — Figma matrix constants for Select micropattern.
 */

export const SELECT_FIGMA_VALIDATION_ROOT = 'select-figma-validation-root';
export const SELECT_FIGMA_TRIGGER_GRID = 'select-figma-trigger-grid';
export const SELECT_FIGMA_INPUT_GRID = 'select-figma-input-grid';
export const SELECT_FIGMA_MENU_GRID = 'select-figma-menu-grid';

export const SELECT_FIGMA_PLACEHOLDER = 'Choose an option';
export const SELECT_FIGMA_LABEL = 'Label';

export const SELECT_FIGMA_TRIGGER_COLS = [
  { trigger: 'selectableInput' as const, label: 'selectableInput' },
  { trigger: 'selectableButton' as const, label: 'selectableButton' },
  { trigger: 'selectableIconButton' as const, label: 'selectableIconButton' },
];

export const SELECT_FIGMA_INPUT_SIZE_ROWS = [
  { size: 's' as const, label: 'S' },
  { size: 'm' as const, label: 'M' },
  { size: 'l' as const, label: 'L' },
];

export const SELECT_FIGMA_INPUT_ATTENTION_COLS = [
  { attention: 'medium' as const, filled: false, label: 'medium / outlined' },
  { attention: 'high' as const, filled: true, label: 'high / filled' },
];

export const SELECT_FIGMA_INPUT_START_ROWS = [
  { start: 'none' as const, label: 'none' },
  { start: 'icon' as const, label: 'icon' },
  { start: 'avatar' as const, label: 'avatar' },
  { start: 'image' as const, label: 'image' },
  { start: 'text' as const, label: 'text' },
] as const;

export const SELECT_FIGMA_MENU_COLS = [
  { menuType: 'singleSelect' as const, label: 'singleSelect' },
  { menuType: 'multiSelect' as const, label: 'multiSelect' },
  { menuType: 'actions' as const, label: 'actions' },
] as const;

export function selectFigmaCellTestId(section: string, key: string): string {
  return `select-figma-${section}-${key}`;
}
