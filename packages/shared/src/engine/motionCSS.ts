/**
 * motionCSS.ts
 *
 * Pure CSS generator for motion tokens — part of the brand CSS injection pipeline.
 *
 * generateMotionCSS() takes a brand's motion foundation config (baseDuration + easings),
 * derives all 37 token values via computeMotionScale(), and returns a CSS string ready
 * to be included in the brand <style> injection block.
 *
 * Framework-agnostic — no React, no Convex dependencies.
 */

import {
  computeMotionScale,
  getDefaultMotionFoundationConfig,
  type MotionFoundationConfig,
} from '../utils/motion';

/**
 * Generate CSS custom property declarations for all 37 motion tokens.
 *
 * Returns '' when config is null/undefined — the static primitives.css Jio fallbacks
 * remain active and no brand override is injected.
 *
 * Token naming (PascalCase, consistent with the system):
 *   --Motion-Duration-L, --Motion-Duration-Subtle-L
 *   --Motion-Offset-L,   --Motion-Offset-Subtle-L
 *   --Motion-Easing-Entrance-Moderate, --Motion-Easing-Entrance-Subtle
 *   ... (37 tokens total)
 */
export function generateMotionCSS(config: MotionFoundationConfig | null | undefined): string {
  if (!config) return '';

  const scale = computeMotionScale(config.baseDuration, config.easings);
  const lines: string[] = [];

  // ── Durations — Moderate ─────────────────────────────────────────────────
  lines.push('/* Motion — Durations (Moderate) */');
  lines.push(`--Motion-Duration-2XS: ${scale.duration.moderate['2xs']}ms;`);
  lines.push(`--Motion-Duration-XS: ${scale.duration.moderate.xs}ms;`);
  lines.push(`--Motion-Duration-S: ${scale.duration.moderate.s}ms;`);
  lines.push(`--Motion-Duration-M: ${scale.duration.moderate.m}ms;`);
  lines.push(`--Motion-Duration-L: ${scale.duration.moderate.l}ms;`);
  lines.push(`--Motion-Duration-XL: ${scale.duration.moderate.xl}ms;`);
  lines.push(`--Motion-Duration-2XL: ${scale.duration.moderate['2xl']}ms;`);
  lines.push(`--Motion-Duration-3XL: ${scale.duration.moderate['3xl']}ms;`);

  // ── Durations — Subtle ───────────────────────────────────────────────────
  lines.push('/* Motion — Durations (Subtle / reduced-motion) */');
  lines.push(`--Motion-Duration-Subtle-2XS: ${scale.duration.subtle['2xs']}ms;`);
  lines.push(`--Motion-Duration-Subtle-XS: ${scale.duration.subtle.xs}ms;`);
  lines.push(`--Motion-Duration-Subtle-S: ${scale.duration.subtle.s}ms;`);
  lines.push(`--Motion-Duration-Subtle-M: ${scale.duration.subtle.m}ms;`);
  lines.push(`--Motion-Duration-Subtle-L: ${scale.duration.subtle.l}ms;`);
  lines.push(`--Motion-Duration-Subtle-XL: ${scale.duration.subtle.xl}ms;`);
  lines.push(`--Motion-Duration-Subtle-2XL: ${scale.duration.subtle['2xl']}ms;`);
  lines.push(`--Motion-Duration-Subtle-3XL: ${scale.duration.subtle['3xl']}ms;`);

  // ── Offsets — Moderate ───────────────────────────────────────────────────
  lines.push('/* Motion — Offsets / stagger delays (Moderate) */');
  lines.push(`--Motion-Offset-S: ${scale.offset.moderate.s}ms;`);
  lines.push(`--Motion-Offset-M: ${scale.offset.moderate.m}ms;`);
  lines.push(`--Motion-Offset-L: ${scale.offset.moderate.l}ms;`);
  lines.push(`--Motion-Offset-XL: ${scale.offset.moderate.xl}ms;`);
  lines.push(`--Motion-Offset-2XL: ${scale.offset.moderate['2xl']}ms;`);
  lines.push(`--Motion-Offset-3XL: ${scale.offset.moderate['3xl']}ms;`);

  // ── Offsets — Subtle ─────────────────────────────────────────────────────
  lines.push('/* Motion — Offsets / stagger delays (Subtle) */');
  lines.push(`--Motion-Offset-Subtle-S: ${scale.offset.subtle.s}ms;`);
  lines.push(`--Motion-Offset-Subtle-M: ${scale.offset.subtle.m}ms;`);
  lines.push(`--Motion-Offset-Subtle-L: ${scale.offset.subtle.l}ms;`);
  lines.push(`--Motion-Offset-Subtle-XL: ${scale.offset.subtle.xl}ms;`);
  lines.push(`--Motion-Offset-Subtle-2XL: ${scale.offset.subtle['2xl']}ms;`);
  lines.push(`--Motion-Offset-Subtle-3XL: ${scale.offset.subtle['3xl']}ms;`);

  // ── Easings ───────────────────────────────────────────────────────────────
  lines.push('/* Motion — Easing curves */');
  lines.push(`--Motion-Easing-Entrance-Moderate: ${scale.easings.entrance.moderate};`);
  lines.push(`--Motion-Easing-Entrance-Subtle: ${scale.easings.entrance.subtle};`);
  lines.push(`--Motion-Easing-Exit-Moderate: ${scale.easings.exit.moderate};`);
  lines.push(`--Motion-Easing-Exit-Subtle: ${scale.easings.exit.subtle};`);
  lines.push(`--Motion-Easing-Transition-Moderate: ${scale.easings.transition.moderate};`);
  lines.push(`--Motion-Easing-Transition-Subtle: ${scale.easings.transition.subtle};`);
  lines.push(`--Motion-Easing-Bounce-Moderate: ${scale.easings.bounce.moderate};`);
  lines.push(`--Motion-Easing-Bounce-Subtle: ${scale.easings.bounce.subtle};`);
  lines.push(`--Motion-Easing-Linear: ${scale.easings.linear};`);

  return lines.join('\n  ');
}

/**
 * Generate motion CSS using Jio default values.
 * Useful for testing and as a reference output.
 */
export function generateDefaultMotionCSS(): string {
  return generateMotionCSS(getDefaultMotionFoundationConfig());
}
