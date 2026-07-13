import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/icons/jio_semantic_mapping.dart';
import 'package:ui_flutter/widgets/semantic_icon_material.dart';
import 'package:flutter/material.dart';

void main() {
  group('resolveCanonicalSemanticIconName', () {
    test('maps Material arrow_forward to arrowRight', () {
      expect(resolveCanonicalSemanticIconName('arrow_forward'), 'arrowRight');
      expect(jioCatalogIdForSemanticName('arrow_forward'), 'IcArrowNext');
    });

    test('material fallback resolves arrow_forward without placeholder', () {
      expect(
        oneUiMaterialIconForSemanticName('arrow_forward'),
        Icons.arrow_forward,
      );
    });
  });
}
