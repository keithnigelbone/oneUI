import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/default_jio_brand_snapshot.dart';
import 'package:ui_flutter/engine/native_theme_snapshot.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/tokens/jio_type_font.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('DefaultJioBrandSnapshot loads light + dark assets', () async {
    await DefaultJioBrandSnapshot.ensureLoaded();

    final light = DefaultJioBrandSnapshot.light;
    final dark = DefaultJioBrandSnapshot.dark;

    expect(light, isNotNull);
    expect(dark, isNotNull);
    expect(light!.schemaVersion, greaterThanOrEqualTo(2));
    expect(light.designSystem?.componentCustomProperties.isNotEmpty, isTrue);
    expect(light.typography, isNotNull);
    expect(dark!.darkMode, isTrue);
  });

  test('NativeThemeSnapshot.tryParse accepts generated default JSON shape',
      () async {
    await DefaultJioBrandSnapshot.ensureLoaded();
    final snap = DefaultJioBrandSnapshot.forMode('light');
    expect(snap, isNotNull);
    expect(snap!.themeConfig.appearances.isNotEmpty, isTrue);
  });

  test('default Jio typography primary maps to bundled JioType Variable',
      () async {
    await DefaultJioBrandSnapshot.ensureLoaded();
    final typo = DefaultJioBrandSnapshot.light!.typography;
    expect(typo, isNotNull);
    final parsed = NativeTypographySnapshot.tryParse(typo);
    expect(parsed, isNotNull);
    expect(parsed!.fontFamilyPrimaryOrBundled, kJioTypeVariableFontFamily);
    final body = parsed.emphasisStyle('body', 'M');
    expect(body, isNotNull);
    expect(applyJioVariableFontFallback(body!).fontFamily,
        kJioTypeVariableFontFamily);
  });
}
