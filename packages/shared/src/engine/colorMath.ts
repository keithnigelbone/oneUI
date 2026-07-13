/**
 * colorMath.ts
 *
 * Pure color math utilities for hex/RGB conversion, WCAG contrast ratio,
 * alpha blending, and accessibility compliance. Framework-agnostic.
 *
 * Used by V4 surface computation and brand CSS engine.
 */

// ============================================================================
// Types
// ============================================================================

/** Color palette as step → hex mapping */
export type ColorPalette = Record<number, string>;

/** Contrast direction for text/on-colour decisions */
export type ContrastDirection = 'dark' | 'light';

/** Pre-parsed RGB color tuple [r, g, b] for avoiding repeated hex parsing */
export type RGB = [number, number, number];

/** Pre-parsed palette: step → RGB tuple */
export type RGBPalette = Record<number, RGB>;

/** WCAG compliance details */
export interface WCAGCompliance {
  normalAA: boolean;   // >= 4.5:1 for normal text
  normalAAA: boolean;  // >= 7.0:1 for normal text
  largeAA: boolean;    // >= 3.0:1 for large text
  largeAAA: boolean;   // >= 4.5:1 for large text
  uiAA: boolean;       // >= 3.0:1 for UI components
}

/** Result of a scale calculation */
export interface ScaleResult {
  hex: string;           // Display color (may be alpha-blended result)
  sourceHex: string;     // Original color before blending
  alpha?: number;        // Alpha value (0-1) if blended, undefined if solid
  contrastRatio: number; // Contrast ratio against surface
  wcag: WCAGCompliance;  // WCAG compliance levels
  sourceStep?: number;   // Palette step used (if from palette)
}

// ============================================================================
// Constants
// ============================================================================

/** Fallback RGB values */
export const RGB_GRAY: RGB = [128, 128, 128];
export const RGB_BLACK: RGB = [0, 0, 0];
export const RGB_WHITE: RGB = [255, 255, 255];

// ============================================================================
// Hex ↔ RGB Conversion
// ============================================================================

/**
 * Parse hex colours from Convex / Android exports where **32-bit `#AABBCCDD` strings are ambiguous:**
 * – **Flutter / Skia** packed `0xAA BB CC DD` (`#FFE62828` = opaque brand red `#e62828`)
 * – **CSS Color 4 `#RRGGBBAA`** (alpha last — same bytes read as nearly transparent fill)
 *
 * Disambiguates:
 * - `#RRGGBBAA` opaque suffix `FF`
 * - **CSS translucent** pastel / near‑white `#RR GGB BAA`
 * - **Android / Flutter `#AARRGGBB`** for everything else with full leading alpha (`0xFF…`)
 *
 * (The naive `misread.blue == cssAlpha`-style test is tautological — it rejected every `#FF…______`
 * blue whose B-channel was ≥ 64 when misread as “CSS alpha”, breaking Jio / Reliance bold fills.)
 */
