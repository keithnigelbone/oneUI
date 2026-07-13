import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/engine/touch_slider_size_resolve.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider_types.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';

import 'slider_test_harness.dart';

void main() {
  group('resolveOneUiTouchSliderState — TouchSlider.shared.ts', () {
    test('readOnly is distinct from disabled in state', () {
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: true,
      );
      expect(state.isDisabled, isFalse);
      expect(state.isReadOnly, isTrue);
    });

    test('fillRatio normalises value in range', () {
      final state = resolveOneUiTouchSliderState(
        value: 25,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
      );
      expect(state.fillRatio, closeTo(0.25, 0.001));
    });

    test('auto resolves to secondary at page root (surfaceDepth 0)', () {
      final root = buildRootSurfaceContext(
        themeConfig: sliderStoryTestThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'auto',
        orientation: 'horizontal',
        progressStyle: 'rounded',
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
        parentMode: 'bold',
      );
      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'auto',
        orientation: 'horizontal',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
        surface: nested,
      );
      expect(state.resolvedAppearance, 'positive');
    });
  });

  group('OneUiTouchSlider widget', () {
    testWidgets('renders and drag updates value', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 20,
            ariaLabel: 'Volume',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(OneUiTouchSlider), findsOneWidget);
      await tester.drag(touchSliderTrackFinder(), const Offset(120, 0));
      await tester.pumpAndSettle();
      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgets('resolveTouchSliderLayout reads track length', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(defaultValue: 50, ariaLabel: 'Layout'),
        ),
      );
      await tester.pumpAndSettle();

      final layout = resolveTouchSliderLayout(
        tester.element(find.byType(OneUiTouchSlider)),
        touchSliderTestDesignSystem(),
      );
      expect(layout.trackLengthPx, greaterThan(0));
    });

    testWidgets('vertical orientation resolves isVertical state', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(
            defaultValue: 50,
            orientation: 'vertical',
            ariaLabel: 'Vertical',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final state = resolveOneUiTouchSliderState(
        value: 50,
        min: 0,
        max: 100,
        appearance: 'secondary',
        orientation: 'vertical',
        progressStyle: 'rounded',
        disabled: false,
        readOnly: false,
      );
      expect(state.isVertical, isTrue);
    });

    testWidgets('vertical drag up increases value (bottom=0, top=100)', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 20,
            orientation: 'vertical',
            ariaLabel: 'Gain',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(0, -80));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgets('vertical drag down decreases value', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 80,
            orientation: 'vertical',
            ariaLabel: 'Gain',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(0, 80));
      await gesture.up();
      await tester.pumpAndSettle();

      expect(last, isNotNull);
      expect(last!, lessThan(80));
    });

    testWidgets('controlled value ignores internal drag', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(value: 42, ariaLabel: 'Controlled'),
        ),
      );
      await tester.pumpAndSettle();

      await tester.drag(touchSliderTrackFinder(), const Offset(80, 0));
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('Controlled')).getSemanticsData().value,
          anyOf('42', '42.0'),
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('didUpdateWidget applies new controlled value', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(value: 10, ariaLabel: 'Update'),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(value: 90, ariaLabel: 'Update'),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('Update')).getSemanticsData().value,
          anyOf('90', '90.0'),
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('keyboard nudges value when focused', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 50,
            step: 10,
            ariaLabel: 'Keys',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await focusTouchSlider(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(last, greaterThan(50));
    });

    testWidgets('keyboard ArrowLeft Up Down Page Home End', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 50,
            step: 5,
            ariaLabel: 'All keys',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await focusTouchSlider(tester);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(last!, lessThan(50));

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pumpAndSettle();
      expect(last!, greaterThan(45));

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pumpAndSettle();
      expect(last!, lessThan(50));

      await tester.sendKeyEvent(LogicalKeyboardKey.pageUp);
      await tester.pumpAndSettle();
      expect(last!, greaterThan(45));

      await tester.sendKeyEvent(LogicalKeyboardKey.pageDown);
      await tester.pumpAndSettle();
      expect(last!, lessThan(50));

      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(last, 100);

      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(last, 0);
    });

    testWidgets('tap track jumps value and commits', (tester) async {
      double? committed;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 10,
            ariaLabel: 'Tap jump',
            onValueCommitted: (v) => committed = v,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final track = touchSliderTrackFinder();
      final topLeft = tester.getTopLeft(track);
      final size = tester.getSize(track);
      await tester.tapAt(topLeft + Offset(size.width * 0.85, size.height / 2));
      await tester.pumpAndSettle();

      expect(committed, isNotNull);
      expect(committed!, greaterThan(10));
    });

    testWidgets('shows ConvexGapCard without design system', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: OneUiScope(
            platformId: 'S',
            density: 'default',
            designSystem: null,
            child: const OneUiTouchSlider(defaultValue: 50, ariaLabel: 'Gap'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(ConvexGapCard), findsOneWidget);
      expect(find.bySemanticsLabel('Gap'), findsNothing);
    });

    testWidgets('pan cancel ends drag without crash', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(defaultValue: 30, ariaLabel: 'Cancel'),
        ),
      );
      await tester.pumpAndSettle();

      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(12, 0));
      await gesture.cancel();
      await tester.pump();
      expect(find.byType(OneUiTouchSlider), findsOneWidget);
    });

    testWidgets('testId forwards to Semantics.identifier', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(
            defaultValue: 50,
            ariaLabel: 'ID',
            testId: 'pkg-touch-slider',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        expect(
          tester.getSemantics(find.bySemanticsLabel('ID')).getSemanticsData().identifier,
          'pkg-touch-slider',
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgets('readOnly stays enabled in semantics but blocks drag', (tester) async {
      double? last;
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          OneUiTouchSlider(
            defaultValue: 50,
            readOnly: true,
            ariaLabel: 'Read only touch',
            onValueChange: (v) => last = v,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final handle = tester.ensureSemantics();
      try {
        final data =
            tester.getSemantics(find.bySemanticsLabel('Read only touch')).getSemanticsData();
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      } finally {
        handle.dispose();
      }

      await tester.drag(touchSliderTrackFinder(), const Offset(80, 0));
      await tester.pumpAndSettle();
      expect(last, isNull);
    });

    testWidgets('disabled (not readOnly) dims with Opacity', (tester) async {
      await tester.pumpWidget(
        pumpTouchSliderStoryApp(
          const OneUiTouchSlider(
            defaultValue: 50,
            disabled: true,
            ariaLabel: 'Disabled dim',
          ),
        ),
      );
      await tester.pumpAndSettle();

      final opacity = tester.widget<Opacity>(
        find.descendant(
          of: find.byType(OneUiTouchSlider),
          matching: find.byType(Opacity),
        ),
      );
      expect(opacity.opacity, 0.38);
    });
  });
}
