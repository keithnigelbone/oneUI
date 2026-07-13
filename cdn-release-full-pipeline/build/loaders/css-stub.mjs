/**
 * css-stub.mjs — Node ESM loader hook.
 *
 * Stubs any `.css` (incl. `.module.css`) import to an empty module so Node-side
 * scripts can import the @oneui/ui component registry (which transitively
 * pulls real components and their CSS Modules) without choking on
 * `Unknown file extension ".css"`.
 *
 * Wired into tsx via `--import ./cdn-release-full-pipeline/build/loaders/register.mjs`.
 *
 * Safe because:
 * - Node-side scripts only need the JS side of the registry (recipes,
 *   manifests, componentName mapping). The CSS Module's resolved classnames
 *   are never read; emitted CSS only uses `--Component-*` custom properties.
 * - Scope is the loader process only — does not affect Vite/Storybook builds.
 */

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css') || /\.css\?/.test(url)) {
    return {
      format: 'module',
      source: 'export default {};',
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
