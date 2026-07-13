import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/button_typography_parse.dart';

void main() {
  group('buttonDisplayLabelForTextTransform', () {
    test('accepts mixed-case Uppercase', () {
      expect(
        buttonDisplayLabelForTextTransform('Uppercase', 'shout'),
        'SHOUT',
      );
    });

    test('accepts UPPERCASE', () {
      expect(
        buttonDisplayLabelForTextTransform('UPPERCASE', 'shout'),
        'SHOUT',
      );
    });

    test('unknown values degrade to normal', () {
      expect(
        buttonDisplayLabelForTextTransform('capitalize-words', 'mixed Case'),
        'mixed Case',
      );
    });
  });

  group('buttonLetterSpacingPxFromCss', () {
    test('parses em relative to font size', () {
      expect(
        buttonLetterSpacingPxFromCss('0.05em', fontSizePx: 14),
        closeTo(0.7, 0.001),
      );
    });

    test('parses px', () {
      expect(
        buttonLetterSpacingPxFromCss('2px', fontSizePx: 14),
        2,
      );
    });

    test('parses rem with base', () {
      expect(
        buttonLetterSpacingPxFromCss('0.05rem', fontSizePx: 14, remBasePx: 14),
        closeTo(0.7, 0.001),
      );
    });

    test('parses ch as approximate character width', () {
      expect(
        buttonLetterSpacingPxFromCss('0.5ch', fontSizePx: 14),
        closeTo(3.5, 0.001),
      );
    });

    test('normal returns null', () {
      expect(buttonLetterSpacingPxFromCss('normal', fontSizePx: 14), isNull);
    });
  });
}
