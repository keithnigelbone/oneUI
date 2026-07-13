import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/cdn_brand_cache.dart';
import 'package:ui_flutter/brand/oneui_brands_catalog.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('CDN manifest drives brand / variant / mode pickers', () async {
    await loadBundledCdnBrandSnapshots();

    final brands = listOneUiCdnBrandSlugs();
    expect(brands.map((b) => b.slug), contains('jio'));
    expect(brands.map((b) => b.slug), isNot(contains('tira')));

    final jioVariants = listOneUiCdnBrandVariants('jio');
    expect(jioVariants.map((v) => v.variant), containsAll(['base', 'jiomart']));

    expect(
      oneUiCdnSnapshotAvailable(
        brandSlug: 'jio',
        themeProp: 'jiomart',
        mode: 'light',
      ),
      isTrue,
    );

    final modes = listOneUiCdnBrandModes(brandSlug: 'jio');
    expect(modes.map((m) => m.mode), containsAll(['light', 'dark']));
  });
}
