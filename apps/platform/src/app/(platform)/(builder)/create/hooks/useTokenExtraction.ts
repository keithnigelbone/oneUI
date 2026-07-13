/**
 * Experience Builder — Token Extraction Hook
 *
 * Extracts computed CSS custom property values from the live document
 * so they can be injected into sandboxed iframes for asset rendering.
 */

import { useMemo } from 'react';

/** Prefixes of token families to extract */
const TOKEN_PREFIXES = [
  '--Surface-',
  '--Text-',
  '--Primary-',
  '--Secondary-',
  '--Neutral-',
  '--Sparkle-',
  '--Brand-Bg-',
  '--Positive-',
  '--Negative-',
  '--Warning-',
  '--Informative-',
  '--Typography-',
  '--Spacing-',
  '--Shape-',
  '--Border-',
  '--Elevation-',
  '--Dimension-',
  '--Stroke-',
];

/**
 * Extract @font-face rules from all accessible stylesheets.
 * Returns the raw CSS text for each CSSFontFaceRule found.
 */
function extractFontFaceRules(): string {
  if (typeof document === 'undefined') return '';

  const fontFaceRules: string[] = [];

  function walkForFontFace(rules: CSSRuleList) {
    for (const rule of rules) {
      if (rule instanceof CSSFontFaceRule) {
        fontFaceRules.push(rule.cssText);
      } else if ('cssRules' in rule) {
        // Recurse into @layer, @media, @supports, etc.
        walkForFontFace((rule as CSSGroupingRule).cssRules);
      }
    }
  }

  for (const sheet of document.styleSheets) {
    try {
      walkForFontFace(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet — skip
    }
  }

  return fontFaceRules.join('\n');
}

/**
 * Extract all brand CSS custom properties from the document root.
 * Returns a CSS string of @font-face rules + `:root { --Token: value; ... }` declarations.
 */
export function extractTokensFromDocument(): string {
  if (typeof document === 'undefined') return '';

  const computedStyle = getComputedStyle(document.documentElement);
  const declarations: string[] = [];

  // Walk all stylesheets to find custom property names
  // Must recurse into @layer, @media, @supports blocks where tokens live
  const propertyNames = new Set<string>();

  function walkRules(rules: CSSRuleList) {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        for (let i = 0; i < rule.style.length; i++) {
          const prop = rule.style[i];
          if (prop.startsWith('--') && TOKEN_PREFIXES.some(p => prop.startsWith(p))) {
            propertyNames.add(prop);
          }
        }
      } else if ('cssRules' in rule) {
        // Recurse into @layer, @media, @supports, etc.
        walkRules((rule as CSSGroupingRule).cssRules);
      }
    }
  }

  for (const sheet of document.styleSheets) {
    try {
      walkRules(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet — skip
    }
  }

  // Resolve computed values
  for (const prop of propertyNames) {
    const value = computedStyle.getPropertyValue(prop).trim();
    if (value) {
      declarations.push(`  ${prop}: ${value};`);
    }
  }

  if (declarations.length === 0) return '';

  // Typography role aliases — bridge role-based names to modular scale tokens
  const typographyAliases = [
    // Size aliases (role → modular scale)
    '--Typography-Size-Display-L: var(--Typography-Size-5XL)',
    '--Typography-Size-Display-M: var(--Typography-Size-4XL)',
    '--Typography-Size-Display-S: var(--Typography-Size-3XL)',
    '--Typography-Size-Headline-L: var(--Typography-Size-2XL)',
    '--Typography-Size-Headline-M: var(--Typography-Size-XL)',
    '--Typography-Size-Headline-S: var(--Typography-Size-L)',
    '--Typography-Size-Title-L: var(--Typography-Size-M)',
    '--Typography-Size-Title-M: var(--Typography-Size-S)',
    '--Typography-Size-Title-S: var(--Typography-Size-XS)',
    '--Typography-Size-Body-L: var(--Typography-Size-S)',
    '--Typography-Size-Body-M: var(--Typography-Size-XS)',
    '--Typography-Size-Body-S: var(--Typography-Size-2XS)',
    // Line height aliases
    '--Typography-LineHeight-Display: 1.1',
    '--Typography-LineHeight-Headline: 1.2',
    '--Typography-LineHeight-Title: 1.3',
    '--Typography-LineHeight-Body: 1.5',
    // Weight aliases
    '--Typography-Weight-Display: 900',
    '--Typography-Weight-Headline-High: 700',
    '--Typography-Weight-Body-High: 600',
    '--Typography-Weight-Body-Medium: 400',
  ].map(a => `  ${a};`);

  // Include @font-face rules so brand fonts are available in sandboxed contexts
  const fontFaceCSS = extractFontFaceRules();
  const allDeclarations = [...declarations, ...typographyAliases];
  const tokenCSS = `:root {\n${allDeclarations.join('\n')}\n}`;

  return fontFaceCSS ? `${fontFaceCSS}\n\n${tokenCSS}` : tokenCSS;
}

/**
 * Hook version — re-extracts when dependency array changes.
 * Pass a key that changes when brand/theme changes to trigger re-extraction.
 */
export function useTokenExtraction(brandKey: string): string {
  return useMemo(() => extractTokensFromDocument(), [brandKey]);
}
