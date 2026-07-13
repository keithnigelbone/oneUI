/**
 * parityEngine/types.ts
 *
 * Pure type definitions and constant lookup tables for the Figma ↔ OneUI
 * parity engine. Extracted from `parityEngine.ts` so consumers that only
 * need the result shapes (e.g. dashboard rendering, summary tables) don't
 * pull in the full inference + comparison graph.
 */

/** A variable binding found on a Figma component node */
export interface FigmaComponentBinding {
  /** Figma design property (e.g., "paddingLeft", "fills", "cornerRadius") */
  figmaProperty: string;
  /** Figma variable ID bound to this property */
  figmaVariableId: string;
  /** Figma variable name (resolved) */
  figmaVariableName: string;
  /** Resolved value (e.g., "24", "#FF5500") */
  figmaResolvedValue?: string;
  /** Layer/node name where this binding was found */
  layerName?: string;
  /** Layer path (nested) */
  layerPath?: string;
}

export interface ParityMapping {
  figmaVariableName: string;
  cssTokenName: string;
  componentName?: string;
  category: string;
  mappingSource: 'auto' | 'manual' | 'codeSyntax';
}

export interface ParityEntry {
  figmaVariableName?: string;
  cssTokenName?: string;
  category: string;
  status: 'matched' | 'mismatched' | 'missing-in-figma' | 'missing-in-tool' | 'unmapped';
  figmaValue?: string;
  toolValue?: string;
  tokenProperty?: string;
  size?: string;
  variant?: string;
  slot?: string;
}

export interface ParitySummary {
  matched: number;
  mismatched: number;
  missingInFigma: number;
  missingInTool: number;
  unmapped: number;
  total: number;
}

export interface SpacingParityRow {
  tokenProperty: string;
  slot: string | null;
  sizes: Record<
    string,
    {
      figmaValue: string | null;
      toolValue: string;
      status: ParityEntry['status'];
    }
  >;
}

export interface SpacingParityMatrix {
  rows: SpacingParityRow[];
}

/** Known abbreviations that should stay uppercase when capitalising. */
export const UPPERCASE_ABBREVIATIONS = new Set([
  'fg', 'bg', 'a11y', 'ui', 'css', 'rgb', 'hsl',
]);

/**
 * Legacy t-shirt → numeric mapping for Spacing/Shape Figma variables that
 * predate the numeric scale rename. Allows convention-based inference of
 * old `spacing/xl` etc. variable names to the current `Spacing-5` tokens.
 */
export const TSHIRT_TO_NUMERIC: Record<string, string> = {
  none: '0',
  '6xs': '0-5',
  '5xs': '1',
  '4xs': '1-5',
  '3xs': '2',
  '2xs': '2-5',
  xs: '3',
  s: '3-5',
  m: '4',
  l: '4-5',
  xl: '5',
  '2xl': '6',
  '3xl': '7',
  '4xl': '8',
  '5xl': '9',
  '6xl': '10',
  '7xl': '12',
  '8xl': '14',
  '9xl': '16',
  '10xl': '18',
  '11xl': '20',
  '12xl': '24',
  '13xl': '28',
  '14xl': '32',
  '15xl': '40',
};

/** Known CSS property patterns (kebab-case → camelCase). */
export const CSS_PROPERTY_PATTERNS: Record<string, string> = {
  'padding-horizontal': 'paddingHorizontal',
  'padding-vertical': 'paddingVertical',
  'padding-left': 'paddingLeft',
  'padding-right': 'paddingRight',
  'padding-top': 'paddingTop',
  'padding-bottom': 'paddingBottom',
  'border-radius': 'borderRadius',
  'border-width': 'borderWidth',
  'border-color': 'borderColor',
  'background-color': 'backgroundColor',
  'text-color': 'textColor',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'line-height': 'lineHeight',
  'letter-spacing': 'letterSpacing',
  'min-height': 'minHeight',
  'min-width': 'minWidth',
  'icon-size': 'iconSize',
  'icon-gap': 'iconGap',
  gap: 'gap',
};

/** Map from Figma collection name fragment → OneUI token category. */
export const COLLECTION_CATEGORY_MAP: Record<string, string> = {
  spacing: 'spacing',
  colors: 'color',
  colour: 'color',
  color: 'color',
  typography: 'typography',
  shape: 'shape',
  elevation: 'elevation',
  motion: 'motion',
  stroke: 'stroke',
  border: 'stroke',
};
