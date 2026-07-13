/// TouchSlider functional QA tests — mirrors web `TouchSlider.test.tsx`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import '../../support/components/touch_slider_harness.dart';
import '../../support/semantics_helpers.dart' show withSemanticsHandle;

void main() {
  group('[smoke] TouchSlider', () {
    testWidgetsAllPlatforms('[smoke] renders with ariaLabel', (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(defaultValue: 60, ariaLabel: 'Volume'),
      );
      expect(touchSliderRootFinder(), findsOneWidget);
    });

    for (final style in ['rounded', 'sharp']) {
      testWidgetsAllPlatforms('[smoke] progressStyle=$style renders',
          (tester) async {
        await pumpTouchSliderQaHarness(
          tester,
          OneUiTouchSlider(
            defaultValue: 50,
            progressStyle: style,
            ariaLabel: style,
          ),
        );
        expect(touchSliderRootFinder(), findsOneWidget);
      });
    }
  });

  group('[functional] TouchSlider — value change', () {
    testWidgetsAllPlatforms('[fn] horizontal drag updates value', (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 20,
          ariaLabel: 'Volume',
          onValueChange: (v) => last = v,
        ),
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(120, 0));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgetsAllPlatforms('[fn] pan updates value on track drag', (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 0,
          ariaLabel: 'Drag',
          onValueChange: (v) => last = v,
        ),
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(120, 0));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(0));
    });

    testWidgetsAllPlatforms('[fn] vertical drag up increases value', (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 25,
          orientation: 'vertical',
          ariaLabel: 'Vertical volume',
          onValueChange: (v) => last = v,
        ),
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(0, -100));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(25));
    });

    testWidgetsAllPlatforms('[fn] vertical drag down decreases value', (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 75,
          orientation: 'vertical',
          ariaLabel: 'Vertical volume',
          onValueChange: (v) => last = v,
        ),
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(0, 100));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, lessThan(75));
    });
  });

  group('[functional] TouchSlider — states', () {
    testWidgetsAllPlatforms('[fn] disabled blocks onValueChange', (tester) async {
      var changed = false;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 60,
          disabled: true,
          ariaLabel: 'Locked',
          onValueChange: (_) => changed = true,
        ),
      );

      await tester.tap(touchSliderTrackFinder());
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] readOnly blocks onValueChange', (tester) async {
      var changed = false;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 60,
          readOnly: true,
          ariaLabel: 'Read only',
          onValueChange: (_) => changed = true,
        ),
      );

      await tester.tap(touchSliderTrackFinder());
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(changed, isFalse);
    });
  });

  group('[functional] TouchSlider — keyboard', () {
    testWidgetsAllPlatforms('[fn] ArrowRight nudges value via keyboard',
        (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 50,
          step: 10,
          ariaLabel: 'Keyboard',
          onValueChange: (v) => last = v,
        ),
      );

      await focusTouchSlider(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(50));
    });

    testWidgetsAllPlatforms('[fn] PageUp jumps value via keyboard', (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 20,
          step: 1,
          ariaLabel: 'Page keys',
          onValueChange: (v) => last = v,
        ),
      );

      await focusTouchSlider(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.pageUp);
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgetsAllPlatforms('[fn] Home and End jump to min/max', (tester) async {
      double? last;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 40,
          ariaLabel: 'Home end',
          onValueChange: (v) => last = v,
        ),
      );

      await focusTouchSlider(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(last, 100);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(last, 0);
    });
  });

  group('[functional] TouchSlider — onValueCommitted', () {
    testWidgetsAllPlatforms('[fn] tap commits value', (tester) async {
      double? committed;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 10,
          ariaLabel: 'Commit tap',
          onValueCommitted: (v) => committed = v,
        ),
      );

      final track = tester.getSize(touchSliderTrackFinder());
      await tester.tapAt(
        tester.getTopLeft(touchSliderTrackFinder()) + Offset(track.width * 0.8, track.height / 2),
      );
      await tester.pumpAndSettle();

      expect(committed, isNotNull);
      expect(committed!, greaterThan(10));
    });

    testWidgetsAllPlatforms('[fn] pan end commits value', (tester) async {
      double? committed;
      await pumpTouchSliderQaHarness(
        tester,
        OneUiTouchSlider(
          defaultValue: 15,
          ariaLabel: 'Commit pan',
          onValueCommitted: (v) => committed = v,
        ),
      );

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(80, 0));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(committed, isNotNull);
      expect(committed!, greaterThan(15));
    });
  });

  group('[functional] TouchSlider — controlled + testId', () {
    testWidgetsAllPlatforms('[fn] controlled value ignores internal drag state',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(
          value: 40,
          ariaLabel: 'Controlled',
        ),
      );

      await tester.drag(touchSliderTrackFinder(), const Offset(100, 0));
      await tester.pumpAndSettle();

      withSemanticsHandle(tester, () {
        expect(
          touchSliderSemanticsData(tester, 'Controlled').value,
          anyOf('40', '40.0'),
        );
      });
    });

    testWidgetsAllPlatforms('[fn] forwards testId to Semantics.identifier',
        (tester) async {
      await pumpTouchSliderQaHarness(
        tester,
        const OneUiTouchSlider(
          defaultValue: 50,
          ariaLabel: 'Locator',
          testId: 'qa-touch-slider',
        ),
      );

      withSemanticsHandle(tester, () {
        expect(
          touchSliderSemanticsData(tester, 'Locator').identifier,
          'qa-touch-slider',
        );
      });
    });
  });
}
