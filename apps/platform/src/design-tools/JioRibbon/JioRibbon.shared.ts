/**
 * JioRibbon.shared.ts
 *
 * Shared types, constants, and geometry engine for the Jio Ribbon component.
 * Ported from Jio-Banner-Builder's JioRibbonVertical, JioRibbonHorizontal,
 * JioRibbonVerticalWithSymbol, and JioRibbonHorizontalWithSymbol.
 *
 * The geometry engine is a pure function that computes dot positions, symbol
 * placement, and container sizing for all four variant x orientation combos.
 */

import type { CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// Jio symbol SVG path (32x32 viewBox, "jio" wordmark)
// ---------------------------------------------------------------------------

export const JIO_SYMBOL_PATH =
  'M11.3039 9.64982H10.7705C9.75838 9.64982 9.20549 10.2205 9.20549 11.3621V16.8679C9.20549 18.2854 8.72668 18.7829 7.60342 18.7829C6.71986 18.7829 6.00193 18.3959 5.43097 17.6963C5.37556 17.6229 4.21616 18.1749 4.21616 19.5378C4.21616 21.0107 5.5963 21.9132 8.1569 21.9132C11.268 21.9132 12.9077 20.3479 12.9077 16.9233V11.3621C12.9059 10.222 12.3536 9.64982 11.3039 9.64982ZM23.7039 12.3381C20.6837 12.3381 18.6769 14.2531 18.6769 17.1085C18.6769 20.0365 20.6096 21.915 23.6482 21.915C26.6674 21.915 28.6556 20.0365 28.6556 17.1275C28.6573 14.2531 26.6867 12.3381 23.7039 12.3381ZM23.6668 19.206C22.4879 19.206 21.6781 18.3408 21.6781 17.107C21.6781 15.8922 22.5077 15.0264 23.6668 15.0264C24.8259 15.0264 25.6553 15.8922 25.6553 17.1257C25.6556 18.3221 24.8088 19.206 23.6671 19.206H23.6668ZM16.1252 12.43H15.7563C14.8547 12.43 14.1735 12.8531 14.1735 14.1426V20.0347C14.1735 21.3423 14.8366 21.7476 15.7936 21.7476H16.1622C17.0645 21.7476 17.7086 21.3052 17.7086 20.0347V14.1426C17.7086 12.8169 17.0831 12.43 16.1252 12.43ZM15.9228 8.15886C14.7809 8.15886 14.063 8.8036 14.063 9.81634C14.063 10.8469 14.7999 11.4913 15.9779 11.4913C17.1196 11.4913 17.8378 10.8469 17.8378 9.81634C17.8378 8.78582 17.1012 8.15886 15.9228 8.15886Z';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JioRibbonVariant = 'dots' | 'dots-with-symbol';
export type JioRibbonOrientation = 'vertical' | 'horizontal';
/** Ribbon thickness scale: fixed multipliers vs L (1 / 0.8 / 0.7 / 0.6 / 0.5). */
export type JioRibbonSize = 'XXS' | 'XS' | 'S' | 'M' | 'L';
export type JioRibbonPlacement =
  | 'left'
  | 'center'
  | 'right'
  | 'top'
  | 'bottom';

/** Optional gradient for the Jio symbol fill (dots-with-symbol variant only). */
export interface SymbolGradient {
  stops: { offset: string; color: string }[];
}

export interface JioRibbonProps {
  /** Ribbon variant: dots-only or dots with the Jio symbol inserted */
  variant?: JioRibbonVariant;
  /** Ribbon orientation. Auto-detected from canvas aspect ratio when omitted. */
  orientation?: JioRibbonOrientation;
  /** Edge placement. Defaults: vertical → 'right', horizontal → 'bottom'. */
  placement?: JioRibbonPlacement;
  /** Primary color (Jio symbol fill + dots). Defaults to Jio orange. */
  color1?: string;
  /** Secondary color (dots). Defaults to Jio blue. */
  color2?: string;
  /** Sparkle color (dots). Defaults to Jio purple. */
  color3?: string;
  /** Canvas width in pixels — drives geometric-mean scaling */
  canvasWidth: number;
  /** Canvas height in pixels — drives geometric-mean scaling */
  canvasHeight: number;
  /** Thickness scale vs L: M=0.8, S=0.7, XS=0.6, XXS=0.5 (geometric-mean targets). */
  size?: JioRibbonSize;
  /** Row/col count before the Jio symbol (with-symbol variant only) */
  symbolPosition?: number;
  /** Callback when user drags the symbol to a new position */
  onSymbolPositionChange?: (position: number) => void;
  /** Callback reporting the computed ribbon thickness (px, without margins) */
  onThicknessCalculated?: (thickness: number) => void;
  /** Optional gradient fill for the Jio symbol circle (dots-with-symbol only) */
  symbolGradient?: SymbolGradient;
  className?: string;
  style?: CSSProperties;
}

// ---------------------------------------------------------------------------
// Constants — tokenised (these map to --JioRibbon-* CSS custom properties)
// ---------------------------------------------------------------------------

/** Ribbon thickness as a fraction of the canvas geometric mean */
export const RIBBON_THICKNESS = {
  landscape: { ratio: 0.18, min: 0.18, max: 0.22 },
  portrait: { ratio: 0.22, min: 0.22, max: 0.24 },
} as const;

/** Margin from canvas edge as a fraction of the ribbon width */
export const RIBBON_MARGIN_RATIO = 1 / 3;

/** Multiplier applied to geometric-mean thickness targets (fixed scale vs L). */
export function resolveRibbonSizeScale(size: JioRibbonSize | undefined): number {
  switch (size ?? 'L') {
    case 'L':
      return 1;
    case 'M':
      return 0.8;
    case 'S':
      return 0.7;
    case 'XS':
      return 0.6;
    case 'XXS':
      return 0.5;
    default:
      return 1;
  }
}

/** Fixed number of dots across the thin axis */
const THIN_AXIS_DOTS = 6;

/**
 * Default Jio ribbon colours — reads ribbon-specific custom properties that
 * are immune to `[data-surface]` remapping (only `--Primary-*` etc. are
 * remapped; `--JioRibbon-*` is not in the surface token allowlist).
 *
 * Resolution order:
 *   1. Sub-brand scoped CSS sets `--JioRibbon-color{N}` → sub-brand colour wins
 *   2. Global brand CSS sets `--JioRibbon-color{N}` → base brand colour wins
 *   3. Hex fallback → grey palette (Jio Brand Studio default — no subbrand selected)
 *      grey-500 / grey-1300 / grey-1900 from jioColors, matching Jio-Banner-Builder GREY_THEME_FALLBACK
 */
export const JIO_DEFAULT_COLORS = {
  color1: 'var(--JioRibbon-color1, #303339)',
  color2: 'var(--JioRibbon-color2, #898c93)',
  color3: 'var(--JioRibbon-color3, #c2c4c7)',
} as const;

// ---------------------------------------------------------------------------
// Dot & symbol data structures
// ---------------------------------------------------------------------------

export interface Dot {
  x: number;
  y: number;
  color: string;
  radius: number;
}

export interface SymbolData {
  cx: number;
  cy: number;
  size: number;
  fillColor: string;
}

export interface RibbonGeometryResult {
  dots: Dot[];
  symbol: SymbolData | null;
  /** Ribbon extent (width for vertical, height for horizontal) without margins */
  ribbonExtent: number;
  containerWidth: number;
  containerHeight: number;
  margin: number;
  /** Total row/col slots available for symbol positioning */
  totalSlots: number;
  /** Center coordinates of each symbol slot for drag snapping */
  slotCenters: number[];
}

// ---------------------------------------------------------------------------
// Color constraint engine
// ---------------------------------------------------------------------------

/**
 * Pick a color for grid position (row, col) that satisfies:
 * - No 4-in-a-row horizontally or vertically
 * - No 2x2 block of the same color
 */
export function pickConstrainedColor(
  row: number,
  col: number,
  grid: string[][],
  colors: string[],
): string {
  const available = [...colors];

  if (row >= 3) {
    const above = [
      grid[row - 1][col],
      grid[row - 2][col],
      grid[row - 3][col],
    ];
    if (above[0] === above[1] && above[1] === above[2]) {
      const idx = available.indexOf(above[0]);
      if (idx > -1) available.splice(idx, 1);
    }
  }

  if (col >= 3) {
    const left = [
      grid[row][col - 1],
      grid[row][col - 2],
      grid[row][col - 3],
    ];
    if (left[0] === left[1] && left[1] === left[2]) {
      const idx = available.indexOf(left[0]);
      if (idx > -1) available.splice(idx, 1);
    }
  }

  if (row > 0 && col > 0) {
    const tl = grid[row - 1][col - 1];
    const tr = grid[row - 1][col];
    const bl = grid[row][col - 1];
    if (tl === tr && tr === bl) {
      const idx = available.indexOf(tl);
      if (idx > -1) available.splice(idx, 1);
    }
  }

  if (available.length === 0) available.push(...colors);
  return available[Math.floor(Math.random() * available.length)];
}

// ---------------------------------------------------------------------------
// Color grid builder
// ---------------------------------------------------------------------------

function buildColorGrid(
  rows: number,
  cols: number,
  colors: string[],
): string[][] {
  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = pickConstrainedColor(r, c, grid, colors);
    }
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Vertical dots-only geometry (from JioRibbonVertical.tsx)
// ---------------------------------------------------------------------------

function computeVerticalDots(
  canvasWidth: number,
  canvasHeight: number,
  colors: [string, string, string],
  placement: JioRibbonPlacement,
  sizeScale = 1,
): RibbonGeometryResult {
  const cols = THIN_AXIS_DOTS;
  const height = canvasHeight;

  const geometricMean = Math.sqrt(canvasWidth * canvasHeight);
  const effectiveGeometricMean = geometricMean * sizeScale;
  // Vertical ribbon always uses landscape config — thickness driven by orientation,
  // not canvas aspect ratio. Matches Banner Builder: RIBBON_THICKNESS_RATIO = 0.18.
  const thicknessCfg = RIBBON_THICKNESS.landscape;

  const targetThickness = effectiveGeometricMean * thicknessCfg.ratio;
  const initialD = targetThickness / 16.5;
  const initialGap = initialD * 1.5;
  const initialSpacing = initialD + initialGap;

  let maxRows: number;
  if (initialGap >= height || initialSpacing <= 0 || !isFinite(initialSpacing)) {
    maxRows = 1;
  } else {
    maxRows = Math.max(1, Math.floor((height - initialGap) / initialSpacing));
  }
  let rows = Math.max(1, maxRows);

  let dotDiameter = (2 * height) / (5 * rows + 3);

  const minWidth = effectiveGeometricMean * thicknessCfg.min;
  const maxWidth = effectiveGeometricMean * thicknessCfg.max;
  let actualWidth = 13.5 * dotDiameter;
  let attempts = 0;

  while (actualWidth < minWidth && rows > 1 && attempts < 20) {
    rows--;
    dotDiameter = (2 * height) / (5 * rows + 3);
    actualWidth = 13.5 * dotDiameter;
    attempts++;
  }
  while (actualWidth > maxWidth && rows < maxRows && attempts < 20) {
    rows++;
    dotDiameter = (2 * height) / (5 * rows + 3);
    actualWidth = 13.5 * dotDiameter;
    attempts++;
  }

  if (!isFinite(dotDiameter) || dotDiameter <= 0 || rows <= 0) {
    return emptyResult();
  }

  const dotRadius = dotDiameter / 2;
  const gap = dotDiameter * 1.5;
  const spacing = dotDiameter + gap;
  const ribbonWidth = 13.5 * dotDiameter;
  const marginSize = ribbonWidth * RIBBON_MARGIN_RATIO;

  const containerWidth = ribbonWidth + marginSize * 2;
  const startX = marginSize + dotRadius;
  const startY = gap + dotRadius;

  const grid = buildColorGrid(rows, cols, colors);
  const dots: Dot[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: startX + c * spacing,
        y: startY + r * spacing,
        color: grid[r][c],
        radius: dotRadius,
      });
    }
  }

  return {
    dots,
    symbol: null,
    ribbonExtent: ribbonWidth,
    containerWidth,
    containerHeight: height,
    margin: marginSize,
    totalSlots: 0,
    slotCenters: [],
  };
}

