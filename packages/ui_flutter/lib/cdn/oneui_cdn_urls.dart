/// CDN URL builders — parity with `@oneui/native-cdn` `urls.ts`.
library;

/// Strip trailing slashes so segment joins never double up.
String normalizeOneUiCdnUrl(String cdnUrl) {
  return cdnUrl.replaceAll(RegExp(r'/+$'), '');
}

/// `<cdnUrl>/brand-data/<brand>/<version>.json`
String oneUiBrandDataUrl(String cdnUrl, String brand,
    {String version = 'latest'}) {
  return '${normalizeOneUiCdnUrl(cdnUrl)}/brand-data/$brand/$version.json';
}

/// `<cdnUrl>/brand-data/<brand>/sub-brands/<subBrand>/<version>.json`
String oneUiSubBrandDataUrl(
  String cdnUrl,
  String brand,
  String subBrand, {
  String version = 'latest',
}) {
  return '${normalizeOneUiCdnUrl(cdnUrl)}/brand-data/$brand/sub-brands/$subBrand/$version.json';
}

/// Resolve JSON URL for `(brand, variant)`. `base` / empty → parent brand file.
String resolveOneUiBrandUrl(
  String cdnUrl,
  String brand,
  String? variant, {
  String version = 'latest',
}) {
  if (variant == null || variant.isEmpty || variant == 'base') {
    return oneUiBrandDataUrl(cdnUrl, brand, version: version);
  }
  return oneUiSubBrandDataUrl(cdnUrl, brand, variant, version: version);
}
