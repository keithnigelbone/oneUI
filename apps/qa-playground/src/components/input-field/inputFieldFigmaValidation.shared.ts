/** Label + placeholder on every Figma COMPONENT_SET cell (attached spec). */
export const IFF_FIGMA_LABEL = 'Label';

export const IFF_FIGMA_PLACEHOLDER = 'Placeholder';

export const IFF_FIGMA_VALIDATION_SECTION_ID = 'input-field-qa-figma-validation-matrix';

export const IFF_FIGMA_VALIDATION_TAB_LABEL = 'InputField - Figma Validation';

export const IFF_FIGMA_GRID_TESTID = 'figma-input-field-grid';

export const IFF_FIGMA_VALIDATION_ROOT_TESTID = 'input-field-figma-validation-root';

export const IFF_FIGMA_SPEC_DESCRIPTION =
  'An InputField combines a label stack, bordered Input control (with optional start/end slots), validation feedback, and dynamic helper text.';

export const IFF_FIGMA_DNA_PATH = '.DNA/InputField';

/** Figma row order: M, S, L (matches attached COMPONENT_SET frame). */
export const IFF_FIGMA_SIZE_ROWS = [
  { size: 10 as const, label: 'M' as const },
  { size: 8 as const, label: 'S' as const },
  { size: 12 as const, label: 'L' as const },
] as const;

export type IffFigmaSizeLabel = (typeof IFF_FIGMA_SIZE_ROWS)[number]['label'];

export function iffFigmaCellTestId(sizeLabel: IffFigmaSizeLabel): string {
  return `figma-input-field-sz-${sizeLabel}`;
}

export const IFF_FIGMA_CELL_TESTIDS = IFF_FIGMA_SIZE_ROWS.map(({ label }) => iffFigmaCellTestId(label));