// ---------------------------------------------------------------------------
// Horizontal dots-only geometry (from JioRibbonHorizontal.tsx)
// ---------------------------------------------------------------------------

function computeHorizontalDots(
  canvasWidth: number,
  canvasHeight: number,
  colors: [string, string, string],
  sizeScale = 1,
): RibbonGeometryResult {
  const rows = THIN_AXIS_DOTS;
  const width = canvasWidth;

  const geometricMean = Math.sqrt(canvasWidth * canvasHeight);
  const effectiveGeometricMean = geometricMean * sizeScale;
  // Horizontal ribbon always uses portrait config — thickness driven by orientation,
  // not canvas aspect ratio. Matches Banner Builder: RIBBON_THICKNESS_RATIO_PORTRAIT = 0.22.
  const thicknessCfg = RIBBON_THICKNESS.portrait;

  const ribbonThickness = effectiveGeometricMean * thicknessCfg.ratio;

  if (
    !isFinite(ribbonThickness) ||
    ribbonThickness <= 0 ||
    !isFinite(width) ||
    width <= 0
  ) {
    return emptyResult();
  }

  const initialD = ribbonThickness / 16.5;
  const initialGap = initialD * 1.5;
  const initialSpacing = initialD + initialGap;
  const cols = Math.min(
    Math.max(1, Math.floor((width - initialGap) / initialSpacing)),
    1000,
  );

  if (cols <= 0) return emptyResult();

  const dotDiameter = (2 * width) / (5 * cols + 3);
  const dotRadius = dotDiameter / 2;
  const gap = dotDiameter * 1.5;
  const spacing = dotDiameter + gap;

  const dotGridHeight = 13.5 * dotDiameter;
  const verticalInset = (ribbonThickness - dotGridHeight) / 2;
  // Edge padding: ensures ribbon dots sit dotGridHeight/3 from the canvas edge.
  // Mirrors UniversalBanner.tsx edgePadding formula from Jio-Banner-Builder:
  //   edgePadding = Max(0, actualThickness * RIBBON_MARGIN_RATIO - internalGap)
  const edgePadding = Math.max(0, dotGridHeight * RIBBON_MARGIN_RATIO - verticalInset);
  const containerHeight = ribbonThickness + 2 * edgePadding;
  const startY = edgePadding + verticalInset + dotRadius;
  const startX = gap + dotRadius;

  const grid = buildColorGrid(rows, cols, colors);
  const dots: Dot[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: startX + c * spacing,
        y: startY + r * spacing,
        color: grid[r][c],
        radius: dotRadius,
      });
    }
  }

  return {
    dots,
    symbol: null,
    ribbonExtent: dotGridHeight,
    containerWidth: width,
    containerHeight,
    margin: 0,
    totalSlots: 0,
    slotCenters: [],
  };
}

