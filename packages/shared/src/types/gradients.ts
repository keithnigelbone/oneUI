/**
 * gradients.ts
 *
 * Shared types for the "Gradients" foundation — a per-brand list of named
 * gradients, each paired with an "on-color" (the content colour intended to
 * sit on top of the gradient fill).
 *
 * Gradients are FLAT brand-level tokens (like Elevation / Material) — one
 * fixed value per brand, not parent-step-relative like Surfaces. Each gradient
 * emits two CSS custom properties: `--Gradient-{n}` (the fill) and
 * `--Gradient-{n}-On` (its on-color). See `engine/gradientCSS.ts`.
 *
 * Framework-agnostic — no React, no Convex dependencies.
 */

/** Gradient rendering type — maps 1:1 to the CSS gradient functions. */
export type GradientType = 'linear' | 'radial' | 'conic';

/** Radial gradient shape (the "Geometry" chip in the editor). */
export type RadialShape = 'ellipse' | 'circle';

/** A single colour stop along the gradient. */
export interface GradientStop {
  /** Stable id for editor keying / reordering. */
  id: string;
  /** Stop colour — hex or rgba string. */
  color: string;
  /** Position along the gradient axis, 0–100 (%). */
  position: number;
  /** Stop opacity, 0–100 (%). Omitted / 100 = fully opaque. */
  opacity?: number;
}

/** One brand gradient definition, as persisted in the foundation config blob. */
export interface GradientDef {
  /** Stable id (survives reorder/rename). */
  id: string;
  /** Human-readable name, e.g. "Gradient 1". */
  name: string;
  /** Rendering type. */
  type: GradientType;

  // --- Geometry (which fields apply depends on `type`) ---
  /** Angle in degrees — used by `linear` (direction) and `conic` (start angle). */
  angle?: number;
  /** Centre X, 0–100 (%) — used by `radial` and `conic`. */
  centerX?: number;
  /** Centre Y, 0–100 (%) — used by `radial` and `conic`. */
  centerY?: number;
  /** Radial extent keyword or explicit size (e.g. 'farthest-corner', '80%'). */
  size?: string;
  /** Radial shape — `radial` only. */
  shape?: RadialShape;

  /** Colour stops — at least 2. Sorted by position at emit time. */
  stops: GradientStop[];

  /** Content colour for elements placed on this gradient — hex/rgba. */
  onColor: string;
}

/** Shape of the `gradients` foundation config persisted by the editor page. */
export interface GradientsFoundationConfig {
  gradients: GradientDef[];
}
