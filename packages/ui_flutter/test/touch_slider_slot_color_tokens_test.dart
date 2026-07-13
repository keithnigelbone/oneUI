import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/icon_color_resolve.dart';
import 'package:ui_flutter/engine/touch_slider_color_resolve.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import 'slider_test_harness.dart';

void main() {
  testWidgets('slotOnFill uses onBold tintedA11y; slotOnFillLow uses bold low',
      (tester) async {
    final root = buildRootSurfaceContext(
      themeConfig: sliderStoryTestThemeConfig(),
      rootParentStep: 2500,
      darkMode: false,
    );
    late TouchSliderResolvedColors colors;
    late Color onBoldTinted;
    late Color onBoldLow;

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
                final role =
                    OneUiSurfaceScope.tokensForAppearance(context, 'secondary');
                onBoldTinted = oneUiHexColor(
                  role.onBoldContent['tintedA11y']!,
                );
                onBoldLow = oneUiHexColor(
                  role.onBoldContent['low'] ?? role.content['low']!,
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

    expect(colors.slotOnFill, onBoldTinted);
    expect(colors.slotOnFillLow, onBoldLow);
    expect(colors.slotOnFill, isNot(colors.slotOnFillLow));
  });

  testWidgets('rounded icon tint changes between value 0 and value 50',
      (tester) async {
    Color? iconAtZero;
    Color? iconAtHalf;

    Widget harness(double value) {
      return MaterialApp(
        home: OneUiSurfaceBootstrap(
          themeConfig: sliderStoryTestThemeConfig(),
          darkMode: false,
          child: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: sliderTestDesignSystem(),
            child: OneUiTouchSlider(
              value: value,
              progressStyle: 'rounded',
              appearance: 'secondary',
              ariaLabel: 'Volume',
              start: Builder(
                builder: (context) {
                  final c = resolveOneUiIconColor(
                    context,
                    appearance: 'secondary',
                    emphasis: OneUiIconEmphasis.high,
                  );
                  if (value <= 0) {
                    iconAtZero = c;
                  } else {
                    iconAtHalf = c;
                  }
                  return const OneUiIcon(icon: 'volumeOn', size: '5');
                },
              ),
            ),
          ),
        ),
      );
    }

    await tester.pumpWidget(harness(0));
    await tester.pumpAndSettle();
    await tester.pumpWidget(harness(50));
    await tester.pumpAndSettle();

    expect(iconAtZero, isNotNull);
    expect(iconAtHalf, isNotNull);
    expect(iconAtZero, isNot(iconAtHalf));
  });
}
