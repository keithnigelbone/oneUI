import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_jio_brand_logo.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('DefaultJioBrandLogo loads bundled Jio mark SVG', () async {
    await DefaultJioBrandLogo.ensureLoaded();
    final svg = DefaultJioBrandLogo.svg;
    expect(svg, isNotNull);
    expect(svg, contains('<svg'));
    expect(svg, isNot(contains('circle cx="24" cy="24" r="18"')));
  });
}
