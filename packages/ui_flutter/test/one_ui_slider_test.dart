import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/slider_active_track_geometry.dart';
import 'package:ui_flutter/engine/slider_size_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import 'slider_test_harness.dart';

void main() {
  group('resolveOneUiSliderState — Slider.shared.ts', () {
    test('auto resolves to secondary without surface', () {
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'auto',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      expect(state.resolvedAppearance, 'secondary');
    });

    test('auto resolves to secondary at page root (surfaceDepth 0)', () {
      final root = buildRootSurfaceContext(
        themeConfig: sliderStoryTestThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'auto',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
        surface: root,
      );
      expect(state.resolvedAppearance, 'secondary');
    });

    test('auto inherits parent surface when nested', () {
      final root = buildRootSurfaceContext(
        themeConfig: sliderStoryTestThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      final nested = root.copyWith(
        surfaceDepth: 1,
        parentAppearance: 'positive',
        parentMode: 'subtle',
      );
      final state = resolveOneUiSliderState(
        values: [50],
        appearance: 'auto',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
        surface: nested,
      );
      expect(state.resolvedAppearance, 'positive');
    });

    test('range mode when values length is 2', () {
      final state = resolveOneUiSliderState(
        values: [20, 80],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      expect(state.isRange, isTrue);
    });

    test('size defaults to m and accepts s/m/l', () {
      expect(kOneUiSliderSizes, ['s', 'm', 'l']);
      final m = resolveOneUiSliderState(
        values: [50],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'm',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      expect(m.size, 'm');
      final l = resolveOneUiSliderState(
        values: [50],
        appearance: 'secondary',
        orientation: 'horizontal',
        size: 'l',
        knobStyle: 'outside',
        showTooltip: 'auto',
        snapToSteps: true,
        disabled: false,
        readOnly: false,
      );
      expect(l.size, 'l');
    });
  });

  group('computeSliderActiveTrackGeometry — continuous fill', () {
    test('continuous: fill spans min → thumb (not zero width)', () {
      const trackLength = 328.0;
      const trackThickness = 4.0;
      final geom = computeSliderActiveTrackGeometry(
        values: [60],
        min: 0,
        max: 100,
        trackLength: trackLength,
        isRange: false,
        knobStyle: 'outside',
        trackThickness: trackThickness,
      );
      expect(geom.isEmpty, isFalse);
      expect(geom.leadingPx, 0);
      expect(geom.spanPx, closeTo(196.8, 0.1)); // 60% of 328
    });

    test('range: fill spans lower thumb → upper thumb', () {
      const trackLength = 328.0;
      final geom = computeSliderActiveTrackGeometry(
        values: [25, 75],
        min: 0,
        max: 100,
        trackLength: trackLength,
        isRange: true,
        knobStyle: 'outside',
        trackThickness: 4.0,
      );
      expect(geom.leadingPx, closeTo(82, 0.1));
      expect(geom.spanPx, closeTo(164, 0.1));
    });

    test('inside continuous extends trailing cap by track radius', () {
      final geom = computeSliderActiveTrackGeometry(
        values: [50],
        min: 0,
        max: 100,
        trackLength: 328,
        isRange: false,
        knobStyle: 'inside',
        trackThickness: 12,
      );
      expect(geom.extendTrailingPx, 6);
      expect(geom.extendLeadingPx, 0);
    });
  });

  group('OneUiSlider widget', () {
    testWidgets('renders with default value semantics', (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(defaultValue: 20, ariaLabel: 'Volume'),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(OneUiSlider), findsOneWidget);
      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('Volume')).getSemanticsData().value,
          anyOf('20', '20.0'),
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('resolveSliderLayout container width is 328px', (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(defaultValue: 50, ariaLabel: 'Layout'),
        ),
      );
      await tester.pumpAndSettle();

      final layout = resolveSliderLayout(
        tester.element(find.byType(OneUiSlider)),
        sliderTestDesignSystem(),
      );
      expect(layout.containerWidthPx, 328);
    });
  });
}
