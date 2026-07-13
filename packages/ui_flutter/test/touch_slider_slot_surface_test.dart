import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/icon_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/engine/touch_slider_color_resolve.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

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

TouchSliderResolvedColors _sampleColors({
  required Color fill,
  required Color rail,
  required Color slotOnFill,
  required Color slotOnFillLow,
  required Color slotOnRail,
}) {
  return TouchSliderResolvedColors(
    fill: fill,
    rail: rail,
    slotOnFill: slotOnFill,
    slotOnFillLow: slotOnFillLow,
    slotOnRail: slotOnRail,
  );
}

void main() {
  group('resolveTouchSliderStartSlotColor — React slot branches', () {
    const fill = Color(0xFF111111);
    const rail = Color(0xFF222222);
    const onFill = Color(0xFF333333);
    const onFillLow = Color(0xFF444444);
    const onRail = Color(0xFF555555);
    final colors = _sampleColors(
      fill: fill,
      rail: rail,
      slotOnFill: onFill,
      slotOnFillLow: onFillLow,
      slotOnRail: onRail,
    );

    test('sharp + startOnRail uses slotOnRail (parent surface low)', () {
      expect(
        resolveTouchSliderStartSlotColor(
          colors: colors,
          startOnRail: true,
          fillRatio: 0,
          progressStyle: 'sharp',
        ),
        onRail,
      );
    });

    test('rounded at min uses slotOnFillLow (bold low on parked fill)', () {
      expect(
        resolveTouchSliderStartSlotColor(
          colors: colors,
          startOnRail: false,
          fillRatio: 0,
          progressStyle: 'rounded',
        ),
        onFillLow,
      );
    });

    test('rounded above min uses slotOnFill (bold tintedA11y)', () {
      expect(
        resolveTouchSliderStartSlotColor(
          colors: colors,
          startOnRail: false,
          fillRatio: 0.5,
          progressStyle: 'rounded',
        ),
        onFill,
      );
    });
  });

  group('TouchSlider start slot — OneUiIcon surface parity', () {
    testWidgets('sharp at min on tinted surface tints icon with parent low',
        (tester) async {
      final themeConfig = _primarySecondaryTheme();
      final root = buildRootSurfaceContext(
        themeConfig: themeConfig,
        rootParentStep: 2500,
        darkMode: false,
      );
      late Color iconColor;
      late Color expectedOnRail;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceScope(
            value: root,
            child: OneUiSurface(
              mode: 'bold',
              appearance: 'primary',
              child: OneUiScope(
                platformId: 'S',
                density: 'default',
                designSystem: sliderTestDesignSystem(),
                child: OneUiTouchSlider(
                  defaultValue: 0,
                  progressStyle: 'sharp',
                  appearance: 'secondary',
                  ariaLabel: 'Volume',
                  start: Builder(
                    builder: (context) {
                      expectedOnRail = oneUiHexColor(
                        OneUiSurfaceScope.tokensForAppearance(
                          context,
                          'primary',
                        ).content['low']!,
                      );
                      iconColor = resolveOneUiIconColor(
                        context,
                        appearance: 'secondary',
                        emphasis: OneUiIconEmphasis.high,
                      );
                      return const OneUiIcon(icon: 'volumeOn', size: '5');
                    },
                  ),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(iconColor, expectedOnRail);
      expect(iconColor, isNot(equals(
        oneUiHexColor(
          OneUiSurfaceScope.tokensForAppearance(
            tester.element(find.byType(OneUiTouchSlider)),
            'neutral',
          ).content['high']!,
        ),
      )));
    });

    testWidgets('rounded at min uses bold-low slot tint not neutral icon',
        (tester) async {
      final themeConfig = _primarySecondaryTheme();
      late Color iconColor;
      late Color expectedLow;

      await tester.pumpWidget(
        MaterialApp(
          home: OneUiSurfaceBootstrap(
            themeConfig: themeConfig,
            darkMode: false,
            child: OneUiScope(
              platformId: 'S',
              density: 'default',
              designSystem: sliderTestDesignSystem(),
              child: OneUiTouchSlider(
                defaultValue: 0,
                progressStyle: 'rounded',
                appearance: 'secondary',
                ariaLabel: 'Volume',
                start: Builder(
                  builder: (context) {
                    final secondary = OneUiSurfaceScope.tokensForAppearance(
                      context,
                      'secondary',
                    );
                    expectedLow = oneUiHexColor(
                      secondary.onBoldContent['low'] ??
                          secondary.content['low']!,
                    );
                    iconColor = resolveOneUiIconColor(
                      context,
                      appearance: 'secondary',
                      emphasis: OneUiIconEmphasis.high,
                    );
                    return const OneUiIcon(icon: 'volumeOn', size: '5');
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(iconColor, expectedLow);
    });
  });
}
