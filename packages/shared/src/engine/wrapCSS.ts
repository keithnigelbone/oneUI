/**
 * wrapCSS.ts
 *
 * Wraps raw CSS declarations in the appropriate selector based on injection mode.
 * Supports three modes: none (no output), scoped (data attribute), global (:root).
 * All brand CSS is placed in @layer brand for predictable cascade ordering.
 *
 * Framework-agnostic — usable from server-side, CLI, or browser.
 */

import type { InjectionMode } from './types';

/**
 * Wrap raw CSS declarations for injection into the DOM.
 *
 * - `'none'`: returns empty string (brand CSS not applied)
 * - `'scoped'`: wraps in `@layer brand { [data-brand-scope] { ... } }`
 * - `'global'`: wraps in `@layer brand { :root { ... } }`
 *
 * @param rawCSS CSS declarations for the root/scope selector
 * @param mode Injection mode
 * @param additionalBlocks Optional CSS blocks (e.g. surface context selectors) placed
 *   alongside the root selector inside `@layer brand`. For scoped mode, surface context
 *   selectors are descendant-scoped under `[data-brand-scope]`.
 */
export function wrapCSSForInjection(
  rawCSS: string,
  mode: InjectionMode,
  additionalBlocks?: string,
): string {
  if (!rawCSS || mode === 'none') return '';

  const extra = additionalBlocks?.trim();

  if (mode === 'global') {
    const parts = [`  :root {\n    ${rawCSS}\n  }`];
    if (extra) parts.push(extra);
    return `@layer brand {\n${parts.join('\n')}\n}`;
  }

  if (mode === 'scoped') {
    const parts = [`  [data-brand-scope] {\n    ${rawCSS}\n  }`];
    if (extra) {
      // Descendant-scope surface-context + platform-scoped selectors under [data-brand-scope]
      const scopedExtra = extra
        .replace(
          /\[data-surface="([^"]+)"\]/g,
          '[data-brand-scope] [data-surface="$1"]',
        )
        .replace(
          /\[data-script="([^"]+)"\]/g,
          '[data-brand-scope] [data-script="$1"]',
        )
        .replace(
          /(^|,\n\s*)\[data-script-mode="([^"]+)"\]/g,
          '$1[data-brand-scope] [data-script-mode="$2"]',
        )
        .replace(
          /(^|,\n\s*):lang\(([^)]+)\)/g,
          '$1[data-brand-scope] :lang($2)',
        )
        .replace(
          /\[data-Breakpoint="([^"]+)"\]/g,
          '[data-brand-scope] [data-Breakpoint="$1"]',
        );
      parts.push(scopedExtra);
    }
    return `@layer brand {\n${parts.join('\n')}\n}`;
  }

  return '';
}
