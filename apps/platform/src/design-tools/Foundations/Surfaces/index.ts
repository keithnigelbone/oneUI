/**
 * Surfaces Foundation Components
 */

// Re-export from shared engine (canonical location)
export { buildPaletteFromScale } from '@oneui/shared/engine';
export type { AvailableScale, SurfaceToken } from '@oneui/shared/engine';

/**
 * Placeholder type preserved for legacy call sites in the platform editor.
 * The V4 multi-role stacking result was removed from the engine when we moved
 * to the "new" single-palette pipeline. Existing consumers only use this in
 * `null as MultiRoleStackingResultV4 | null` hand-offs — keep as `unknown`
 * until those call sites are fully migrated.
 */
export type MultiRoleStackingResultV4 = unknown;

// Surface preview component
export { SurfaceNewPreview } from './SurfaceNewPreview';

// Validation table (ported reference grid — foundations/surfaces "Validation" tab)
export { SurfaceValidationTable } from './SurfaceValidationTable';
export type { SurfaceValidationTableProps } from './SurfaceValidationTable';
