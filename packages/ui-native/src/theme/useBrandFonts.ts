import type { NativeCustomFontDescriptor } from '@oneui/shared/engine';

export interface UseBrandFontsResult {
  /** True once every font in `descriptors` has finished loading (or failed). */
  ready: boolean;
  /** Surfaced for diagnostics; never throws. */
  error: Error | null;
}

/**
 * No-op in `@oneui/ui-native`.
 *
 * Font loading and registration is the responsibility of the consuming app.
 * This hook is kept for API compatibility but does not attempt to load any
 * font files — it simply reports `ready: true`.
 */
export function useBrandFonts(
  descriptors: NativeCustomFontDescriptor[] | undefined,
): UseBrandFontsResult {
  void descriptors;
  return { ready: true, error: null };
}
