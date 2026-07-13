/// Slider Figma-parity QA suite — `[figma]`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/slider_active_track_geometry.dart';
import 'package:ui_flutter/engine/slider_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import '../../support/components/slider_harness.dart';

void main() {
  group('[figma] Slider — size API', () {
    test('[figma] exposes s/m/l sizes matching Figma API table', () {
      expect(kOneUiSliderSizes, kOneUiSliderFigmaApiSizes);
    });

    for (final size in kOneUiSliderSizes) {
      testWidgetsAllPlatforms('[figma] size=$size renders with 328px width',
          (tester) async {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            size: size,
            ariaLabel: 'Figma size $size',
          ),
        );
        expect(sliderContainerWidthPx(tester), 328);
        expect(
          resolveOneUiSliderState(
            values: [50],
            appearance: 'secondary',
            orientation: 'horizontal',
            size: size,
            knobStyle: 'outside',
            showTooltip: 'auto',
            snapToSteps: true,
            disabled: false,
            readOnly: false,
          ).size,
          size,
        );
      });
    }

    testWidgetsAllPlatforms('[figma] knob diameters increase s < m < l',
        (tester) async {
      final layouts = <String, SliderResolvedLayout>{};
      for (final size in kOneUiSliderSizes) {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            size: size,
            ariaLabel: 'Size $size',
          ),
        );
        layouts[size] = sliderResolvedLayout(tester, size: size);
      }
      expect(
        layouts['s']!.knobOutsidePx,
        lessThan(layouts['m']!.knobOutsidePx),
      );
      expect(
        layouts['m']!.knobOutsidePx,
        lessThan(layouts['l']!.knobOutsidePx),
      );
      expect(
        layouts['s']!.trackHeightOutsidePx,
        lessThanOrEqualTo(layouts['l']!.trackHeightOutsidePx),
      );
    });

    testWidgetsAllPlatforms('[figma] hit target meets mobile minimum for all sizes',
        (tester) async {
      for (final size in kOneUiSliderSizes) {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            size: size,
            ariaLabel: 'Hit $size',
          ),
        );
        final layout = sliderResolvedLayout(tester, size: size);
        expect(layout.hitTargetPx, greaterThanOrEqualTo(44));
      }
    });
  });

  group('[figma] Slider — layout width', () {
    testWidgetsAllPlatforms('[figma] default layout width is 328px',
        (tester) async {
      await pumpSliderQaHarness(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Size probe'),
      );
      expect(sliderContainerWidthPx(tester), 328);
    });
  });

  group('[figma] Slider — appearance', () {
    for (final appearance in kOneUiSliderFigmaAppearanceRoles) {
      testWidgetsAllPlatforms('[figma] appearance=$appearance renders',
          (tester) async {
        await pumpSliderQaHarness(
          tester,
          OneUiSlider(
            defaultValue: 50,
            appearance: appearance,
            ariaLabel: appearance,
          ),
        );
        expect(sliderRootFinder(), findsOneWidget);
      });
    }
  });

  group('[figma] Slider — orientation × knobStyle', () {
    for (final orientation in kOneUiSliderOrientations) {
      for (final knob in kOneUiSliderKnobStyles) {
        testWidgetsAllPlatforms('[figma] $orientation / $knob renders',
            (tester) async {
          await pumpSliderQaHarness(
            tester,
            OneUiSlider(
              defaultValue: 50,
              orientation: orientation,
              knobStyle: knob,
              ariaLabel: '$orientation-$knob',
            ),
          );
          expect(sliderRootFinder(), findsOneWidget);
        });
      }
    }
  });

  group('[figma] Slider — continuous active track', () {
    test('[figma] continuous fill geometry is 50% span at mid value', () {
      final geom = computeSliderActiveTrackGeometry(
        values: [50],
        min: 0,
        max: 100,
        trackLength: 328,
        isRange: false,
        knobStyle: 'outside',
        trackThickness: 4,
      );
      expect(geom.isEmpty, isFalse);
      expect(geom.leadingPx, 0);
      expect(geom.spanPx, closeTo(164, 2));
    });
  });

  group('[figma] Slider — state resolver', () {
    test('[figma] auto resolves to secondary without surface', () {
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

    test('[figma] range mode detected from list defaultValue', () {
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

    test('[figma] brand-bg is not in Figma appearance API', () {
      expect(kOneUiSliderAppearances, isNot(contains('brand-bg')));
    });
  });
}
