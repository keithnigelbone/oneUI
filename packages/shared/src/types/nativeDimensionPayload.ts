import type { DensityId, BreakpointId } from '../data/dimension-scales';

/**
 * One breakpoint × density slice of the brand dimension scale (native / Flutter / mobile).
 * Keys match CSS custom properties (`--Dimension-f0`, …). `platformId` holds an
 * S/M/L breakpoint id.
 */
export interface StructuredDimensionContext {
  platformId: BreakpointId;
  densityId: DensityId;
  dimensions: Record<string, string>;
  gridMargin: string;
  gridGutter: string;
}