export function parseRgbFromHexLoose(hex: string): RGB {
  let h = hex.replace(/^#/, '').trim();
  if (!h || !/^[a-f\d]+$/i.test(h)) return RGB_GRAY;

  if (h.length === 3) {
    h = h
      .split('')
      .map(c => `${c}${c}`)
      .join('');
  }

  if (h.length === 6) {
    const v = Number.parseInt(h, 16);
    if (!Number.isFinite(v)) return RGB_GRAY;
    return [(v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
  }

  if (h.length !== 8) return RGB_GRAY;

  const lower = h.toLowerCase();
  // Opaque `#RRGGBBFF` (CSS Colour Module suffix).
  if (lower.endsWith('ff')) {
    const packed = Number.parseInt(h, 16) >>> 0;
    return [(packed >>> 24) & 0xff, (packed >>> 16) & 0xff, (packed >>> 8) & 0xff];
  }

  const packed = Number.parseInt(h, 16) >>> 0;
  const rCss = (packed >>> 24) & 0xff;
  const gCss = (packed >>> 16) & 0xff;
  const bCss = (packed >>> 8) & 0xff;
  const aCss = packed & 0xff;

  const flutterAlpha = rCss;
  const flutterRed = gCss;
  const flutterGreen = bCss;
  const flutterBlue = aCss;

  // Near‑white translucent (`#FFFFFF3f`) — approximate solid RGB by the first three octets only.
  if (rCss >= 250 && gCss >= 250 && bCss >= 250 && aCss < 254) {
    return [rCss, gCss, bCss];
  }

  // Light pastel + mid‑range alpha tail: canonical translucent CSS `#RRGGBBAA`
  // (excludes saturated primaries like `#FF0053C8`, where GG/BB aren’t “pastel”).
  const isMidAlphaTail = aCss >= 0x40 && aCss <= 0xbf;
  const isPastelRgbHead = rCss >= 248 && gCss >= 216 && bCss >= 216;
  if (flutterAlpha >= 0xf8 && isMidAlphaTail && isPastelRgbHead) {
    return [rCss, gCss, bCss];
  }

  // Remaining `0xFF______` literals are overwhelmingly Flutter `#AARRGGBB` palette exports.
  if (flutterAlpha >= 0xf8) {
    return [flutterRed, flutterGreen, flutterBlue];
  }

  // Dark / variable leading byte — fall back to CSS channel order (#RR GG BB).
  return [rCss, gCss, bCss];
}

/**
 * Re-encode a solid opaque sRGB hex for **CSS custom properties** (never ambiguous 8-digit).
 */
export function normalizeSolidCssHex(hex: string): string {
  const [r, g, b] = parseRgbFromHexLoose(hex);
  return rgbToHex(r, g, b);
}

/**
 * Parse hex color to RGB tuple [r, g, b]
 */
export function hexToRgbTuple(hex: string): RGB {
  return parseRgbFromHexLoose(hex);
}

/**
 * Parse hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const [r, g, b] = hexToRgbTuple(hex);
  return { r, g, b };
}

/**
 * Convert RGB values to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Pre-parse a ColorPalette (hex strings) into an RGBPalette (RGB tuples).
 * Call once per palette, then pass the RGBPalette to RGB-based functions.
 *
 * Results are memoised by palette identity. A `ScaleDefinition`'s palette
 * is stable for the lifetime of the theme, so repeat callers — every
 * `<Surface>` boundary, every role's `resolveTokenSet`, every preview — hit
 * the cache instead of re-parsing 25 hex strings.
 */
const PALETTE_CACHE = new WeakMap<ColorPalette, RGBPalette>();

export function preParseRGBPalette(palette: ColorPalette): RGBPalette {
  const cached = PALETTE_CACHE.get(palette);
  if (cached) return cached;

  const result: RGBPalette = {};
  for (const key in palette) {
    const step = Number(key);
    result[step] = hexToRgbTuple(palette[step]);
  }
  PALETTE_CACHE.set(palette, result);
  return result;
}

// ============================================================================
// Luminance & Contrast
// ============================================================================

/**
 * Convert sRGB to linear RGB for luminance calculation
 */
function sRgbToLinear(value: number): number {
  const normalized = value / 255;
  if (normalized <= 0.03928) {
    return normalized / 12.92;
  }
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance (WCAG 2.1)
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rLinear = sRgbToLinear(r);
  const gLinear = sRgbToLinear(g);
  const bLinear = sRgbToLinear(b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 * Uses truncation (floor at 2 decimals) as per WCAG spec.
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.floor(ratio * 100) / 100;
}

/**
 * Calculate WCAG contrast ratio from pre-parsed RGB tuples.
 * Avoids hex→RGB parsing overhead on hot paths.
 */
export function getContrastRatioRGB(rgb1: RGB, rgb2: RGB): number {
  const l1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.floor(ratio * 100) / 100;
}

// ============================================================================
// Alpha Blending
// ============================================================================

/**
 * Blend foreground color with background using alpha compositing.
 * Formula: result = fg * alpha + bg * (1 - alpha)
 */
export function blendWithAlpha(fgHex: string, bgHex: string, alpha: number): string {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);

  const r = Math.round(fg.r * alpha + bg.r * (1 - alpha));
  const g = Math.round(fg.g * alpha + bg.g * (1 - alpha));
  const b = Math.round(fg.b * alpha + bg.b * (1 - alpha));

  return rgbToHex(r, g, b);
}

/**
 * Blend foreground with background using alpha compositing (RGB variant).
 * Returns both the blended RGB tuple and hex string.
 */
export function blendWithAlphaRGB(fg: RGB, bg: RGB, alpha: number): { rgb: RGB; hex: string } {
  const r = Math.round(fg[0] * alpha + bg[0] * (1 - alpha));
  const g = Math.round(fg[1] * alpha + bg[1] * (1 - alpha));
  const b = Math.round(fg[2] * alpha + bg[2] * (1 - alpha));
  return { rgb: [r, g, b], hex: rgbToHex(r, g, b) };
}

/**
 * Find the minimum alpha value needed to achieve a target contrast ratio.
 * Uses linear search at integer percentages (1%→100%) to match Figma's
 * exact rounding behavior.
 */
export function findAlphaForContrast(
  fgHex: string,
  bgHex: string,
  targetContrast: number
): number {
  const fullContrast = getContrastRatio(fgHex, bgHex);
  if (fullContrast < targetContrast) {
    return 1;
  }

  for (let i = 1; i <= 100; i++) {
    const alpha = i / 100;
    const blended = blendWithAlpha(fgHex, bgHex, alpha);
    const contrast = getContrastRatio(blended, bgHex);
    if (contrast >= targetContrast) {
      return alpha;
    }
  }

  return 1;
}

/**
 * Find minimum alpha for target contrast using pre-parsed RGB.
 * Uses linear search at integer percentages (1%→100%) to match Figma's
 * exact rounding behavior.
 */
export function findAlphaForContrastRGB(
  fgRgb: RGB,
  bgRgb: RGB,
  targetContrast: number
): number {
  const fullContrast = getContrastRatioRGB(fgRgb, bgRgb);
  if (fullContrast < targetContrast) {
    return 1;
  }

  for (let i = 1; i <= 100; i++) {
    const alpha = i / 100;
    const blendedR = Math.round(fgRgb[0] * alpha + bgRgb[0] * (1 - alpha));
    const blendedG = Math.round(fgRgb[1] * alpha + bgRgb[1] * (1 - alpha));
    const blendedB = Math.round(fgRgb[2] * alpha + bgRgb[2] * (1 - alpha));
    const contrast = getContrastRatioRGB([blendedR, blendedG, blendedB], bgRgb);
    if (contrast >= targetContrast) {
      return alpha;
    }
  }

  return 1;
}

// ============================================================================
// Surface & Contrast Helpers
// ============================================================================

/**
 * Check if a surface is "light" (low contrast against white).
 * Light surface = contrast vs white < 4.5:1
 */
export function isLightSurface(surfaceHex: string): boolean {
  const contrastVsWhite = getContrastRatio(surfaceHex, '#ffffff');
  return contrastVsWhite < 4.5;
}

/**
 * Determine contrast direction based on surface lightness.
 * Light surface → use dark colors (toward step 200)
 * Dark surface → use light colors (toward step 2500)
 */
export function getContrastDirection(surfaceHex: string): ContrastDirection {
  return isLightSurface(surfaceHex) ? 'dark' : 'light';
}

/**
 * Determine contrast direction dynamically by comparing actual contrast
 * against both extremes (200 and 2500). More accurate than just checking
 * lightness, especially for mid-tone surfaces.
 */
export function getDynamicContrastDirection(
  surfaceHex: string,
  palette: ColorPalette
): ContrastDirection {
  const contrast2500 = getContrastRatio(palette[2500] || '#ffffff', surfaceHex);
  const contrast200 = getContrastRatio(palette[200] || '#000000', surfaceHex);
  return contrast2500 > contrast200 ? 'light' : 'dark';
}

/**
 * Get dynamic contrast direction from pre-parsed RGB palette.
 */
export function getDynamicContrastDirectionRGB(
  surfaceRgb: RGB,
  rgbPalette: RGBPalette
): ContrastDirection {
  const contrast2500 = getContrastRatioRGB(rgbPalette[2500] || RGB_WHITE, surfaceRgb);
  const contrast200 = getContrastRatioRGB(rgbPalette[200] || RGB_BLACK, surfaceRgb);
  return contrast2500 > contrast200 ? 'light' : 'dark';
}

/**
 * Get WCAG compliance level for a contrast ratio
 */
export function getWcagLevel(ratio: number): 'AAA' | 'AA' | 'AA Large' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

/**
 * Get readable text color (black or white) for a background.
 * Uses luminance-based detection to ensure text is always readable.
 */
export function getReadableTextColor(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

/**
 * Create WCAG compliance object from contrast ratio
 */
export function createWcagCompliance(contrastRatio: number): WCAGCompliance {
  return {
    normalAA: contrastRatio >= 4.5,
    normalAAA: contrastRatio >= 7.0,
    largeAA: contrastRatio >= 3.0,
    largeAAA: contrastRatio >= 4.5,
    uiAA: contrastRatio >= 3.0,
  };
}

/**
 * Create a ScaleResult object (hex-based).
 */
export function createScaleResult(
  hex: string,
  sourceHex: string,
  surfaceHex: string,
  alpha?: number,
  sourceStep?: number
): ScaleResult {
  const contrastRatio = getContrastRatio(hex, surfaceHex);
  return {
    hex,
    sourceHex,
    alpha,
    contrastRatio,
    wcag: createWcagCompliance(contrastRatio),
    sourceStep,
  };
}

/**
 * Create a ScaleResult from pre-parsed RGB values.
 */
export function createScaleResultRGB(
  hex: string,
  sourceHex: string,
  surfaceRgb: RGB,
  hexRgb: RGB,
  alpha?: number,
  sourceStep?: number
): ScaleResult {
  const contrastRatio = getContrastRatioRGB(hexRgb, surfaceRgb);
  return {
    hex,
    sourceHex,
    alpha,
    contrastRatio,
    wcag: createWcagCompliance(contrastRatio),
    sourceStep,
  };
}

/**
 * Get Bold step offset for dark backgrounds.
 * From Rang De: applies an offset to the starting position when walking
 * toward light colors on dark backgrounds.
 */
export function getBoldStepOffset(baseStep: number): number {
  if (baseStep >= 1900) return 0;
  if (baseStep >= 1300) return 1;
  if (baseStep >= 700) return 2;
  return 3;
}
