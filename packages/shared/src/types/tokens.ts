/**
 * Core Token Definitions
 * All design tokens across web and native platforms
 */

export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'typography'
  | 'shape'
  | 'stroke'
  | 'elevation'
  | 'motion'
  | 'accessibility'
  | 'decoration'
  | 'other';

export type TokenMode = 'light' | 'dark';

/** @deprecated Use TokenMode directly — dim was dropped in V4 */
export type TokenModeV4 = TokenMode;

export interface Token {
  name: string;
  category: TokenCategory;
  value: string;
  mode: TokenMode;
  brand: string;
  description?: string;
  deprecated?: boolean;
}

export interface ColorToken extends Token {
  category: 'color';
  oklch: {
    l: number; // Lightness 0-100
    c: number; // Chroma 0-0.4
    h: number; // Hue 0-360
  };
  wcagContrast?: number; // WCAG contrast ratio
}

export interface SpacingToken extends Token {
  category: 'spacing';
  pixels: number;
}

export interface TypographyToken extends Token {
  category: 'typography';
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface ShapeToken extends Token {
  category: 'shape';
  borderRadius: number;
}

export interface ElevationToken extends Token {
  category: 'elevation';
  shadow: string;
}

export interface MotionToken extends Token {
  category: 'motion';
  duration: number;
  easing?: string;
}

export interface TokenSet {
  [key: string]: Token;
}
