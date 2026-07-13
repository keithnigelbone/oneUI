/**
 * buildPreviewStyles.ts — re-export shim.
 *
 * Moved to `@oneui/shared/utils/componentPreviewStyles` so library-level
 * utilities (`buildComponentOverrideCSS`, `useDraftOverrideCSS`) can depend on
 * this logic without reaching into a platform-only feature tree.
 *
 * Kept here for platform code that still imports from the old path during the
 * ongoing ComponentTokenEditor extraction.
 */
export {
  buildComponentPreviewStyles,
  expandManifestDefaults,
  filterNonColorTokens,
  type DraftOverrideEntry,
} from '@oneui/shared';
