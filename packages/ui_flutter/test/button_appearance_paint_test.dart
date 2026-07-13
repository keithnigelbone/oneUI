import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/button_color_resolve.dart';

void main() {
  group('rewriteButtonAppearanceRelativePaint', () {
    test('maps Primary-Bold to active appearance role', () {
      expect(
        rewriteButtonAppearanceRelativePaint('var(--Primary-Bold)', 'negative'),
        'var(--Negative-Bold)',
      );
      expect(
        rewriteButtonAppearanceRelativePaint(
            'var(--Primary-Subtle)', 'positive'),
        'var(--Positive-Subtle)',
      );
      expect(
        rewriteButtonAppearanceRelativePaint(
            'var(--Primary-TintedA11y)', 'informative'),
        'var(--Informative-TintedA11y)',
      );
    });

    test('leaves non-role values unchanged', () {
      expect(
        rewriteButtonAppearanceRelativePaint('transparent', 'negative'),
        'transparent',
      );
      expect(
        rewriteButtonAppearanceRelativePaint('#ff0000', 'negative'),
        '#ff0000',
      );
    });
  });
}
