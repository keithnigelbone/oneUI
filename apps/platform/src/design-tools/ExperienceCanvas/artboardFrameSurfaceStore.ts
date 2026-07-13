/**
 * Per-frame artboard surface (appearance + raw mode) for ExperienceCanvas.
 * Used by OneUIFrameShapeUtil (frame SVG fill), ComponentShape surface sync, and export — not a child shape.
 */

import type { ArtboardSubBrandOption } from './FrameThemeContext';

export type FrameArtboardSurface = { appearance: string; rawMode: string };

const surfaceByFrameId = new Map<string, FrameArtboardSurface>();

export type ArtboardFrameExportContext = {
  frameSubBrandByFrameId: Record<string, string | null>;
  baseFoundationData: Record<string, unknown> | null;
  theme: 'light' | 'dark';
  availableSubBrands: readonly ArtboardSubBrandOption[];
};

let exportCtx: ArtboardFrameExportContext | null = null;

export function setArtboardFrameExportContext(ctx: ArtboardFrameExportContext | null): void {
  exportCtx = ctx;
}

export function getFrameArtboardSurface(frameId: string): FrameArtboardSurface | undefined {
  return surfaceByFrameId.get(frameId);
}

/** Synced from ExperienceCanvas when the user sets artboard surface (also drives React context). */
export function putFrameArtboardSurface(frameId: string, surface: FrameArtboardSurface | null): void {
  if (surface === null) surfaceByFrameId.delete(frameId);
  else surfaceByFrameId.set(frameId, surface);
}

export function getArtboardFrameExportContext(): ArtboardFrameExportContext | null {
  return exportCtx;
}

// ---------------------------------------------------------------------------
// Per-export "include artboard background" flag.
//
// `OneUIFrameShapeUtil.toSvg()` reads this synchronously while tldraw walks
// the shape tree to emit SVG. When false, the frame omits its artboard fill
// rect entirely so the exported SVG (and any raster derived from it) lands
// in the consumer with no background — matching the "Include background"
// checkbox in the export panel and matching what users see in Figma after
// import (no extraneous "#F9FAFB" / brand-colour Frame fill).
//
// Default is `true` so authoring/preview rendering is unaffected. The export
// flow flips it to the user-selected value just before export and restores
// it in `finally`.
// ---------------------------------------------------------------------------

let includeArtboardBackground = true;

export function setArtboardFrameExportIncludeBackground(include: boolean): void {
  includeArtboardBackground = include;
}

export function getArtboardFrameExportIncludeBackground(): boolean {
  return includeArtboardBackground;
}
