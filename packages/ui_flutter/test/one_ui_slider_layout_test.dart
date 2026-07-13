import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/slider_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';

import 'slider_test_harness.dart';

void main() {
  group('OneUiSlider layout — Figma size contract', () {
    testWidgets('container width is fixed 328px (Figma layout constant)',
        (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(defaultValue: 50, ariaLabel: 'W'),
        ),
      );
      await tester.pumpAndSettle();

      final layout = resolveSliderLayout(
        tester.element(find.byType(OneUiSlider)),
        sliderTestDesignSystem(),
      );
      expect(layout.containerWidthPx, 328);
    });

    testWidgets('outside knob is larger than inside knob', (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(defaultValue: 50, ariaLabel: 'K'),
        ),
      );
      await tester.pumpAndSettle();

      final layout = resolveSliderLayout(
        tester.element(find.byType(OneUiSlider)),
        sliderTestDesignSystem(),
      );
      expect(layout.knobOutsidePx, greaterThan(layout.knobInsidePx));
    });

    testWidgets('vertical layout height resolves from spacing scale',
        (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          SizedBox(
            height: 200,
            child: OneUiSlider(
              defaultValue: 50,
              orientation: 'vertical',
              ariaLabel: 'V',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final layout = resolveSliderLayout(
        tester.element(find.byType(OneUiSlider)),
        sliderTestDesignSystem(),
      );
      expect(layout.verticalHeightPx, greaterThan(0));
    });

    testWidgets('knob diameters increase across Figma sizes s < m < l',
        (tester) async {
      final outside = <String, double>{};
      for (final size in ['s', 'm', 'l']) {
        await tester.pumpWidget(
          pumpSliderStoryApp(
            OneUiSlider(
              defaultValue: 50,
              size: size,
              ariaLabel: 'Size $size',
            ),
          ),
        );
        await tester.pumpAndSettle();
        final layout = resolveSliderLayout(
          tester.element(find.byType(OneUiSlider)),
          sliderTestDesignSystem(),
          size: size,
        );
        outside[size] = layout.knobOutsidePx;
      }
      expect(outside['s']!, lessThan(outside['m']!));
      expect(outside['m']!, lessThan(outside['l']!));
    });

    testWidgets('hit target is at least 44px for every Figma size', (tester) async {
      for (final size in ['s', 'm', 'l']) {
        await tester.pumpWidget(
          pumpSliderStoryApp(
            OneUiSlider(
              defaultValue: 50,
              size: size,
              ariaLabel: 'Hit $size',
            ),
          ),
        );
        await tester.pumpAndSettle();
        final layout = resolveSliderLayout(
          tester.element(find.byType(OneUiSlider)),
          sliderTestDesignSystem(),
          size: size,
        );
        expect(layout.hitTargetPx, greaterThanOrEqualTo(44));
      }
    });
  });
}
