/**
 * fonts.ts — re-export shim.
 *
 * The canonical font catalogue and helpers live in `@oneui/shared/data/fonts`.
 * Library code (hooks, utils in `@oneui/ui/...`) MUST import from `@oneui/shared`
 * directly. This file is kept only so that platform-app code under
 * `components/Foundations/Typography/...` that still references the old path
 * continues to resolve during the ongoing feature-tree extraction.
 *
 * Do not add new exports here.
 */
export * from '@oneui/shared/data/fonts';
