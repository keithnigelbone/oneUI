import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/brand/one_ui_brand_scope.dart';
import 'package:ui_flutter/engine/logo_color_resolve.dart';
import 'package:ui_flutter/engine/logo_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/widgets/one_ui_brand_logo.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import 'logo_test_harness.dart';

const _currentColorSvg = '''
<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10"/>
</svg>''';

NativeDesignSystemPayload _logoDs({
  required String sizeM,
  String? logoColor,
  Map<String, dynamic>? metallic,
}) {
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': <String, dynamic>{
      if (logoColor != null) '--Logo-color': logoColor,
      '--Logo-size-m': sizeM,
      '--Logo-size-l': 'var(--Spacing-6)',
      if (metallic != null) ...metallic,
    },
    'dimensionContexts': <dynamic>[
      {
        'platformId': 'S',
        'densityId': 'default',
        'dimensions': <String, String>{
          '--Spacing-5': '20px',
          '--Spacing-6': '24px',
          '--Spacing-8': '32px',
        },
        'gridMargin': '16px',
        'gridGutter': '12px',
      },
    ],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
      'densityId': 'default',
      'dimensions': <String, String>{
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-8': '32px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

ThemeConfig _theme({int primaryBase = 600}) {
  return ThemeConfig(
    appearances: {
      'primary':
          buildScaleDefinition('primary', buildColoredPalette(), primaryBase),
      'neutral': buildScaleDefinition('neutral', buildGreyscalePalette(), 1300),
    },
  );
}

Widget _harness({
  required NativeDesignSystemPayload ds,
  required String brandKey,
  required Widget child,
  ThemeConfig? themeConfig,
  String? logoSvg,
  String? brandName,
}) {
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig ?? _theme(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return MaterialApp(
    home: OneUiSurfaceScope(
      value: root,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: ds,
        child: OneUiBrandLoadState(
          loading: false,
          snapshot: null,
          brandOverview: null,
          logoSvg: logoSvg,
          brandName: brandName,
          child: KeyedSubtree(key: ValueKey(brandKey), child: child),
        ),
      ),
    ),
  );
}

void main() {
  group('Logo brand switching', () {
    testWidgets('container size updates when --Logo-size-m token changes',
        (tester) async {
      late double sizeA;
      late double sizeB;

      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-size-a',
          ds: _logoDs(sizeM: '20px'),
          child: Builder(
            builder: (context) {
              sizeA = resolveOneUiLogoSizePx(context, OneUiLogoSize.m);
              return const OneUiLogo(
                  alt: 'Brand',
                  svgContent: _currentColorSvg,
                  size: OneUiLogoSize.m);
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(sizeA, 20);

      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-size-b',
          ds: _logoDs(sizeM: '32px'),
          child: Builder(
            builder: (context) {
              sizeB = resolveOneUiLogoSizePx(context, OneUiLogoSize.m);
              return const OneUiLogo(
                key: ValueKey('logo-b'),
                alt: 'Brand',
                svgContent: _currentColorSvg,
                size: OneUiLogoSize.m,
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(sizeB, 32);
    });

    testWidgets('logo color updates when primary theme role changes',
        (tester) async {
      late Color colorA;
      late Color colorB;

      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-color-a',
          themeConfig: _theme(primaryBase: 600),
          ds: _logoDs(sizeM: 'var(--Spacing-5)'),
          child: Builder(
            builder: (context) {
              colorA = resolveOneUiLogoColor(context);
              return const OneUiLogo(
                  alt: 'Brand', svgContent: _currentColorSvg);
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-color-b',
          themeConfig: _theme(primaryBase: 1800),
          ds: _logoDs(sizeM: 'var(--Spacing-5)'),
          child: Builder(
            builder: (context) {
              colorB = resolveOneUiLogoColor(context);
              return const OneUiLogo(
                key: ValueKey('color-b'),
                alt: 'Brand',
                svgContent: _currentColorSvg,
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(colorA, isNot(equals(colorB)));
    });

    testWidgets('One UI black logo uses onBoldContent on bold surface',
        (tester) async {
      const oneUiSvg = '''
<svg viewBox="0 0 32 32" fill="none"><path fill="black" d="M8 8h16v16z"/></svg>''';

      late Color logoOnBold;

      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-oneui-bold',
          ds: _logoDs(sizeM: '24px'),
          child: OneUiSurface(
            mode: 'bold',
            child: Builder(
              builder: (ctx) {
                logoOnBold = resolveOneUiLogoColor(ctx);
                return const OneUiLogo(
                  alt: 'One UI',
                  svgContent: oneUiSvg,
                  size: OneUiLogoSize.l,
                );
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(logoOnBold, isNot(const Color(0xFF000000)));
      final iconThemeFinder = find.descendant(
        of: find.byType(OneUiLogo),
        matching: find.byType(IconTheme),
      );
      expect(iconThemeFinder, findsOneWidget);
      expect(tester.widget<IconTheme>(iconThemeFinder).data.color, logoOnBold);
    });

    testWidgets('monochrome baked logo recolors on bold surface for contrast',
        (tester) async {
      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-tira-bold',
          ds: _logoDs(sizeM: '24px'),
          child: OneUiSurface(
            mode: 'bold',
            child: Builder(
              builder: (ctx) {
                final boldBg = resolveLogoNestedSurfaceBackgroundHex(ctx)!;
                final svg =
                    '<svg viewBox="0 0 40 40"><path fill="$boldBg" d="M8 8h24v24z"/></svg>';
                return OneUiLogo(
                  alt: 'Brand',
                  svgContent: svg,
                  size: OneUiLogoSize.l,
                );
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(SvgPicture), findsOneWidget);
      final iconThemeFinder = find.descendant(
        of: find.byType(OneUiLogo),
        matching: find.byType(IconTheme),
      );
      expect(iconThemeFinder, findsOneWidget);
      expect(tester.widget<IconTheme>(iconThemeFinder).data.color, isNotNull);
    });

    testWidgets('logo color on bold Surface uses onBoldContent tokens',
        (tester) async {
      late Color onBold;
      late String? onBoldTokenHex;

      await tester.pumpWidget(
        _harness(
          brandKey: 'logo-surface',
          ds: _logoDs(
              sizeM: 'var(--Spacing-5)', logoColor: 'var(--Primary-Bold)'),
          child: OneUiSurface(
            mode: 'bold',
            child: Builder(
              builder: (ctx) {
                onBold = resolveOneUiLogoColor(ctx);
                final role =
                    OneUiSurfaceScope.tokensForAppearance(ctx, 'primary');
                onBoldTokenHex = role.onBoldContent['tintedA11y'] ??
                    role.onBoldContent['high'];
                return const SizedBox();
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(onBoldTokenHex, isNotNull);
      expect(onBold, equals(oneUiHexColor(onBoldTokenHex!)));
    });

    testWidgets('OneUiBrandLogo swaps svg when brand logoSvg changes',
        (tester) async {
      const svgA =
          '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="red"/></svg>';
      const svgB =
          '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="blue"/></svg>';

      await tester.pumpWidget(
        _harness(
          brandKey: 'brand-svg-a',
          logoSvg: svgA,
          brandName: 'Brand A',
          ds: _logoDs(sizeM: '24px'),
          child: const OneUiBrandLogo(size: OneUiLogoSize.l),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsOneWidget);

      await tester.pumpWidget(
        _harness(
          brandKey: 'brand-svg-b',
          logoSvg: svgB,
          brandName: 'Brand B',
          ds: _logoDs(sizeM: '24px'),
          child: const OneUiBrandLogo(
              key: ValueKey('brand-b'), size: OneUiLogoSize.l),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(find.byType(OneUiLogo), findsOneWidget);
    });

    testWidgets('density change remaps logo size tokens', (tester) async {
      late double sizeDefault;
      late double sizeCompact;

      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': <String, dynamic>{},
        'dimensionContexts': <dynamic>[
          {
            'platformId': 'S',
            'densityId': 'default',
            'dimensions': <String, String>{'--Spacing-5': '20px'},
            'gridMargin': '16px',
            'gridGutter': '12px',
          },
          {
            'platformId': 'S',
            'densityId': 'compact',
            'dimensions': <String, String>{'--Spacing-5': '16px'},
            'gridMargin': '12px',
            'gridGutter': '8px',
          },
        ],
        'activeDimensionKey': 'S:default',
        'activeDimensionContext': {
          'platformId': 'S',
          'densityId': 'default',
          'dimensions': <String, String>{'--Spacing-5': '20px'},
          'gridMargin': '16px',
          'gridGutter': '12px',
        },
      })!;

      Widget build({required String density, required String key}) {
        final root = buildRootSurfaceContext(
          themeConfig: _theme(),
          rootParentStep: 2500,
          darkMode: false,
        );
        return MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiScope(
              platformId: 'S',
              density: density,
              designSystem: ds,
              child: Builder(
                builder: (context) {
                  final px = resolveOneUiLogoSizePx(context, OneUiLogoSize.m);
                  if (density == 'default') {
                    sizeDefault = px;
                  } else {
                    sizeCompact = px;
                  }
                  return KeyedSubtree(
                    key: ValueKey(key),
                    child: const SizedBox.shrink(),
                  );
                },
              ),
            ),
          ),
        );
      }

      await tester.pumpWidget(build(density: 'default', key: 'd-default'));
      await tester.pumpWidget(build(density: 'compact', key: 'd-compact'));
      expect(sizeCompact, lessThan(sizeDefault));
    });
  });
}
