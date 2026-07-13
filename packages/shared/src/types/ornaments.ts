/**
 * ornaments.ts
 *
 * Type definitions for the Brand Ornament / Decoration System.
 * Ornaments are decorative SVG elements that brands can assign to components
 * (e.g., ornamental edges on buttons for a classic Indian style brand).
 */

/**
 * Ornament asset stored in Convex — SVG decoration uploaded by brand creators
 */
export interface OrnamentAsset {
  _id: string;
  brandId: string;
  /** Display name (e.g., "classic-scroll", "lotus-edge") */
  name: string;
  /** Raw SVG string (sanitized, <40KB) */
  svgContent: string;
  /** viewBox width / height ratio (e.g., 0.714 for a taller ornament) */
  aspectRatio: number;
  /** Ornament category: "edge" for side decorations, future: "corner", "divider" */
  category: 'edge' | 'corner' | 'divider';
  createdAt: number;
  updatedAt: number;
}

/**
 * Assignment of an ornament to a specific component for a brand (stored in Convex)
 */
export interface DecorationAssignmentRecord {
  _id: string;
  brandId: string;
  /** Component that receives the ornament (e.g., "Button", "Chip") */
  componentName: string;
  /** Reference to the ornament asset */
  ornamentId: string;
  /** Where the ornament is placed */
  placement: 'edges' | 'left' | 'right';
  /** Whether the left side is a horizontal mirror of the right SVG */
  mirror: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Resolved decoration config passed to runtime components via DecorationContext.
 * Contains the actual SVG data (not just IDs) for immediate CSS generation.
 */
export interface DecorationConfig {
  componentName: string;
  svgContent: string;
  aspectRatio: number;
  mirror: boolean;
  placement: 'edges' | 'left' | 'right';
}

/**
 * CSS custom properties generated for ornament injection
 */
export interface OrnamentCSSProperties {
  /** 1 = enabled, 0 = disabled */
  enabled: string;
  /** data URL for the right-side (original) SVG */
  svg: string;
  /** data URL for the left-side (mirrored) SVG */
  svgMirrored: string;
  /** CSS calc expression for ornament width */
  width: string;
}
