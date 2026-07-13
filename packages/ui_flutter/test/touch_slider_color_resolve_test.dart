import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/engine/touch_slider_color_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import 'slider_test_harness.dart';

ThemeConfig _primarySecondaryTheme() {
  final grey = buildGreyscalePalette();
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      'primary': buildScaleDefinition(
        'primary',
        accent,
        600,
        anchorBoldToBaseStep: true,
      ),
      'secondary': buildScaleDefinition('secondary', grey, 1400),
      'neutral': buildScaleDefinition('neutral', grey, 1300),
    },
  );
}

Widget _touchSliderColorHarness({
  required Widget child,
  required ThemeConfig themeConfig,
  String surfaceMode = 'bold',
  String surfaceAppearance = 'primary',
}) {
  final root = buildRootSurfaceContext(
    themeConfig: themeConfig,
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiSurfaceScope(
    value: root,
    child: OneUiSurface(
      mode: surfaceMode,
      appearance: surfaceAppearance,
      child: OneUiScope(
        platformId: 'S',
        density: 'default',
        designSystem: sliderTestDesignSystem(),
        child: child,
      ),
    ),
  );
}

void main() {
  group('resolveTouchSliderColors — surface context', () {
    testWidgets('page root rail uses neutral minimal', (tester) async {
      final themeConfig = _primarySecondaryTheme();
      final root = buildRootSurfaceContext(
        themeConfig: themeConfig,
        rootParentStep: 2500,
        darkMode: false,
      );
      late TouchSliderResolvedColors colors;
      late Color neutralMinimal;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: sliderTestDesignSystem(),
              child: Builder(
                builder: (context) {
                  neutralMinimal = oneUiHexColor(
                    OneUiSurfaceScope.tokensForAppearance(context, 'neutral')
                        .surfaces[kSurfaceMinimal]!,
                  );
                  colors = resolveTouchSliderColors(
                    context,
                    sliderTestDesignSystem(),
                    appearance: 'secondary',
                  );
                  return const SizedBox();
                },
              ),
            ),
          ),
        ),
      );

      expect(colors.rail, neutralMinimal);
    });

    testWidgets(
        'tinted surface rail follows parent appearance, fill follows slider',
        (tester) async {
      final themeConfig = _primarySecondaryTheme();
      late TouchSliderResolvedColors colors;
      late Color primaryMinimal;
      late Color secondaryBold;
      late Color neutralMinimal;

      await tester.pumpWidget(
        MaterialApp(
          home: _touchSliderColorHarness(
            themeConfig: themeConfig,
            surfaceMode: 'bold',
            surfaceAppearance: 'primary',
            child: Builder(
              builder: (context) {
                primaryMinimal = oneUiHexColor(
                  OneUiSurfaceScope.tokensForAppearance(context, 'primary')
                      .surfaces[kSurfaceMinimal]!,
                );
                secondaryBold = oneUiHexColor(
                  OneUiSurfaceScope.tokensForAppearance(context, 'secondary')
                      .surfaces[kSurfaceBold]!,
                );
                neutralMinimal = oneUiHexColor(
                  OneUiSurfaceScope.tokensForAppearance(context, 'neutral')
                      .surfaces[kSurfaceMinimal]!,
                );
                colors = resolveTouchSliderColors(
                  context,
                  sliderTestDesignSystem(),
                  appearance: 'secondary',
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(colors.rail, primaryMinimal);
      expect(colors.rail, isNot(neutralMinimal));
      expect(colors.fill, secondaryBold);
    });

    testWidgets('default surface mode keeps neutral rail', (tester) async {
      final themeConfig = _primarySecondaryTheme();
      late TouchSliderResolvedColors colors;
      late Color neutralMinimal;

      await tester.pumpWidget(
        MaterialApp(
          home: _touchSliderColorHarness(
            themeConfig: themeConfig,
            surfaceMode: 'default',
            surfaceAppearance: 'primary',
            child: Builder(
              builder: (context) {
                neutralMinimal = oneUiHexColor(
                  OneUiSurfaceScope.tokensForAppearance(context, 'neutral')
                      .surfaces[kSurfaceMinimal]!,
                );
                colors = resolveTouchSliderColors(
                  context,
                  sliderTestDesignSystem(),
                  appearance: 'secondary',
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(colors.rail, neutralMinimal);
    });

    testWidgets('slotOnRail on tinted surface uses parent appearance low',
        (tester) async {
      final themeConfig = _primarySecondaryTheme();
      late TouchSliderResolvedColors colors;
      late Color primaryLow;
      late Color neutralLow;

      await tester.pumpWidget(
        MaterialApp(
          home: _touchSliderColorHarness(
            themeConfig: themeConfig,
            surfaceMode: 'subtle',
            surfaceAppearance: 'primary',
            child: Builder(
              builder: (context) {
                primaryLow = oneUiHexColor(
                  OneUiSurfaceScope.tokensForAppearance(context, 'primary')
                      .content['low']!,
                );
                neutralLow = oneUiHexColor(
                  OneUiSurfaceScope.tokensForAppearance(context, 'neutral')
                      .content['low']!,
                );
                colors = resolveTouchSliderColors(
                  context,
                  sliderTestDesignSystem(),
                  appearance: 'secondary',
                );
                return const SizedBox();
              },
            ),
          ),
        ),
      );

      expect(colors.slotOnRail, primaryLow);
      expect(colors.slotOnRail, isNot(neutralLow));
    });
  });
}
