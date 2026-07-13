/**
 * Color Foundation components
 */

export { ColorScaleGenerator } from './ColorScaleGenerator';
export type { ColorScaleGeneratorProps } from './ColorScaleGenerator.shared';

export { ColorScalePreview, ColorScaleStrip } from './ColorScalePreview';
export type { ColorScalePreviewProps } from './ColorScaleGenerator.shared';

export { SurfaceTokenEditor } from './SurfaceTokenEditor';
export type { SurfaceTokenEditorProps, SurfaceTokenMapping } from './SurfaceTokenEditor.shared';
export { DEFAULT_SURFACE_TOKENS, SURFACE_TOKEN_DESCRIPTIONS, APPEARANCE_STRUCTURE, parseStepReference, createStepReference } from './SurfaceTokenEditor.shared';

export { TextTokenEditor } from './TextTokenEditor';
export type { TextTokenEditorProps, TextTokenMapping } from './TextTokenEditor.shared';
export { DEFAULT_TEXT_TOKENS, TEXT_TOKEN_DESCRIPTIONS, WCAG_REQUIREMENTS } from './TextTokenEditor.shared';

export { AccessibilityMatrix } from './AccessibilityMatrix';
export type { AccessibilityMatrixProps, ContrastCell } from './AccessibilityMatrix.shared';
export { WCAG_LEVEL_INFO, MODE_LABELS } from './AccessibilityMatrix.shared';

export { LightnessScaleEditor } from './LightnessScaleEditor';
export type { LightnessScaleEditorProps, SavedLightnessScale } from './LightnessScaleEditor.shared';

export { PresetColorScaleUploader } from './PresetColorScaleUploader';
export type { PresetColorScaleUploaderProps } from './PresetColorScaleUploader.shared';

export { PresetColorScaleSelector } from './PresetColorScaleSelector';
export type { PresetColorScaleSelectorProps } from './PresetColorScaleSelector.shared';

export { ColorScaleRow } from './ColorScaleRow';
export type { ColorScaleRowProps, ColorScaleStep } from './ColorScaleRow.shared';
