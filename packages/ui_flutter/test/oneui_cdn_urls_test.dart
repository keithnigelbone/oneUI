import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/cdn/oneui_cdn_urls.dart';

void main() {
  const base = 'https://cdn.example/JDS/ReactNative';

  test('normalizeOneUiCdnUrl strips trailing slash', () {
    expect(normalizeOneUiCdnUrl('$base/'), base);
  });

  test('brand and sub-brand URLs match native-cdn layout', () {
    expect(
      oneUiBrandDataUrl(base, 'jio'),
      '$base/brand-data/jio/latest.json',
    );
    expect(
      oneUiSubBrandDataUrl(base, 'jio', 'jiomart'),
      '$base/brand-data/jio/sub-brands/jiomart/latest.json',
    );
    expect(resolveOneUiBrandUrl(base, 'tira', null),
        '$base/brand-data/tira/latest.json');
    expect(resolveOneUiBrandUrl(base, 'jio', 'jiomart'),
        oneUiSubBrandDataUrl(base, 'jio', 'jiomart'));
  });
}
