/// Shared harness for OneUiSlider / OneUiTouchSlider tests.
library;

import 'input_field_test_harness.dart';

export 'input_field_test_harness.dart'
    show inputFieldTestDesignSystem, pumpInputFieldApp, testWidgetsAllPlatforms;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_knob.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';

import 'input_field_test_harness.dart' show inputFieldTestTypography;

NativeDesignSystemPayload sliderTestDesignSystem() {
  final base = inputFieldTestDesignSystem();
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': base.componentCustomProperties,
    'dimensionContexts': base.dimensionContexts,
    'activeDimensionKey': base.activeDimensionKey,
    'activeDimensionContext': {
      'platformId': 'S',
      'density': 'default',
      'dimensions': {
        '--Spacing-0': '0px',
        '--Spacing-0-5': '2px',
        '--Spacing-1': '4px',
        '--Spacing-1-5': '6px',
        '--Spacing-2': '8px',
        '--Spacing-2-5': '10px',
        '--Spacing-3': '12px',
        '--Spacing-4': '16px',
        '--Spacing-4-5': '18px',
        '--Spacing-5': '20px',
        '--Spacing-6': '24px',
        '--Spacing-9': '36px',
        '--Spacing-12': '48px',
        '--Spacing-40': '160px',
        '--Dimension-f14': '328px',
        '--Stroke-XL': '2px',
        '--Shape-Pill': '9999px',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

ThemeConfig sliderStoryTestThemeConfig() {
  final grey = buildGreyscalePalette();
  final accent = buildColoredPalette();
  return ThemeConfig(
    appearances: {
      for (final role in [
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ])
        role: buildScaleDefinition(
          role,
          role == 'primary' || role == 'sparkle' ? accent : grey,
          role == 'primary' ? 600 : 1300,
          anchorBoldToBaseStep: role == 'brand-bg' || role == 'primary',
        ),
    },
  );
}

Widget pumpSliderStoryApp(
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) {
  final ds = designSystem ?? sliderTestDesignSystem();
  final surface = buildRootSurfaceContext(
    themeConfig: sliderStoryTestThemeConfig(),
    rootParentStep: 2500,
    darkMode: false,
  );
  return OneUiScope(
    platformId: 'S',
    density: 'default',
    nativeTypography: inputFieldTestTypography(),
    designSystem: ds,
    child: OneUiSurfaceScope(
      value: surface,
      child: MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: Center(
              child: SizedBox(width: 800, child: child),
            ),
          ),
        ),
      ),
    ),
  );
}

Future<void> pumpSliderStoryHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    pumpSliderStoryApp(child, designSystem: designSystem),
  );
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 16));
}

NativeDesignSystemPayload touchSliderTestDesignSystem() => sliderTestDesignSystem();

Widget pumpTouchSliderStoryApp(Widget child) => pumpSliderStoryApp(child);

Finder touchSliderTrackFinder() {
  return find.descendant(
    of: find.byType(OneUiTouchSlider),
    matching: find.byType(ClipRRect),
  );
}

Future<void> pumpTouchSliderStoryHarness(
  WidgetTester tester,
  Widget child, {
  NativeDesignSystemPayload? designSystem,
}) async {
  await pumpSliderStoryHarness(tester, child, designSystem: designSystem);
}

Finder sliderRootFinder() => find.byType(OneUiSlider);

Finder sliderTooltipFinder() =>
    find.byKey(const ValueKey<String>('oneui-slider-tooltip'));

Future<void> focusSliderThumb(WidgetTester tester, {int index = 0}) async {
  final nodes = find.descendant(
    of: sliderRootFinder(),
    matching: find.byType(Focus),
  );
  expect(nodes, findsWidgets);
  final focus = tester.widget<Focus>(nodes.at(index));
  focus.focusNode!.requestFocus();
  await tester.pump();
}

Future<void> focusTouchSlider(WidgetTester tester) async {
  final nodes = find.descendant(
    of: find.byType(OneUiTouchSlider),
    matching: find.byType(Focus),
  );
  expect(nodes, findsOneWidget);
  final focus = tester.widget<Focus>(nodes);
  focus.focusNode!.requestFocus();
  await tester.pump();
}

Finder sliderKnobHitFinder({int index = 0}) {
  return find.descendant(
    of: find.byType(OneUiSliderKnob),
    matching: find.byType(GestureDetector),
  ).at(index);
}

/// Track-level pan/tap hit target (first [GestureDetector] under the slider).
Finder sliderTrackHitFinder() {
  return find.descendant(
    of: sliderRootFinder(),
    matching: find.byType(GestureDetector),
  ).first;
}