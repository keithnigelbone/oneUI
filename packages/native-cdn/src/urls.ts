/**
 * URL builders for the OneUI React Native brand-data CDN layout:
 *
 *   <cdnUrl>/brand-data/
 *     jio/
 *       latest.json                          ← parent brand
 *       sub-brands/
 *         jiomart/
 *           latest.json                      ← sub-brand variant
 *     tira/
 *       latest.json
 *
 * `cdnUrl` is the base up to (not including) `brand-data` — e.g.
 * `https://<host>/JDS/ReactNative`.
 */

/** Strip trailing slashes so segment joins never double up. */
export function normalizeCdnUrl(cdnUrl: string): string {
  return cdnUrl.replace(/\/+$/, '');
}

/** `<cdnUrl>/brand-data/<brand>/<version>.json` */
export function brandDataUrl(cdnUrl: string, brand: string, version = 'latest'): string {
  return `${normalizeCdnUrl(cdnUrl)}/brand-data/${brand}/${version}.json`;
}

/** `<cdnUrl>/brand-data/<brand>/sub-brands/<subBrand>/<version>.json` */
export function subBrandDataUrl(
  cdnUrl: string,
  brand: string,
  subBrand: string,
  version = 'latest',
): string {
  return `${normalizeCdnUrl(cdnUrl)}/brand-data/${brand}/sub-brands/${subBrand}/${version}.json`;
}

/**
 * Resolve the JSON URL for a `(brand, variant)` pair.
 *
 * `variant` of `undefined`, `''`, or `'base'` targets the parent brand;
 * anything else is treated as a sub-brand slug under `sub-brands/`.
 */
export function resolveBrandUrl(
  cdnUrl: string,
  brand: string,
  variant?: string,
  version = 'latest',
): string {
  return !variant || variant === 'base'
    ? brandDataUrl(cdnUrl, brand, version)
    : subBrandDataUrl(cdnUrl, brand, variant, version);
}
