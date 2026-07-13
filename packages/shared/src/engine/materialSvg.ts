/**
 * materialSvg.ts
 *
 * Pure-string SVG manipulation helpers for metallic Logo rendering.
 *
 * Shared between web (`@oneui/ui`) and native (`@oneui/ui-native`) so both
 * platforms produce structurally identical SVG gradients. The only difference
 * is stop colour format:
 *   - Web  (hexStops omitted): emits `stop-color="var(--Material-Metallic-*)"`.
 *   - Native (hexStops provided from ResolvedMetallicGradient.colors): emits
 *     literal `stop-color="#hex"` values, since CSS vars are unavailable in RN.
 *
 * No DOM / CSS / React dependencies — safe to import on any platform.
 */

import { getMetallicTokenLabel, type MetallicGradientType, type VisibleMetallicPresetName } from './materialCSS';

export type { MetallicGradientType };
export type { VisibleMetallicPresetName as LogoMaterial };

/** Which SVG paint channels receive the metallic material. */
export type LogoMaterialTarget = 'fill' | 'stroke' | 'fill-stroke';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function preserveSvgPaint(value: string): boolean {
  return /^(none|transparent|inherit|white|#fff|#ffffff|rgb\(255,\s*255,\s*255\)|url\()/i.test(value.trim());
}

function replaceSvgPaintDeclarations(css: string, paint: string, target: LogoMaterialTarget): string {
  return css.replace(
    /\b(fill|stroke)\s*:\s*([^;}!]+)(\s*!important)?/gi,
    (match: string, prop: string, value: string, bang?: string) => {
      const normalizedProp = prop.toLowerCase();
      const shouldReplace =
        target === 'fill-stroke'
        || (target === 'fill' && normalizedProp === 'fill')
        || (target === 'stroke' && normalizedProp === 'stroke');

      if (!shouldReplace || preserveSvgPaint(value)) return match;
      return `${prop}: ${paint}${bang ?? ''}`;
    },
  );
}

