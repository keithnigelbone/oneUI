/**
 * ornamentSvg.ts
 *
 * Pure functions for processing ornament SVGs.
 * Framework-agnostic — used by both Convex (validation) and UI (CSS generation).
 */

/** Maximum allowed SVG content size in bytes */
export const MAX_ORNAMENT_SVG_SIZE = 40 * 1024; // 40KB

/**
 * Dangerous SVG elements and attributes that must be stripped
 */
const DANGEROUS_ELEMENTS = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'use'];
const DANGEROUS_ATTRS = [
  'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
  'onsubmit', 'onreset', 'onchange', 'oninput', 'onkeydown', 'onkeyup',
];

/**
 * Encode SVG string as a CSS-safe data URL.
 * Uses URL-encoding (not base64) for smaller output with typical SVGs.
 */
export function svgToDataUrl(svgContent: string): string {
  const encoded = svgContent
    .replace(/\s+/g, ' ')   // Collapse all whitespace (newlines, tabs, runs) to single space
    .trim()                  // Strip leading/trailing whitespace
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Wrap SVG content in a horizontal mirror transform.
 * Extracts viewBox width to create translate(w,0) scale(-1,1).
 */
export function mirrorSvg(svgContent: string): string {
  const viewBox = extractViewBox(svgContent);
  if (!viewBox) return svgContent;

  const { width } = viewBox;

  // Wrap all content inside the <svg> tag with a mirror group
  return svgContent.replace(
    /(<svg[^>]*>)([\s\S]*)(<\/svg>)/i,
    `$1<g transform="translate(${width},0) scale(-1,1)">$2</g>$3`
  );
}

/**
 * Sanitize SVG content by stripping dangerous elements and attributes.
 * Returns validation result with sanitized content.
 */
export function sanitizeOrnamentSvg(svgContent: string): {
  valid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = svgContent;

  // Check size
  if (new Blob([svgContent]).size > MAX_ORNAMENT_SVG_SIZE) {
    errors.push(`SVG exceeds maximum size of ${MAX_ORNAMENT_SVG_SIZE / 1024}KB`);
    return { valid: false, sanitized: '', errors };
  }

  // Must contain <svg
  if (!/<svg[\s>]/i.test(sanitized)) {
    errors.push('Content does not contain a valid SVG element');
    return { valid: false, sanitized: '', errors };
  }

  // Strip dangerous elements
  for (const element of DANGEROUS_ELEMENTS) {
    const regex = new RegExp(`<${element}[\\s\\S]*?(?:<\\/${element}>|\\/>)`, 'gi');
    if (regex.test(sanitized)) {
      errors.push(`Removed dangerous element: <${element}>`);
      sanitized = sanitized.replace(regex, '');
    }
  }

  // Strip event handler attributes
  for (const attr of DANGEROUS_ATTRS) {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    if (regex.test(sanitized)) {
      errors.push(`Removed event handler: ${attr}`);
      sanitized = sanitized.replace(regex, '');
    }
  }

  // Strip external references (href to external URLs)
  const externalHrefRegex = /\shref\s*=\s*["'](https?:\/\/[^"']*)["']/gi;
  if (externalHrefRegex.test(sanitized)) {
    errors.push('Removed external href references');
    sanitized = sanitized.replace(externalHrefRegex, '');
  }

  // Must have a viewBox for proper scaling
  if (!extractViewBox(sanitized)) {
    errors.push('SVG must have a viewBox attribute for proper scaling');
    return { valid: false, sanitized: '', errors };
  }

  return { valid: true, sanitized, errors };
}

/**
 * Extract aspect ratio (width / height) from SVG viewBox attribute.
 * Returns 1 if viewBox is not found or invalid.
 */
export function getOrnamentAspectRatio(svgContent: string): number {
  const viewBox = extractViewBox(svgContent);
  if (!viewBox || viewBox.height === 0) return 1;
  return viewBox.width / viewBox.height;
}

/**
 * Generate CSS custom property declarations for a component's ornament.
 * These are injected via @layer brand { :root { ... } }.
 */
export function generateOrnamentCSSProperties(
  componentName: string,
  svgContent: string,
  aspectRatio: number,
  mirror: boolean,
  placement: 'edges' | 'left' | 'right' = 'edges'
): Record<string, string> {
  const prefix = `--${componentName}`;
  // Use --_btn-min-h (set per size/condensed in Button.module.css) for accurate
  // ornament width that adapts to all button sizes. Falls back to --Button-minHeight
  // and then to the default Spacing-10 (medium size).
  const widthExpr = `calc(var(--_btn-min-h, var(${prefix}-minHeight, var(--Spacing-10))) * ${aspectRatio} * var(${prefix}-ornamentHeightScale, 1))`;

  const showRight = placement === 'edges' || placement === 'right';
  const showLeft = placement === 'edges' || placement === 'left';

  const result: Record<string, string> = {};

  // Per-side widths — inactive side gets 0px so padding calc works correctly
  result[`${prefix}-ornament-width-right`] = showRight ? widthExpr : '0px';
  result[`${prefix}-ornament-width-left`] = showLeft ? widthExpr : '0px';

  // Per-side border-width suppression for ghost variant — the ornament's open stroke
  // path handles the outer curve, so CSS border on ornament edges must be 0.
  if (showLeft) {
    result[`${prefix}-ornament-border-left`] = '0px';
  }
  if (showRight) {
    result[`${prefix}-ornament-border-right`] = '0px';
  }

  return result;
}

// ============================================================================
// Inline SVG extraction (for merged ornament rendering)
// ============================================================================

export interface ExtractedSvg {
  /** Inner SVG markup (between <svg> and </svg> tags) with source paint stripped */
  innerMarkup: string;
  /** Original viewBox string (e.g., "0 0 24 48") */
  viewBox: string;
}

/**
 * Extract inner SVG content and strip hardcoded fill attributes so they
 * can be controlled via CSS (`fill: var(--_btn-bg)`).
 *
 * Returns null if the SVG is invalid or has no viewBox.
 */
export function extractSvgContent(svgContent: string): ExtractedSvg | null {
  const viewBox = extractViewBox(svgContent);
  if (!viewBox) return null;

  const viewBoxStr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  // Extract inner content between <svg...> and </svg>
  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!innerMatch) return null;

  const innerMarkup = stripSourcePaint(innerMatch[1]);

  return { innerMarkup, viewBox: viewBoxStr };
}

