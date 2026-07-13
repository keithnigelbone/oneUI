import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_steps.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

import 'slider_test_harness.dart';

void main() {
  group('OneUiSlider widget coverage', () {
    testWidgets('range mode drag updates both thumbs', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: const [25.0, 75.0],
          ariaLabel: 'Range',
          onValueChange: (v) => last = (v as List<double>).first,
        ),
      );

      final knobs = find.descendant(
        of: sliderRootFinder(),
        matching: find.byType(GestureDetector),
      );
      expect(knobs, findsAtLeastNWidgets(2));
      final gesture = await tester.startGesture(tester.getCenter(knobs.first));
      await gesture.moveBy(const Offset(40, 0));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(25));
    });

    testWidgets('track pan commits value', (tester) async {
      Object? committed;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 10,
          ariaLabel: 'Commit',
          onValueCommitted: (v) => committed = v,
        ),
      );

      await tester.drag(sliderKnobHitFinder(), const Offset(80, 0));
      await tester.pumpAndSettle();
      expect(committed, isNotNull);
    });

    testWidgets('keyboard nudges value via focused thumb', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 50,
          step: 5,
          ariaLabel: 'Keys',
          onValueChange: (v) => last = v as double,
        ),
      );

      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(last, greaterThan(50));
    });

    testWidgets('PageUp Home End keyboard shortcuts', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 40,
          step: 1,
          ariaLabel: 'Page',
          onValueChange: (v) => last = v as double,
        ),
      );

      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.pageUp);
      await tester.pumpAndSettle();
      expect(last!, greaterThan(40));

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(last, 100);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(last, 0);
    });

    testWidgets('controlled value ignores internal drag state', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(value: 35, ariaLabel: 'Controlled'),
      );

      await tester.drag(sliderKnobHitFinder(), const Offset(100, 0));
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('Controlled')).getSemanticsData().value,
          anyOf('35', '35.0'),
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('didUpdateWidget applies new controlled value', (tester) async {
      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(value: 20, ariaLabel: 'Update'),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        pumpSliderStoryApp(
          const OneUiSlider(value: 80, ariaLabel: 'Update'),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('Update')).getSemanticsData().value,
          anyOf('80', '80.0'),
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('vertical keyboard nudge increases value', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        SizedBox(
          height: 200,
          child: OneUiSlider(
            defaultValue: 20,
            orientation: 'vertical',
            step: 5,
            ariaLabel: 'Vertical',
            onValueChange: (v) => last = v as double,
          ),
        ),
      );

      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pumpAndSettle();
      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgets('showSteps renders step ticks', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: 0,
          min: 0,
          max: 4,
          step: 1,
          showSteps: true,
          ariaLabel: 'Steps',
        ),
      );
      expect(find.byType(OneUiSliderSteps), findsOneWidget);
    });

    testWidgets('showTooltip auto appears when thumb is active', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: 55,
          showTooltip: 'auto',
          ariaLabel: 'Tooltip auto',
        ),
      );
      expect(sliderTooltipFinder(), findsNothing);
      await tester.tap(sliderKnobHitFinder());
      await tester.pump();
      expect(sliderTooltipFinder(), findsOneWidget);
      expect(find.text('55'), findsOneWidget);
    });

    testWidgets('formatValue customises tooltip text', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 42,
          showTooltip: 'always',
          ariaLabel: 'Format',
          formatValue: (v, _) => '${v.round()}%',
        ),
      );
      expect(find.text('42%'), findsOneWidget);
    });

    testWidgets('readOnly blocks onValueChange', (tester) async {
      var changed = false;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 50,
          readOnly: true,
          ariaLabel: 'Read only',
          onValueChange: (_) => changed = true,
        ),
      );

      await tester.drag(sliderKnobHitFinder(), const Offset(50, 0));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgets('start and end slots render', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 50,
          ariaLabel: 'Slots',
          start: const Icon(Icons.remove, key: ValueKey('slot-start')),
          end: const Icon(Icons.add, key: ValueKey('slot-end')),
        ),
      );
      expect(find.byKey(const ValueKey('slot-start')), findsOneWidget);
      expect(find.byKey(const ValueKey('slot-end')), findsOneWidget);
    });

    testWidgets('snapToSteps false allows fine drag step', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          min: 0,
          max: 1,
          step: 0.01,
          defaultValue: 0.5,
          snapToSteps: false,
          ariaLabel: 'Fine',
          onValueChange: (v) => last = v as double,
        ),
      );

      await tester.drag(sliderKnobHitFinder(), const Offset(40, 0));
      await tester.pumpAndSettle();
      expect(last, isNotNull);
    });

    testWidgets('range init with single list value expands to two thumbs',
        (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: [40.0],
          ariaLabel: 'Range init',
        ),
      );
      expect(find.bySemanticsLabel('Range init'), findsNWidgets(2));
    });

    testWidgets('ArrowLeft and PageDown keyboard shortcuts', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 60,
          step: 5,
          ariaLabel: 'Left page down',
          onValueChange: (v) => last = v as double,
        ),
      );

      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(last!, lessThan(60));

      await tester.sendKeyEvent(LogicalKeyboardKey.pageDown);
      await tester.pumpAndSettle();
      expect(last!, lessThan(55));
    });

    testWidgets('track pan end commits value', (tester) async {
      Object? committed;
      await pumpSliderStoryHarness(
        tester,
        OneUiSlider(
          defaultValue: 10,
          ariaLabel: 'Track commit',
          onValueCommitted: (v) => committed = v,
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(sliderTrackHitFinder()),
      );
      await gesture.moveBy(const Offset(80, 0));
      await gesture.up();
      await tester.pumpAndSettle();
      expect(committed, isNotNull);
    });

    testWidgets('vertical track pan updates value', (tester) async {
      double? last;
      await pumpSliderStoryHarness(
        tester,
        SizedBox(
          height: 200,
          child: OneUiSlider(
            defaultValue: 20,
            orientation: 'vertical',
            ariaLabel: 'Vertical pan',
            onValueChange: (v) => last = v as double,
          ),
        ),
      );

      final gesture = await tester.startGesture(
        tester.getCenter(sliderTrackHitFinder()),
      );
      await gesture.moveBy(const Offset(0, -70));
      await gesture.up();
      await tester.pumpAndSettle();
      expect(last, isNotNull);
      expect(last, isNot(20.0));
    });

    testWidgets('shows ConvexGapCard without design system', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: null,
            child: const OneUiSlider(defaultValue: 50, ariaLabel: 'Gap'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.bySemanticsLabel('Gap'), findsNothing);
    });

    testWidgets('testId forwards to Semantics.identifier', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          ariaLabel: 'ID',
          testId: 'pkg-slider',
        ),
      );

      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('ID')).getSemanticsData().identifier,
          'pkg-slider',
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('disabled (not readOnly) dims with Opacity', (tester) async {
      await pumpSliderStoryHarness(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          disabled: true,
          ariaLabel: 'Disabled dim',
        ),
      );

      final opacity = tester.widget<Opacity>(
        find.descendant(
          of: sliderRootFinder(),
          matching: find.byType(Opacity),
        ),
      );
      expect(opacity.opacity, 0.38);
    });
  });
}
