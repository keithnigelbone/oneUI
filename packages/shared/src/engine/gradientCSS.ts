/**
 * gradientCSS.ts
 *
 * Pure CSS generator for gradient tokens — part of the brand CSS injection
 * pipeline.
 *
 * generateGradientCSS() takes a brand's `gradients` foundation config (a list
 * of named gradient definitions, each with an on-color) and returns
 * `--Gradient-{n}` + `--Gradient-{n}-On` declarations ready to be included in
 * the brand <style> injection block.
 *
 * Gradients are FLAT brand-level tokens — one fixed value per brand (like
 * Elevation / Material), NOT parent-step-relative like Surfaces. There is no
 * [data-surface] remapping; the emitted value is the literal CSS gradient.
 *
 * Returns '' when the config is null/undefined or has no gradients — no brand
 * override is injected (same contract as elevationCSS.ts / motionCSS.ts).
 *
 * Framework-agnostic — no React, no Convex dependencies.
 */

import type {
  GradientDef,
  GradientsFoundationConfig,
} from '../types/gradients';

/**
 * A blank / whitespace colour (e.g. a stop whose hex field the user cleared)
 * would emit an invalid gradient value; fall back to `transparent` so the
 * declaration stays valid CSS.
 */
const FALLBACK_STOP_COLOR = 'transparent';

/** Trim a colour, returning null when it is blank. */
function cleanColor(color: string | undefined | null): string | null {
  const c = (color ?? '').trim();
  return c ? c : null;
}

/**
 * Apply a stop's opacity to its colour. A 6-digit hex gets an 8-digit
 * `#RRGGBBAA` form; any other colour syntax is returned unchanged (we don't
 * try to rewrite rgb()/named colours). Omitted or >=100 opacity is a no-op.
 * A blank colour falls back to `transparent` so the emitted value stays valid.
 */
function applyStopOpacity(color: string, opacity?: number): string {
  const clean = cleanColor(color);
  if (!clean) return FALLBACK_STOP_COLOR;
  if (opacity == null || opacity >= 100) return clean;
  const match = /^#([0-9a-fA-F]{6})$/.exec(clean);
  if (!match) return clean;
  const clamped = Math.max(0, Math.min(100, opacity));
  const alpha = Math.round((clamped / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${match[1]}${alpha}`;
}

/**
 * Serialise a gradient's stops to the `<color> <position>%` list shared by all
 * three CSS gradient functions. Stops are sorted by position so the emitted
 * value is stable regardless of editor insertion order; per-stop opacity is
 * folded into the colour.
 */
function stopsToCSS(stops: GradientDef['stops']): string {
  return stops
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${applyStopOpacity(s.color, s.opacity)} ${s.position}%`)
    .join(', ');
}

/**
 * Convert a single gradient definition to its CSS gradient function value.
 * Shared between the foundation editor preview and the injected brand CSS so
 * the two can never drift.
 */
export function gradientToCSS(gradient: GradientDef): string {
  const stops = stopsToCSS(gradient.stops);

  switch (gradient.type) {
    case 'radial': {
      const shape = gradient.shape ?? 'ellipse';
      const size = gradient.size ?? 'farthest-corner';
      const x = gradient.centerX ?? 50;
      const y = gradient.centerY ?? 50;
      return `radial-gradient(${shape} ${size} at ${x}% ${y}%, ${stops})`;
    }
    case 'conic': {
      const angle = gradient.angle ?? 0;
      const x = gradient.centerX ?? 50;
      const y = gradient.centerY ?? 50;
      return `conic-gradient(from ${angle}deg at ${x}% ${y}%, ${stops})`;
    }
    case 'linear':
    default: {
      const angle = gradient.angle ?? 90;
      return `linear-gradient(${angle}deg, ${stops})`;
    }
  }
}

/**
 * Generate CSS custom property declarations for a brand's gradients.
 *
 * Each gradient emits two tokens, indexed by position (1-based):
 *   --Gradient-{n}     the gradient fill value
 *   --Gradient-{n}-On  its on-color (content colour)
 */
export function generateGradientCSS(
  config: GradientsFoundationConfig | null | undefined,
): string {
  if (!config?.gradients?.length) return '';

  const lines: string[] = ['/* Gradients — brand-configured fills + on-colors */'];

  config.gradients.forEach((gradient, index) => {
    const n = index + 1;
    lines.push(`--Gradient-${n}: ${gradientToCSS(gradient)};`);
    // Skip the on-color token when the field is blank rather than emitting an
    // empty `--Gradient-{n}-On: ;` declaration.
    const onColor = cleanColor(gradient.onColor);
    if (onColor) lines.push(`--Gradient-${n}-On: ${onColor};`);
  });

  return lines.join('\n  ');
}
