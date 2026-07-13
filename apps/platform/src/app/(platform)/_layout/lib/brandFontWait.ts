/**
 * Brand-font readiness helpers used by the AppReady preloader.
 *
 * `waitForActiveBrandFont` resolves once the document's primary font has
 * loaded (or 800ms elapse, whichever comes first). This prevents the
 * preloader from dismissing onto a fallback typography that swaps a
 * moment later — part of the FOUC-prevention contract.
 */

/** Extract the first family from a CSS `font-family` value, ignoring quoted commas. */
function getFirstFontFamily(fontFamily: string): string | null {
  const trimmed = fontFamily.trim();
  if (!trimmed) return null;

  let quote: string | null = null;
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote ? null : char;
    }
    if (char === ',' && !quote) {
      return trimmed.slice(0, index).trim();
    }
  }

  return trimmed;
}

/** Resolve when the active brand's primary font has loaded, with an 800ms timeout. */
export async function waitForActiveBrandFont(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;

  const primaryFamily = getFirstFontFamily(
    getComputedStyle(document.documentElement).getPropertyValue('--Typography-Font-Primary') ||
      getComputedStyle(document.body).fontFamily,
  );
  if (!primaryFamily) return;

  await Promise.race([
    document.fonts.load(`1em ${primaryFamily}`),
    new Promise<void>((resolve) => setTimeout(resolve, 800)),
  ]);
}
