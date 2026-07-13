/**
 * Palette Utilities — Pure functions for converting color scales to palettes.
 *
 * Extracted from @oneui/ui Surfaces module to break the coupling between
 * the engine layer and UI editor components.
 */

import type { AvailableScale } from './types';
import type { ColorPalette } from './colorMath';

/**
 * Build a color palette (step → hex) from an available scale.
 */
export function buildPaletteFromScale(scale: AvailableScale): ColorPalette {
  const palette: ColorPalette = {};
  if (scale.colors) {
    for (const { step, hex } of scale.colors) {
      palette[step] = hex;
    }
  }
  return palette;
}