function normalizeGradientAngle(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 135;
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function formatPercent(value: number): string {
  return `${Number((value * 100).toFixed(3))}%`;
}

function getLinearGradientAttrs(angle: number): string {
  const radians = (normalizeGradientAngle(angle) * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const scale = 0.5 / Math.max(Math.abs(dx), Math.abs(dy), 0.0001);
  const x1 = 0.5 - dx * scale;
  const y1 = 0.5 - dy * scale;
  const x2 = 0.5 + dx * scale;
  const y2 = 0.5 + dy * scale;
  return `x1="${formatPercent(x1)}" y1="${formatPercent(y1)}" x2="${formatPercent(x2)}" y2="${formatPercent(y2)}"`;
}

function getRadialGradientAttrs(angle: number): string {
  const normalized = normalizeGradientAngle(angle);
  if (normalized < 22.5 || normalized >= 337.5) return 'cx="50%" cy="0%" r="100%" fx="50%" fy="0%"';
  if (normalized < 67.5) return 'cx="100%" cy="0%" r="100%" fx="100%" fy="0%"';
  if (normalized < 112.5) return 'cx="100%" cy="50%" r="100%" fx="100%" fy="50%"';
  if (normalized < 157.5) return 'cx="100%" cy="100%" r="100%" fx="100%" fy="100%"';
  if (normalized < 202.5) return 'cx="50%" cy="100%" r="100%" fx="50%" fy="100%"';
  if (normalized < 247.5) return 'cx="0%" cy="100%" r="100%" fx="0%" fy="100%"';
  if (normalized < 292.5) return 'cx="0%" cy="50%" r="100%" fx="0%" fy="50%"';
  return 'cx="0%" cy="0%" r="100%" fx="0%" fy="0%"';
}

// ─── FILL_STOPS order ─────────────────────────────────────────────────────────
// 8 stops, matching materialNative.ts FILL_STOPS:
//   [shadow(0%), base(15%), baseLight(30%), highlight(45%),
//    highlight(55%), base(70%), baseLight(85%), shadow(100%)]
const GRADIENT_POSITIONS = ['0%', '15%', '30%', '45%', '55%', '70%', '85%', '100%'] as const;

// ─── Core gradient injection ──────────────────────────────────────────────────

/**
 * Inject a `<linearGradient>` or `<radialGradient>` def into an SVG string.
 *
 * @param svgContent     Raw SVG markup string.
 * @param material       Metallic preset name (e.g. `'gold'`).
 * @param gradientId     Unique `id` for the `<defs>` element.
 * @param gradientType   `'linear'` (default) or `'radial'`.
 * @param gradientAngle  Direction in degrees (CSS convention). Default 135.
 * @param hexStops       When provided, emits literal hex stop-color values
 *                       (8 values matching FILL_STOPS order). When omitted,
 *                       emits `var(--Material-Metallic-{Preset}-*)` references
 *                       for web CSS cascade resolution.
 */
export function injectMetallicGradientDef(
  svgContent: string,
  material: VisibleMetallicPresetName,
  gradientId: string,
  gradientType: MetallicGradientType = 'linear',
  gradientAngle?: number,
  hexStops?: readonly string[],
): string {
  const label = getMetallicTokenLabel(material);
  const normalizedAngle = normalizeGradientAngle(gradientAngle);
  const isRadial = gradientType === 'radial';
  const gradientTag = isRadial ? 'radialGradient' : 'linearGradient';
  const gradientAttrs = isRadial
    ? getRadialGradientAttrs(normalizedAngle)
    : getLinearGradientAttrs(normalizedAngle);

  let stopLines: string[];
  if (hexStops && hexStops.length === 8) {
    // Native path: use literal hex values
    stopLines = GRADIENT_POSITIONS.map((pos, i) =>
      `<stop offset="${pos}" stop-color="${hexStops[i]}" />`,
    );
  } else {
    // Web path: emit CSS var references resolved at runtime
    const STOP_VAR_NAMES = [
      'Shadow', 'Base', 'BaseLight', 'Highlight',
      'Highlight', 'Base', 'BaseLight', 'Shadow',
    ];
    stopLines = GRADIENT_POSITIONS.map((pos, i) =>
      `<stop offset="${pos}" stop-color="var(--Material-Metallic-${label}-${STOP_VAR_NAMES[i]})" />`,
    );
  }

  const gradient = [
    `<${gradientTag} id="${gradientId}" ${gradientAttrs}>`,
    ...stopLines,
    `</${gradientTag}>`,
  ].join('');

  if (/<defs\b/i.test(svgContent)) {
    return svgContent.replace(/<defs\b([^>]*)>/i, `<defs$1>${gradient}`);
  }

  return svgContent.replace(/<svg\b([^>]*)>/i, `<svg$1><defs>${gradient}</defs>`);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Apply metallic gradient paint to an inline SVG string.
 *
 * Replaces `fill` / `stroke` attributes/styles with `url(#gradientId)` and
 * injects the gradient `<def>` into the SVG.
 *
 * @param hexStops  When provided (native), emits literal hex stop colours.
 *                  When omitted (web), emits CSS `var(--Material-Metallic-*)`.
 */
export function applyMetallicToSvg(
  svgContent: string,
  material: VisibleMetallicPresetName | undefined,
  gradientId: string,
  gradientType: MetallicGradientType = 'linear',
  gradientAngle?: number,
  target: LogoMaterialTarget = 'fill-stroke',
  hexStops?: readonly string[],
): string {
  if (!material || !/<svg\b/i.test(svgContent)) return svgContent;

  const paint = `url(#${gradientId})`;

  let result = svgContent.replace(
    /<rect[^>]*\bfill=["'](?:#fff(?:fff)?|#FFFFFF|white|rgb\(255,\s*255,\s*255\))["'][^>]*\/?\s*>/gi,
    '',
  );

  result = result.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_match, attrs: string, css: string) => (
      `<style${attrs}>${replaceSvgPaintDeclarations(css, paint, target)}</style>`
    ),
  );

  result = result.replace(
    /\b(fill|stroke)=(["'])([^"']+)\2/gi,
    (match: string, attr: string, quote: string, value: string) => {
      const normalizedAttr = attr.toLowerCase();
      const shouldReplace =
        target === 'fill-stroke'
        || (target === 'fill' && normalizedAttr === 'fill')
        || (target === 'stroke' && normalizedAttr === 'stroke');

      if (!shouldReplace || preserveSvgPaint(value)) return match;
      return `${attr}=${quote}${paint}${quote}`;
    },
  );

  result = result.replace(
    /style=(["'])([^"']*)\1/gi,
    (_match, quote: string, styles: string) => (
      `style=${quote}${replaceSvgPaintDeclarations(styles, paint, target)}${quote}`
    ),
  );

  return injectMetallicGradientDef(result, material, gradientId, gradientType, gradientAngle, hexStops);
}
