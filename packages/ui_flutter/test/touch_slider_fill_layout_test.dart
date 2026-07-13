import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/touch_slider_cap_ratio.dart';
import 'package:ui_flutter/foundations/touch_slider_showcase.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import 'slider_test_harness.dart';

Finder _touchSliderTrack(Finder slider) {
  return find.descendant(of: slider, matching: find.byType(ClipRRect));
}
Size _trackClipSize(WidgetTester tester, Finder slider) {
  return tester.getSize(_touchSliderTrack(slider));
}

RenderBox _fillBox(WidgetTester tester, Finder slider) {
  return tester.renderObject<RenderBox>(
    find.descendant(
      of: slider,
      matching: find.byKey(const ValueKey<String>('touch-slider-fill')),
    ),
  );
}

BoxDecoration _fillDecoration(WidgetTester tester, Finder slider) {
  return tester
      .widget<DecoratedBox>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('touch-slider-fill')),
          matching: find.byType(DecoratedBox),
        ),
      )
      .decoration! as BoxDecoration;
}

void main() {
  group('touchSliderFillExtentPx — Figma width model', () {
    const trackLength = 138.0;
    const thickness = 32.0;

    test('value 50 fills exactly half the track', () {
      expect(
        touchSliderFillExtentPx(
          fillRatio: 0.5,
          thickness: thickness,
          trackLength: trackLength,
          progressStyle: 'rounded',
          hasStartSlot: true,
        ),
        trackLength / 2,
      );
    });
  });

  testWidgets('default preview uses auto appearance + start icon', (tester) async {
    await tester.pumpWidget(
      pumpSliderStoryApp(
        Builder(builder: buildTouchSliderDefaultPreview),
      ),
    );
    await tester.pumpAndSettle();

    final slider = tester.widget<OneUiTouchSlider>(find.byType(OneUiTouchSlider));
    expect(slider.appearance, 'auto');
    expect(slider.defaultValue, 50);
    expect(slider.start, isNotNull);
    expect(slider.progressStyle, 'rounded');
  });

  testWidgets('50% horizontal rounded fill width is half the track', (tester) async {
    await tester.pumpWidget(
      pumpTouchSliderStoryApp(
        const OneUiTouchSlider(
          defaultValue: 50,
          appearance: 'secondary',
          progressStyle: 'rounded',
          start: Icon(Icons.volume_up, size: 18),
          ariaLabel: 'Vol',
        ),
      ),
    );
    await tester.pumpAndSettle();

    final slider = find.byType(OneUiTouchSlider);
    final track = _trackClipSize(tester, slider);
    final fill = _fillBox(tester, slider);
    final decoration = _fillDecoration(tester, slider);

    expect(fill.size.width, closeTo(track.width * 0.5, 1.0));
    final cap = Radius.circular(track.height / 2);
    expect(
      decoration.borderRadius,
      BorderRadius.only(
        topLeft: cap,
        bottomLeft: cap,
        topRight: cap,
        bottomRight: cap,
      ),
    );
  });

  testWidgets('50% horizontal sharp fill has flat trailing edge', (tester) async {
    await tester.pumpWidget(
      pumpTouchSliderStoryApp(
        const OneUiTouchSlider(
          defaultValue: 50,
          appearance: 'secondary',
          progressStyle: 'sharp',
          start: Icon(Icons.volume_up, size: 18),
          ariaLabel: 'Vol',
        ),
      ),
    );
    await tester.pumpAndSettle();

    final slider = find.byType(OneUiTouchSlider);
    final track = _trackClipSize(tester, slider);
    final fill = _fillBox(tester, slider);
    final decoration = _fillDecoration(tester, slider);

    expect(fill.size.width, closeTo(track.width * 0.5, 1.0));
    final cap = Radius.circular(track.height / 2);
    expect(
      decoration.borderRadius,
      BorderRadius.only(
        topLeft: cap,
        bottomLeft: cap,
        topRight: Radius.zero,
        bottomRight: Radius.zero,
      ),
    );
  });

  testWidgets('50% vertical rounded fill height is half the track', (tester) async {
    await tester.pumpWidget(
      pumpTouchSliderStoryApp(
        const OneUiTouchSlider(
          defaultValue: 50,
          orientation: 'vertical',
          appearance: 'secondary',
          progressStyle: 'rounded',
          start: Icon(Icons.volume_up, size: 18),
          ariaLabel: 'Vol',
        ),
      ),
    );
    await tester.pumpAndSettle();

    final slider = find.byType(OneUiTouchSlider);
    final track = _trackClipSize(tester, slider);
    final fill = _fillBox(tester, slider);

    expect(fill.size.height, closeTo(track.height * 0.5, 1.0));
  });

  testWidgets('showcase rounded 50 track stays token width in wide parent', (tester) async {
    await tester.binding.setSurfaceSize(const Size(900, 400));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      pumpSliderStoryApp(
        SizedBox(
          width: 800,
          child: Builder(
            builder: (context) => buildTouchSliderProgressStylesSection(context),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final rounded50 = find.byType(OneUiTouchSlider).at(1);
    final track = _trackClipSize(tester, rounded50);
    final fill = _fillBox(tester, rounded50);
    final sliderBox = tester.getSize(rounded50);

    expect(sliderBox.width, closeTo(track.width, 1.0));
    expect(fill.size.width, closeTo(track.width * 0.5, 1.0));
  });
}
