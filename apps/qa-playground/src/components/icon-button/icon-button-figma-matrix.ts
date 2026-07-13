import type { IconButtonAttention, IconButtonAppearance, IconButtonLayout, IconButtonSize } from '@oneui/ui/components/IconButton';

/** Figma COMPONENT_SET row order (image 1): M first, then 2XS–XL. */
export const FIGMA_MATRIX_SIZE_ROWS: readonly { size: IconButtonSize; label: string }[] = [
  { size: 'm', label: 'M' },
  { size: '2xs', label: '2XS' },
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

/** Image 2 — size × attention grid (6 × 3 = 18). */
export const FIGMA_SIZE_ATTENTION_SIZES: readonly { size: IconButtonSize; label: string }[] = [
  { size: '2xs', label: '2XS' },
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

export const FIGMA_ATTENTION_LEVELS: readonly { value: IconButtonAttention; label: string }[] = [
  { value: 'high', label: 'high' },
  { value: 'medium', label: 'medium' },
  { value: 'low', label: 'low' },
];

export type IconButtonFigmaMatrixColumnId = 'shape-1-1' | 'shape-3-2' | 'full-width' | 'neutral-palette';

export interface IconButtonFigmaMatrixColumn {
  id: IconButtonFigmaMatrixColumnId;
  /** Column group label in Figma */
  figmaLabel: string;
  /** Not rendered when condensed: true (hatched in Figma) */
  unavailableWhenCondensed: boolean;
  cellProps: (
    attention: IconButtonAttention,
  ) => {
    layout?: IconButtonLayout;
    fullWidth?: boolean;
    appearance?: IconButtonAppearance;
    attention: IconButtonAttention;
  };
}

/** Image 1 column groups — shape 1:1, shape 2:3, fullWidth, neutral (black/grey). */
export const FIGMA_MASTER_MATRIX_COLUMNS: readonly IconButtonFigmaMatrixColumn[] = [
  {
    id: 'shape-1-1',
    figmaLabel: 'shape: 1:1 · fullWidth: false',
    unavailableWhenCondensed: false,
    cellProps: (attention) => ({ layout: '1:1', attention, appearance: 'primary' }),
  },
  {
    id: 'shape-3-2',
    figmaLabel: 'shape: 2:3 · fullWidth: false',
    unavailableWhenCondensed: false,
    cellProps: (attention) => ({ layout: '3:2', attention, appearance: 'primary' }),
  },
  {
    id: 'full-width',
    figmaLabel: 'fullWidth: true',
    unavailableWhenCondensed: false,
    cellProps: (attention) => ({ fullWidth: true, attention, appearance: 'primary' }),
  },
  {
    id: 'neutral-palette',
    figmaLabel: 'appearance: neutral (black / grey)',
    unavailableWhenCondensed: true,
    cellProps: (attention) => ({ attention, appearance: 'neutral' }),
  },
];

export const ATTENTION_TO_DATA_VARIANT: Record<IconButtonAttention, string> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export const SIZE_TO_DATA_SIZE: Record<IconButtonSize, string> = {
  '2xs': '4',
  xs: '6',
  s: '8',
  m: '10',
  l: '12',
  xl: '14',
};

/** Image 2 grid cell — size × attention at shape 1:1. */
export function figmaSizeAttentionTestId(size: IconButtonSize, attention: IconButtonAttention): string {
  return `icon-button-figma-val-${size}-${attention}`;
}

/** Image 1 master matrix cell. */
export function figmaMasterMatrixTestId(
  condensed: boolean,
  size: IconButtonSize,
  columnId: IconButtonFigmaMatrixColumnId,
  attention: IconButtonAttention,
): string {
  return `icon-button-figma-mx-c${condensed ? '1' : '0'}-${size}-${columnId}-${attention}`;
}
