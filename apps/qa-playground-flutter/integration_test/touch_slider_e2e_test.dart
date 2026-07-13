/// TouchSlider — on-device integration tests.
///
/// Renders [OneUiTouchSlider] on the connected emulator / simulator using the
/// same Jio-fixture harness the widget tests use, exercising real engine
/// behaviour:
///   - real drag gestures + value updates (horizontal + vertical)
///   - rounded vs sharp progress caps
///   - appearance + surface-context token remapping
///   - real Semantics slider role (TalkBack / VoiceOver)
///   - dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/services.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_touch_slider.dart';

import '../test/support/components/touch_slider_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

/// At [defaultValue] 50 the fill spans half the painted track (Figma width model).
void _expectHalfHorizontalFill(WidgetTester tester) {
  final trackWidth = tester.getSize(touchSliderTrackFinder()).width;
  final fill = touchSliderFillSpanPx(tester);
  expect(fill, isNotNull);
  expect(fill!, closeTo(trackWidth * 0.5, trackWidth * 0.12));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('TouchSlider — on-device', () {
    testWidgets('[e2e] Figma default renders with slider semantics', (tester) async {
      await pumpTouchSliderJioHarnessE2e(
        tester,
        goldenTouchSliderWidget(),
      );
      await _hold(tester, 2000);
      expect(touchSliderRootFinder(), findsOneWidget);
      withSemanticsHandle(tester, () {
        final data = touchSliderSemanticsData(tester, 'Volume');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('50', '50.0'));
      });
      _expectHalfHorizontalFill(tester);
    });

    testWidgets('[e2e] rounded and sharp progress styles render', (tester) async {
      for (final style in ['rounded', 'sharp']) {
        await pumpTouchSliderJioHarnessE2e(
          tester,
          goldenTouchSliderWidget(progressStyle: style),
        );
        await _hold(tester);
        expect(touchSliderRootFinder(), findsOneWidget);
        _expectHalfHorizontalFill(tester);
      }
    });

    testWidgets('[e2e] horizontal and vertical orientations render', (tester) async {
      for (final orientation in ['horizontal', 'vertical']) {
        await pumpTouchSliderJioHarnessE2e(
          tester,
          OneUiTouchSlider(
            defaultValue: 50,
            orientation: orientation,
            appearance: 'secondary',
            progressStyle: 'rounded',
            ariaLabel: orientation,
          ),
        );
        await _hold(tester);
        expect(touchSliderRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] horizontal drag updates value', (tester) async {
      double? last;
      await pumpTouchSliderJioHarnessE2e(
        tester,
        OneUiTouchSlider(
          defaultValue: 20,
          ariaLabel: 'Drag',
          onValueChange: (v) => last = v,
        ),
      );
      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(80, 0));
      await gesture.up();
      await pumpTouchSliderE2eSettle(tester);
      await _hold(tester, 2000);
      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgets('[e2e] vertical drag up increases value', (tester) async {
      double? last;
      await pumpTouchSliderJioHarnessE2e(
        tester,
        OneUiTouchSlider(
          defaultValue: 25,
          orientation: 'vertical',
          ariaLabel: 'Vertical',
          onValueChange: (v) => last = v,
        ),
      );
      final center = tester.getCenter(touchSliderTrackFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(0, -80));
      await gesture.up();
      await pumpTouchSliderE2eSettle(tester);
      await _hold(tester, 2000);
      expect(last, isNotNull);
      expect(last!, greaterThan(25));
    });

    testWidgets('[e2e] keyboard nudge updates semantics value', (tester) async {
      await pumpTouchSliderJioHarnessE2e(
        tester,
        const OneUiTouchSlider(
          defaultValue: 50,
          step: 10,
          ariaLabel: 'Nudge',
        ),
      );
      await focusTouchSlider(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await pumpTouchSliderE2eSettle(tester);
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(
          touchSliderSemanticsData(tester, 'Nudge').value,
          anyOf('60', '60.0'),
        );
      });
    });

    testWidgets('[e2e] each key appearance renders', (tester) async {
      for (final app in ['secondary', 'primary', 'positive', 'negative', 'sparkle']) {
        await pumpTouchSliderJioHarnessE2e(
          tester,
          OneUiTouchSlider(
            defaultValue: 50,
            appearance: app,
            ariaLabel: app,
          ),
        );
        await _hold(tester);
        expect(touchSliderRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled blocks value change', (tester) async {
      var changed = false;
      await pumpTouchSliderJioHarnessE2e(
        tester,
        OneUiTouchSlider(
          defaultValue: 50,
          disabled: true,
          ariaLabel: 'Locked',
          onValueChange: (_) => changed = true,
        ),
      );
      await tester.tap(touchSliderTrackFinder());
      await pumpTouchSliderE2eSettle(tester);
      await _hold(tester);
      expect(changed, isFalse);
      withSemanticsHandle(tester, () {
        expect(
          touchSliderSemanticsData(tester, 'Locked').hasFlag(SemanticsFlag.isEnabled),
          isFalse,
        );
      });
    });

    testWidgets(
        '[e2e] readOnly blocks value change but stays enabled (Figma + Slider)',
        (tester) async {
      var changed = false;
      await pumpTouchSliderJioHarnessE2e(
        tester,
        OneUiTouchSlider(
          defaultValue: 50,
          readOnly: true,
          ariaLabel: 'Read only',
          onValueChange: (_) => changed = true,
        ),
      );
      await focusTouchSlider(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await pumpTouchSliderE2eSettle(tester);
      await _hold(tester);
      expect(changed, isFalse);
      withSemanticsHandle(tester, () {
        final data = touchSliderSemanticsData(tester, 'Read only');
        expect(data.hasFlag(SemanticsFlag.isReadOnly), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      });
    });

    testWidgets('[e2e] slider inside Surface auto-adapts (auto appearance)',
        (tester) async {
      await pumpTouchSliderJioHarnessE2e(
        tester,
        const OneUiTouchSlider(
          defaultValue: 50,
          appearance: 'auto',
          ariaLabel: 'On surface',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(touchSliderRootFinder(), findsOneWidget);
      _expectHalfHorizontalFill(tester);
    });

    testWidgets('[e2e] dark-mode slider renders without contrast holes',
        (tester) async {
      await pumpTouchSliderJioHarnessE2e(
        tester,
        goldenTouchSliderWidget(),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(touchSliderRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] testId locator works in-process', (tester) async {
      await pumpTouchSliderJioHarnessE2e(
        tester,
        const OneUiTouchSlider(
          defaultValue: 30,
          ariaLabel: 'QA',
          testId: 'qa-touch-slider',
        ),
      );
      await _hold(tester);
      withSemanticsHandle(tester, () {
        expect(
          touchSliderSemanticsData(tester, 'QA').identifier,
          'qa-touch-slider',
        );
      });
    });
  });
}