// ---------------------------------------------------------------------------
// Vertical dots-with-symbol geometry (from JioRibbonVerticalWithSymbol.tsx)
// ---------------------------------------------------------------------------

function computeVerticalWithSymbol(
  canvasWidth: number,
  canvasHeight: number,
  colors: [string, string, string],
  placement: JioRibbonPlacement,
  symbolPosition?: number,
  sizeScale = 1,
): RibbonGeometryResult {
  const cols = THIN_AXIS_DOTS;
  const height = canvasHeight;

  const geometricMean = Math.sqrt(canvasWidth * canvasHeight);
  const effectiveGeometricMean = geometricMean * sizeScale;
  // Vertical ribbon always uses landscape config — matches Banner Builder.
  const thicknessCfg = RIBBON_THICKNESS.landscape;

  const minWidth = effectiveGeometricMean * thicknessCfg.min;
  const maxWidth = effectiveGeometricMean * thicknessCfg.max;
  const targetThickness = effectiveGeometricMean * thicknessCfg.ratio;

  const targetD = targetThickness / 16.5;
  const targetSpacing = targetD * 2.5;

  let maxPossibleRows: number;
  if (targetSpacing <= 0 || !isFinite(targetSpacing)) {
    maxPossibleRows = 2;
  } else {
    maxPossibleRows = Math.max(
      2,
      Math.floor((height / targetD - 16.5) / 2.5),
    );
  }

  let totalDotRows = maxPossibleRows;
  let dotDiameter = height / (2.5 * totalDotRows + 16.5);
  let ribbonWidth = 13.5 * dotDiameter;

  while (ribbonWidth < minWidth && totalDotRows > 2) {
    totalDotRows--;
    dotDiameter = height / (2.5 * totalDotRows + 16.5);
    ribbonWidth = 13.5 * dotDiameter;
  }
  while (ribbonWidth > maxWidth && totalDotRows < maxPossibleRows) {
    totalDotRows++;
    dotDiameter = height / (2.5 * totalDotRows + 16.5);
    ribbonWidth = 13.5 * dotDiameter;
  }

  if (!isFinite(dotDiameter) || dotDiameter <= 0 || totalDotRows < 2) {
    return emptyResult();
  }

  const dotRadius = dotDiameter / 2;
  const gap = dotDiameter * 1.5;
  const spacing = dotDiameter + gap;
  const marginSize = ribbonWidth * RIBBON_MARGIN_RATIO;
  const symbolSize = ribbonWidth;
  const symbolGap = gap;

  const rowsBefore =
    symbolPosition != null
      ? Math.max(1, Math.min(totalDotRows - 1, Math.round(symbolPosition)))
      : Math.min(4, totalDotRows - 1);
  const rowsAfter = totalDotRows - rowsBefore;

  const containerWidth = ribbonWidth + marginSize * 2;
  const startX = marginSize + dotRadius;
  const block1StartY = gap + dotRadius;

  // Snap slot data
  const slotCenters: number[] = [];
  for (let k = 1; k <= totalDotRows - 1; k++) {
    const symY = block1StartY + (k - 1) * spacing + dotRadius + symbolGap;
    slotCenters.push(symY + symbolSize / 2);
  }

  const grid = buildColorGrid(totalDotRows, cols, colors);
  const dots: Dot[] = [];

  for (let r = 0; r < rowsBefore; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: startX + c * spacing,
        y: block1StartY + r * spacing,
        color: grid[r][c],
        radius: dotRadius,
      });
    }
  }

  const block1BottomEdge =
    block1StartY + (rowsBefore - 1) * spacing + dotRadius;
  const symbolY = block1BottomEdge + symbolGap;
  const symbolX = marginSize + (ribbonWidth - symbolSize) / 2;

  const block2StartY = symbolY + symbolSize + symbolGap + dotRadius;
  for (let i = 0; i < rowsAfter; i++) {
    const r = rowsBefore + i;
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: startX + c * spacing,
        y: block2StartY + i * spacing,
        color: grid[r][c],
        radius: dotRadius,
      });
    }
  }

  return {
    dots,
    symbol: {
      cx: symbolX,
      cy: symbolY,
      size: symbolSize,
      fillColor: colors[0],
    },
    ribbonExtent: ribbonWidth,
    containerWidth,
    containerHeight: height,
    margin: marginSize,
    totalSlots: totalDotRows,
    slotCenters,
  };
}