const PAINT_ATTRIBUTE_REGEX = /\s(?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-dasharray|stroke-dashoffset|fill-opacity|stroke-opacity|paint-order|vector-effect|opacity)\s*=\s*["'][^"']*["']/gi;
const STYLE_BLOCK_REGEX = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const STYLE_ATTRIBUTE_REGEX = /\sstyle\s*=\s*(["'])(.*?)\1/gi;
const CLASS_ATTRIBUTE_REGEX = /\sclass\s*=\s*["'][^"']*["']/gi;
const PAINT_STYLE_PROPERTY_REGEX = /^(?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-dasharray|stroke-dashoffset|fill-opacity|stroke-opacity|paint-order|vector-effect|opacity)\s*:/i;

/**
 * Remove source-authored paint from the SVG fill layer. Uploaded ornaments often
 * arrive as outline SVGs (`fill:none`, stroke classes, inline styles), but the
 * component must own fill/stroke so it can match the Button state and surface.
 */
function stripSourcePaint(markup: string): string {
  return markup
    .replace(STYLE_BLOCK_REGEX, '')
    .replace(STYLE_ATTRIBUTE_REGEX, (_match, quote: string, rawStyle: string) => {
      const declarations = rawStyle
        .split(';')
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .filter((declaration) => !PAINT_STYLE_PROPERTY_REGEX.test(declaration));

      return declarations.length > 0
        ? ` style=${quote}${declarations.join('; ')};${quote}`
        : '';
    })
    .replace(PAINT_ATTRIBUTE_REGEX, '')
    .replace(CLASS_ATTRIBUTE_REGEX, '');
}

/**
 * Extract the first <path d="..."> and produce an open version by
 * removing the closing Z/z command. This creates a path that only
 * strokes the outer curve (no inner-edge stroke where ornament meets button).
 *
 * Returns null if no path element is found.
 */
export function getClosedFillPath(svgContent: string): string | null {
  const maskPath = svgContent.match(
    /<mask[^>]*>[\s\S]*?<path[^>]*\sd\s*=\s*["']([^"']*)["']/i,
  );
  if (maskPath) return maskPath[1].trim();

  const pathMatch = svgContent.match(/<path[^>]*\sd\s*=\s*["']([^"']*)["']/i);
  if (!pathMatch) return null;
  const d = pathMatch[1].trim();
  // Ensure the path is closed — open paths leave hollow caps in fill masks
  return /[Zz]\s*$/.test(d) ? d : `${d} Z`;
}

export function getOpenStrokePath(svgContent: string): string | null {
  const pathMatch = svgContent.match(/<path[^>]*\sd\s*=\s*["']([^"']*)["']/i);
  if (!pathMatch) return null;

  // Remove closing Z command(s) — produces an open path
  return pathMatch[1].replace(/\s*[Zz]\s*/g, ' ').trim();
}

// ============================================================================
// Internal helpers
// ============================================================================

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function extractViewBox(svgContent: string): ViewBox | null {
  const match = svgContent.match(/viewBox\s*=\s*["']([^"']*)["']/i);
  if (!match) return null;

  const parts = match[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;

  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}
