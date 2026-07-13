import 'dart:ui' show FontFeature, FontVariation;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/typography_role_features.dart';

void main() {
  group('typography_role_features', () {
    test('resolveTypographyLetterSpacingPx prefers snapshot value', () {
      expect(
        resolveTypographyLetterSpacingPx(
          typographyConfig: {
            'letterSpacing': {'label': 0.1}
          },
          role: 'label',
          fontSize: 14,
          snapshotLetterSpacing: 0.5,
        ),
        0.5,
      );
    });

    test('resolveTypographyLetterSpacingPx converts em from config', () {
      expect(
        resolveTypographyLetterSpacingPx(
          typographyConfig: {
            'letterSpacing': {'label': 0.05}
          },
          role: 'label',
          fontSize: 14,
        ),
        closeTo(0.7, 1e-9),
      );
    });

    test('resolveTypographyFontVariations emits opsz for manual mode', () {
      final variations = resolveTypographyFontVariations(
        typographyConfig: {
          'opticalSizing': {
            'display': {'mode': 'manual', 'opszValue': 72},
          },
        },
        role: 'display',
      );
      expect(variations, [const FontVariation('opsz', 72)]);
    });

    test('resolveTypographyFontVariations skips auto mode', () {
      expect(
        resolveTypographyFontVariations(
          typographyConfig: {
            'opticalSizing': {
              'display': {'mode': 'auto'},
            },
          },
          role: 'display',
        ),
        isNull,
      );
    });

    test('resolveTypographyFontFeatures disables ligatures', () {
      final features = resolveTypographyFontFeatures(
        typographyConfig: {
          'fontFeatures': {
            'primary': {'ligatures': false},
          },
        },
        role: 'body',
      );
      expect(features, contains(const FontFeature.disable('liga')));
      expect(features, contains(const FontFeature.disable('clig')));
    });

    test('resolveTypographyFontFeatures uses secondary slot for headline', () {
      final features = resolveTypographyFontFeatures(
        typographyConfig: {
          'fontFeatures': {
            'secondary': {'contextualAlternates': false},
          },
        },
        role: 'headline',
      );
      expect(features, [const FontFeature.disable('calt')]);
    });
  });
}