// ---------------------------------------------------------------------------
// Horizontal dots-with-symbol geometry (from JioRibbonHorizontalWithSymbol.tsx)
// ---------------------------------------------------------------------------

function computeHorizontalWithSymbol(
  canvasWidth: number,
  canvasHeight: number,
  colors: [string, string, string],
  symbolPosition?: number,
  sizeScale = 1,
): RibbonGeometryResult {
  const rows = THIN_AXIS_DOTS;
  const width = canvasWidth;

  const geometricMean = Math.sqrt(canvasWidth * canvasHeight);
  const effectiveGeometricMean = geometricMean * sizeScale;
  // Horizontal ribbon always uses portrait config — matches Banner Builder.
  const thicknessCfg = RIBBON_THICKNESS.portrait;

  const ribbonThickness = effectiveGeometricMean * thicknessCfg.ratio;

  if (
    !isFinite(ribbonThickness) ||
    ribbonThickness <= 0 ||
    !isFinite(width) ||
    width <= 0
  ) {
    return emptyResult();
  }

  const initD = ribbonThickness / 16.5;
  if (!isFinite(initD) || initD <= 0) return emptyResult();

  const totalCols = Math.min(
    Math.max(2, Math.floor((2 * width / initD - 33) / 5)),
    1000,
  );

  const dotDiameter = (2 * width) / (5 * totalCols + 33);
  const dotRadius = dotDiameter / 2;
  const gap = dotDiameter * 1.5;
  const spacing = dotDiameter + gap;

  const ribbonHeight = 13.5 * dotDiameter;
  const symbolSize = ribbonHeight;
  const symbolGap = gap;

  const colsBefore =
    symbolPosition != null
      ? Math.max(1, Math.min(totalCols - 1, Math.round(symbolPosition)))
      : Math.min(24, totalCols - 1);
  const colsAfter = totalCols - colsBefore;

  const dotGridHeight = 13.5 * dotDiameter;
  const verticalInset = (ribbonThickness - dotGridHeight) / 2;
  // Edge padding: ensures ribbon dots sit dotGridHeight/3 from the canvas edge.
  // Mirrors UniversalBanner.tsx edgePadding formula from Jio-Banner-Builder.
  const edgePadding = Math.max(0, dotGridHeight * RIBBON_MARGIN_RATIO - verticalInset);
  const containerHeight = ribbonThickness + 2 * edgePadding;
  const startY = edgePadding + verticalInset + dotRadius;
  const startX = gap + dotRadius;

  // Snap slot data
  const slotCenters: number[] = [];
  for (let k = 1; k <= totalCols - 1; k++) {
    const symX = startX + (k - 1) * spacing + dotRadius + symbolGap;
    slotCenters.push(symX + symbolSize / 2);
  }

  const grid = buildColorGrid(rows, totalCols, colors);
  const dots: Dot[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colsBefore; c++) {
      dots.push({
        x: startX + c * spacing,
        y: startY + r * spacing,
        color: grid[r][c],
        radius: dotRadius,
      });
    }
  }

  const block1LastDotRightEdge =
    startX + (colsBefore - 1) * spacing + dotRadius;
  const symbolCx = block1LastDotRightEdge + symbolGap;
  const topmostDotTop = startY - dotRadius;
  const symbolCy = topmostDotTop + (ribbonHeight - symbolSize) / 2;

  const block2StartX = symbolCx + symbolSize + symbolGap + dotRadius;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < colsAfter; i++) {
      const c = colsBefore + i;
      dots.push({
        x: block2StartX + i * spacing,
        y: startY + r * spacing,
        color: grid[r][c],
        radius: dotRadius,
      });
    }
  }

  return {
    dots,
    symbol: {
      cx: symbolCx,
      cy: symbolCy,
      size: symbolSize,
      fillColor: colors[0],
    },
    ribbonExtent: dotGridHeight,
    containerWidth: width,
    containerHeight,
    margin: 0,
    totalSlots: totalCols,
    slotCenters,
  };
}

