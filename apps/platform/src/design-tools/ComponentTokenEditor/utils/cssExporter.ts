/**
 * cssExporter.ts
 *
 * Utilities for generating CSS from token overrides.
 * Used for Storybook sync and CSS export functionality.
 */

import type { TokenOverrideValue, ComponentTokenManifest } from '@oneui/shared';

/**
 * Options for CSS export
 */
export interface CSSExportOptions {
  /** Brand slug for CSS selector */
  brandSlug: string;
  /** Component name for CSS variable prefix */
  componentName: string;
  /** Token overrides to export */
  overrides: TokenOverrideValue[];
  /** Which modes to generate CSS for */
  modes?: ('light' | 'dark')[];
  /** Whether to include comments */
  includeComments?: boolean;
  /** Indentation string */
  indent?: string;
}

/**
 * Generate CSS for brand-specific component overrides
 *
 * @example
 * // Output:
 * // [data-brand='jiocinema'] {
 * //   --Button-backgroundColor: var(--Surface-Subtle);
 * //   --Button-textColor: var(--Text-High);
 * // }
 */
export function generateBrandCSS(options: CSSExportOptions): string {
  const {
    brandSlug,
    componentName,
    overrides,
    modes = ['light', 'dark'],
    includeComments = true,
    indent = '  ',
  } = options;

  if (overrides.length === 0) {
    return '';
  }

  const cssBlocks: string[] = [];

  // Generate CSS for each mode
  for (const mode of modes) {
    const modeOverrides = overrides.filter((o) => o.mode === mode);

    if (modeOverrides.length === 0) continue;

    // Build selector based on mode
    const selector =
      mode === 'light'
        ? `[data-brand='${brandSlug}']`
        : `[data-brand='${brandSlug}'][data-mode='${mode}']`;

    // Generate comment if enabled
    const comment = includeComments
      ? `/* ${componentName} overrides for ${brandSlug} - ${mode} mode */\n`
      : '';

    // Generate CSS properties
    const properties = modeOverrides
      .map((o) => {
        const varName = formatTokenVariableName(componentName, o.tokenName, o);
        return `${indent}${varName}: var(--${o.selectedToken});`;
      })
      .join('\n');

    cssBlocks.push(`${comment}${selector} {\n${properties}\n}`);
  }

  return cssBlocks.join('\n\n');
}

/**
 * Generate CSS custom properties for component override tokens
 * These become the override-able tokens in the component's CSS module
 *
 * @example
 * // Output:
 * // :root {
 * //   --Button-backgroundColor: var(--Surface-Bold);
 * //   --Button-textColor: var(--Text-OnBold-High);
 * // }
 */
export function generateComponentOverrideCSS(
  componentName: string,
  manifest: ComponentTokenManifest,
  includeComments: boolean = true
): string {
  const indent = '  ';
  const lines: string[] = [];

  if (includeComments) {
    lines.push(`/* ${componentName} override tokens */`);
    lines.push(`/* These can be overridden per-brand using [data-brand] selectors */`);
    lines.push('');
  }

  lines.push(':root {');

  // Group tokens by category for organization
  const categories = Object.entries(manifest.tokens).reduce<
    Record<string, Array<[string, typeof manifest.tokens[string]]>>
  >((acc, [name, def]) => {
    const cat = def.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push([name, def]);
    return acc;
  }, {});

  for (const [category, tokens] of Object.entries(categories)) {
    if (includeComments) {
      lines.push(`${indent}/* ${category.toUpperCase()} */`);
    }

    for (const [tokenName, definition] of tokens) {
      const varName = `--${componentName}-${tokenName}`;
      const defaultValue = `var(--${definition.defaultToken})`;

      if (includeComments && definition.description) {
        lines.push(`${indent}/* ${definition.description} */`);
      }

      lines.push(`${indent}${varName}: ${defaultValue};`);

      // Also generate variant-specific tokens if they exist
      if (definition.variants) {
        for (const [variant, token] of Object.entries(definition.variants)) {
          const variantVarName = `--${componentName}-${tokenName}-${variant}`;
          const variantValue =
            token === 'transparent' ? 'transparent' : `var(--${token})`;
          lines.push(`${indent}${variantVarName}: ${variantValue};`);
        }
      }
    }

    lines.push('');
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate inline styles object from draft overrides
 * Used for live preview without CSS file generation
 */
export function generatePreviewStyles(
  componentName: string,
  overrides: Map<string, TokenOverrideValue>
): Record<string, string> {
  const styles: Record<string, string> = {};

  for (const [key, override] of overrides) {
    const varName = `--${componentName}-${override.tokenName}`;
    styles[varName] = `var(--${override.selectedToken})`;
  }

  return styles;
}

/**
 * Format a token variable name including variant/state/size suffix if present
 */
function formatTokenVariableName(
  componentName: string,
  tokenName: string,
  override: TokenOverrideValue
): string {
  let varName = `--${componentName}-${tokenName}`;

  if (override.variant) {
    varName += `-${override.variant}`;
  }
  if (override.state && override.state !== 'default') {
    varName += `-${override.state}`;
  }
  if (override.size) {
    varName += `-${override.size}`;
  }

  return varName;
}

/**
 * Parse CSS custom properties from a CSS string
 * Useful for reading existing override files
 */
export function parseCSSCustomProperties(
  css: string
): Map<string, string> {
  const properties = new Map<string, string>();
  const regex = /--([\w-]+):\s*([^;]+);/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    properties.set(`--${match[1]}`, match[2].trim());
  }

  return properties;
}

/**
 * Convert overrides map to array for export
 */
export function overridesToArray(
  overrides: Map<string, TokenOverrideValue>
): TokenOverrideValue[] {
  return Array.from(overrides.values());
}

/**
 * Convert overrides array to map for context
 */
export function overridesToMap(
  overrides: TokenOverrideValue[]
): Map<string, TokenOverrideValue> {
  const map = new Map<string, TokenOverrideValue>();

  for (const override of overrides) {
    const key = override.variant
      ? `${override.tokenName}.${override.variant}`
      : override.state && override.state !== 'default'
      ? `${override.tokenName}.${override.state}`
      : override.size
      ? `${override.tokenName}.${override.size}`
      : override.tokenName;

    map.set(key, override);
  }

  return map;
}

/**
 * Generate a downloadable CSS file content
 */
export function generateDownloadableCSS(options: {
  brandSlug: string;
  componentName: string;
  overrides: TokenOverrideValue[];
  timestamp?: boolean;
}): string {
  const { brandSlug, componentName, overrides, timestamp = true } = options;

  const header = [
    '/**',
    ` * ${componentName} Token Overrides for ${brandSlug}`,
    ' * Generated by One UI Studio Component Token Editor',
    timestamp ? ` * Generated at: ${new Date().toISOString()}` : '',
    ' *',
    ' * Import this file in your Storybook preview.ts or application CSS',
    ' */',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  const css = generateBrandCSS({
    brandSlug,
    componentName,
    overrides,
    includeComments: true,
  });

  return header + css;
}
