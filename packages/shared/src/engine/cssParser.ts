/**
 * cssParser.ts
 *
 * Parse CSS custom property declarations into a Record<string, string>.
 * Used by useSurfaceTokenVars and any component that needs surface vars
 * as inline styles instead of global CSS injection.
 *
 * Framework-agnostic — can be used server-side, CLI, or browser.
 */

/**
 * Parse CSS custom property declarations into a key-value record.
 *
 * @example
 * parseCSSDeclarationsToVars('--Primary-FG-Bold: #FF5500;\n--Neutral-Default: #808080;')
 * // → { '--Primary-FG-Bold': '#FF5500', '--Neutral-Default': '#808080' }
 */
export function parseCSSDeclarationsToVars(cssText: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!cssText) return vars;

  for (const line of cssText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = trimmed.slice(0, colonIdx).trim();
    const val = trimmed.slice(colonIdx + 1).replace(/;$/, '').trim();
    if (prop.startsWith('--')) {
      vars[prop] = val;
    }
  }

  return vars;
}