// ---------------------------------------------------------------------------
// Empty result helper
// ---------------------------------------------------------------------------

function emptyResult(): RibbonGeometryResult {
  return {
    dots: [],
    symbol: null,
    ribbonExtent: 0,
    containerWidth: 0,
    containerHeight: 0,
    margin: 0,
    totalSlots: 0,
    slotCenters: [],
  };
}

// ---------------------------------------------------------------------------
// Unified geometry entry point
// ---------------------------------------------------------------------------

export function computeRibbonGeometry(params: {
  variant: JioRibbonVariant;
  orientation: JioRibbonOrientation;
  canvasWidth: number;
  canvasHeight: number;
  colors: [string, string, string];
  placement: JioRibbonPlacement;
  symbolPosition?: number;
  size?: JioRibbonSize;
}): RibbonGeometryResult {
  const { variant, orientation, canvasWidth, canvasHeight, colors, placement, symbolPosition, size } =
    params;
  const sizeScale = resolveRibbonSizeScale(size);

  if (variant === 'dots-with-symbol') {
    return orientation === 'vertical'
      ? computeVerticalWithSymbol(canvasWidth, canvasHeight, colors, placement, symbolPosition, sizeScale)
      : computeHorizontalWithSymbol(canvasWidth, canvasHeight, colors, symbolPosition, sizeScale);
  }

  return orientation === 'vertical'
    ? computeVerticalDots(canvasWidth, canvasHeight, colors, placement, sizeScale)
    : computeHorizontalDots(canvasWidth, canvasHeight, colors, sizeScale);
}

/**
 * Auto-detect ribbon orientation from canvas aspect ratio.
 * Landscape → vertical ribbon on side; portrait → horizontal ribbon on edge.
 */
export function resolveOrientation(
  canvasWidth: number,
  canvasHeight: number,
): JioRibbonOrientation {
  return canvasWidth > canvasHeight ? 'vertical' : 'horizontal';
}

/**
 * Default placement for a given orientation.
 */
export function defaultPlacement(
  orientation: JioRibbonOrientation,
): JioRibbonPlacement {
  return orientation === 'vertical' ? 'right' : 'bottom';
}
