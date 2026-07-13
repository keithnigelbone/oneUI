import 'dart:ui' show FontVariation;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/text_style_resolve.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import 'text_test_harness.dart';

Widget _scopeApp({
  required NativeTypographySnapshot typography,
  Map<String, dynamic>? typographyConfig,
  required Widget child,
}) {
  return OneUiScope(
    platformId: 'L',
    density: 'default',
    nativeTypography: typography,
    typographyConfig: typographyConfig,
    child: MaterialApp(home: Scaffold(body: child)),
  );
}

NativeTypographySnapshot _minimalTypography(Map<String, dynamic> extra) {
  return NativeTypographySnapshot.tryParse({
    'body': {
      'sizes': {
        'M': {
          'fontSize': 14.0,
          'lineHeight': 20.0,
          'fontWeight': 500,
          'fontFamily': 'JioType',
        },
      },
      'weights': {'high': 700, 'medium': 500, 'low': 400},
    },
    'display': {
      'sizes': {
        'M': {
          'fontSize': 32.0,
          'lineHeight': 38.0,
          'fontWeight': 900,
          'fontFamily': 'JioType',
        },
      },
    },
    'fontFamilies': {'primary': 'JioType'},
    ...extra,
  })!;
}

NativeTypographySnapshot _typographyWithStaticWeights() {
  return _minimalTypography({
    'label': {
      'sizes': {
        'M': {
          'fontSize': 14.0,
          'lineHeight': 20.0,
          'fontWeight': 500,
          'fontFamily': 'JioType',
        },
      },
      'weights': {'high': 600, 'medium': 500, 'low': 400},
    },
    'staticWeightFamilies': {
      'primary': {
        '700': 'JioTypeUI-Bold',
        '500': 'JioTypeUI-Medium',
      },
      'secondary': {
        '900': 'JioTypeUI-Black',
      },
    },
  });
}

void main() {
  group('resolveOneUiTextTypographyStyle', () {
    testWidgets(
        'static weight family omits fontWeight (RN weightViaFontFamily)',
        (tester) async {
      TextStyle? style;
      await tester.pumpWidget(
        _scopeApp(
          typography: _typographyWithStaticWeights(),
          child: Builder(
            builder: (context) {
              style = resolveOneUiTextTypographyStyle(
                context,
                variant: OneUiTextVariant.body,
                size: 'M',
                weight: OneUiTextWeight.high,
              );
              return const SizedBox();
            },
          ),
        ),
      );

      expect(style?.fontFamily, 'JioTypeUI-Bold');
      expect(style?.fontWeight, isNull);
    });

    testWidgets('letterSpacing preserved after brand font load',
        (tester) async {
      TextStyle? style;
      final typography = _minimalTypography({
        'label': {
          'sizes': {
            'M': {
              'fontSize': 14.0,
              'lineHeight': 20.0,
              'fontWeight': 500,
              'fontFamily': 'JioType',
              'letterSpacing': 0.7,
            },
          },
          'weights': {'high': 600, 'medium': 500, 'low': 400},
        },
      });

      await tester.pumpWidget(
        _scopeApp(
          typography: typography,
          child: Builder(
            builder: (context) {
              style = resolveOneUiTextTypographyStyle(
                context,
                variant: OneUiTextVariant.label,
                size: 'M',
                weight: OneUiTextWeight.medium,
              );
              return const SizedBox();
            },
          ),
        ),
      );

      expect(style?.letterSpacing, closeTo(0.7, 1e-9));
    });

    testWidgets('manual optical sizing applies opsz font variation',
        (tester) async {
      TextStyle? style;
      await tester.pumpWidget(
        _scopeApp(
          typography: textTestTypography(),
          typographyConfig: {
            'opticalSizing': {
              'headline': {'mode': 'manual', 'opszValue': 48},
            },
          },
          child: Builder(
            builder: (context) {
              style = resolveOneUiTextTypographyStyle(
                context,
                variant: OneUiTextVariant.headline,
                size: 'M',
                weight: OneUiTextWeight.medium,
              );
              return const SizedBox();
            },
          ),
        ),
      );

      expect(
        style?.fontVariations,
        contains(const FontVariation('opsz', 48)),
      );
    });

    testWidgets('skips static weight when script overlay is active',
        (tester) async {
      TextStyle? style;
      final typography = _minimalTypography({
        'staticWeightFamilies': {
          'primary': {'700': 'JioTypeUI-Bold'},
        },
        'scriptVariants': {
          'devanagari': {
            'ui': {
              'body': {
                'M': {
                  'fontFamily': 'Noto Sans Devanagari',
                  'lineHeight': 22.0,
                },
              },
            },
          },
        },
      });

      await tester.pumpWidget(
        _scopeApp(
          typography: typography,
          child: Builder(
            builder: (context) {
              style = resolveOneUiTextTypographyStyle(
                context,
                variant: OneUiTextVariant.body,
                size: 'M',
                weight: OneUiTextWeight.high,
                resolvedScript: 'devanagari',
              );
              return const SizedBox();
            },
          ),
        ),
      );

      expect(style?.fontFamily, 'Noto Sans Devanagari');
      expect(style?.fontWeight, FontWeight.w700);
    });
  });
}
