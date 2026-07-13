/**
 * Tint an SVG logo to use `currentColor` so it picks up the active text colour.
 *
 * Behaviour:
 * - White fills (#fff, #ffffff, white, rgb(255,255,255)) are preserved (logo
 *   text/icons that need to stay readable on a coloured background).
 * - `fill="none"` is preserved (transparent elements).
 * - `fill="url(...)"` is preserved (gradients/patterns).
 * - White background `<rect>` elements are stripped entirely (many exported
 *   SVGs include a full-bleed white rect that would block currentColor).
 * - All other explicit fills are rewritten to `currentColor`.
 *
 * Used by both the platform sidebar `<BrandLogo>` and the
 * `LogoPageContent` showcase to keep the tinting rule in one place.
 */
export function tintSvgToCurrentColor(svg: string): string {
  // 1. Strip white background rects
  let result = svg.replace(
    /<rect[^>]*\bfill=["'](?:#fff(?:fff)?|#FFFFFF|white|rgb\(255,\s*255,\s*255\))["'][^>]*\/?\s*>/gi,
    ''
  );
  // 2. Normalise white fills so the next regex skips them
  result = result.replace(
    /\bfill=["'](?:#fff(?:fff)?|#FFFFFF|rgb\(255,\s*255,\s*255\))["']/gi,
    'fill="white"'
  );
  // 3. Replace remaining explicit fills with currentColor
  result = result.replace(
    /\bfill=["'](?!none|white|url\(|currentColor)([^"']+)["']/gi,
    'fill="currentColor"'
  );
  return result;
}
