import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/logo_material_resolve.dart';
import 'package:ui_flutter/engine/logo_svg_material.dart';

const _sampleSvg = '''
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="#336699" d="M12 2z"/>
</svg>''';

void main() {
  test('applyLogoSvgMaterial injects gradient and replaces fill', () {
    const colors = LogoMetallicGradientColors(
      shadow: '#111111',
      base: '#222222',
      baseLight: '#333333',
      highlight: '#ffffff',
    );
    final out = applyLogoSvgMaterial(
      _sampleSvg,
      colors: colors,
      gradientId: 'grad-test',
      target: OneUiLogoMaterialTarget.fillStroke,
    );
    expect(out, contains('id="grad-test"'));
    expect(out, contains('stop-color="#222222"'));
    expect(out, contains('fill="url(#grad-test)"'));
  });

  test('normalizeLogoMaterialPreset accepts visible presets', () {
    expect(normalizeLogoMaterialPreset('gold'), 'gold');
    expect(normalizeLogoMaterialPreset('roseGold'), 'roseGold');
    expect(normalizeLogoMaterialPreset('invalid'), isNull);
  });
}
