/**
 * Persist the active brand's logo SVG to localStorage so the preloader's
 * slot-machine animation can render it before Convex resolves on the next
 * page load. Part of the FOUC-prevention contract.
 *
 * Used in two places (previously duplicated):
 *   1. `handleBrandChange` — TopBar's brand dropdown
 *   2. `handlePickerChange` — sidebar BrandPicker selection
 */
export function writeBrandLogoCache(logoSvg: string | undefined): void {
  try {
    if (logoSvg) {
      localStorage.setItem('oneui-studio:brand-logo-svg', logoSvg);
    } else {
      localStorage.removeItem('oneui-studio:brand-logo-svg');
    }
  } catch (_) {
    /* localStorage unavailable — non-fatal, preloader falls back to default. */
  }
}
