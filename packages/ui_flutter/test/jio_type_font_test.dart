import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/tokens/jio_type_font.dart';

void main() {
  group('JioType Variable font normalization', () {
    test('isJioTypeFamilyName detects snapshot + static cuts', () {
      expect(isJioTypeFamilyName('JioType Var'), isTrue);
      expect(isJioTypeFamilyName('JioType Variable'), isTrue);
      expect(isJioTypeFamilyName('JioType-Medium'), isTrue);
      expect(isJioTypeFamilyName('Inter'), isFalse);
    });

    test('normalizeJioTypeFamilyName maps to bundled family', () {
      expect(normalizeJioTypeFamilyName('JioType Var'),
          kJioTypeVariableFontFamily);
      expect(normalizeJioTypeFamilyName('Roboto'), 'Roboto');
    });

    test('applyJioVariableFontFallback rewrites static cuts with weight', () {
      const style = TextStyle(fontFamily: 'JioType-Medium', fontSize: 16);
      final out = applyJioVariableFontFallback(style);
      expect(out.fontFamily, kJioTypeVariableFontFamily);
      expect(out.fontWeight, FontWeight.w500);
    });
  });
}
