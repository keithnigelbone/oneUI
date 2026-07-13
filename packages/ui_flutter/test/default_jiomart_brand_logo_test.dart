import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_jiomart_brand_logo.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('DefaultJioMartBrandLogo loads bundled JioMart mark SVG', () async {
    await DefaultJioMartBrandLogo.ensureLoaded();
    final svg = DefaultJioMartBrandLogo.svg;
    expect(svg, isNotNull);
    expect(svg, contains('<svg'));
    expect(svg, contains('#008344'));
  });
}
