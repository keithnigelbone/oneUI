/**
 * Scope brand CSS (produced by useBrandCSS-style engine calls) so it only
 * applies under `[data-brand="<slug>"][data-mode="<mode>"]`.
 *
 * The runtime brand CSS is structured as:
 *   @import url(...);                            (Google Fonts)
 *   @layer brand {
 *     :root { ...brand tokens... }
 *     [data-surface="<mode>"] { ...remap... }
 *     [data-context-boundary] { ... }
 *     [data-appearance="<role>"] { ... }
 *     [data-material="transparent"][data-media="<context>"] { ... }
 *   }
 *
 * Plus dimension CSS, already wrapped in its own `@layer brand { ... }`:
 *   @layer brand {
 *     [data-Breakpoint="..."][data-6-Density="..."] { ...f-step overrides... }
 *   }
 *
 * To scope this per-brand+mode for CDN delivery we need to:
 *   1. Keep `@import` at the top of the file (invalid inside a rule).
 *   2. Inside `@layer brand { }`: rewrite `:root` → `[data-brand][data-mode]`,
 *      and prefix context selectors with the brand selector.
 *   3. Leave the `@layer brand { ... }` wrapper intact so cascade order matches
 *      the runtime injection order.
 *
 * **Theme variant (themeSlug provided):** the brand selector includes
 * `[data-theme="<themeSlug>"]`. A theme wrapper has brand + theme + mode, so:
 *   - Parent CSS selectors (`[data-brand][data-mode]`) still match via cascade.
 *   - Theme delta selectors (`[data-brand][data-theme][data-mode]`) win for the
 *     4 overridden accent roles.
 * A parent-only wrapper has no `data-theme` attribute.
 */
export function scopeBrandCSS(
  brandCSS: string,
  dimensionCSS: string,
  slug: string,
  mode: string,
  themeSlug?: string,
): string {
  const brandSel = themeSlug
    ? `[data-brand="${slug}"][data-theme="${themeSlug}"][data-mode="${mode}"]`
    : `[data-brand="${slug}"][data-mode="${mode}"]`;

  // 1. Pull out @import statements (anywhere in the file) → emit at the top.
  const imports: string[] = [];
  let body = brandCSS.replace(/@import\s+url\([^)]+\)\s*;?/g, (m) => {
    imports.push(m.endsWith(';') ? m : `${m};`);
    return '';
  });

  // 2. Rewrite `:root {` → scoped brand+mode selector.
  body = body.replace(/(^|\s)(:root)\s*\{/g, `$1${brandSel} {`);

  // 3. Prefix mode-specific surface-step overlay blocks (engine emits data-mode).
  const scopedModeStepRules: string[] = [];
  body = body.replace(
    /((?:\s*\[data-mode="(?:light|dark)"\]\s+\[data-surface-step="[^"]+"\]\s*,?\s*)+)\s*\{([^}]*)\}/g,
    (_rule, selectorList: string, declarations: string) => {
      const scopedSelectors: string[] = [];
      const selectorPattern = /\[data-mode="(light|dark)"\]\s+(\[data-surface-step="[^"]+"\])/g;
      let match: RegExpExecArray | null;
      while ((match = selectorPattern.exec(selectorList)) !== null) {
        if (match[1] === mode) {
          scopedSelectors.push(`${brandSel} ${match[2]}`);
        }
      }
      if (scopedSelectors.length === 0) return '';
      const placeholder = `__ONEUI_SCOPED_SURFACE_STEP_RULE_${scopedModeStepRules.length}__`;
      scopedModeStepRules.push(`\n  ${scopedSelectors.join(',\n  ')} {${declarations}}`);
      return placeholder;
    },
  );
  scopedModeStepRules.forEach((rule, index) => {
    body = body.replace(`__ONEUI_SCOPED_SURFACE_STEP_RULE_${index}__`, rule);
  });

  const SCOPED_ATTR = /^\[data-(?:surface|surface-step|appearance|context-boundary|material)\b/;
  body = body.replace(/([^{}]+)\{/g, (_match, selectorList: string) => {
    if (!/\[data-/.test(selectorList)) return `${selectorList}{`;
    const entries = selectorList.split(',');
    const scoped = entries.map((entry) => {
      const leadMatch = entry.match(/^(\s*)(.*)$/s);
      if (!leadMatch) return entry;
      const [, lead, rest] = leadMatch;
      if (SCOPED_ATTR.test(rest)) {
        return `${lead}${brandSel} ${rest}`;
      }
      return entry;
    });
    return `${scoped.join(',')}{`;
  });

  let scopedDim = '';
  if (dimensionCSS) {
    scopedDim = dimensionCSS
      .replace(/\[data-Breakpoint/g, `${brandSel} [data-Breakpoint`)
      .replace(/\[data-6-Density/g, `${brandSel} [data-6-Density`);
  }

  return [imports.join('\n'), body, scopedDim].filter(Boolean).join('\n');
}
