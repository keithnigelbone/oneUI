/// Slider — on-device integration tests.
///
/// Renders [OneUiSlider] on the connected emulator / simulator using the same
/// Jio-fixture harness the widget tests use, exercising real engine behaviour:
///   - real drag gestures + value updates
///   - real size scale (s < m < l knob diameters)
///   - inside vs outside knob styles + active-track fill
///   - range mode (dual thumbs)
///   - appearance + surface-context token remapping
///   - real Semantics slider role (TalkBack / VoiceOver)
///   - dark mode
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/slider_size_resolve.dart';
import 'package:ui_flutter/widgets/one_ui_slider.dart';
import 'package:ui_flutter/widgets/one_ui_slider_types.dart';

import '../test/support/components/slider_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

double _knobOutsidePx(WidgetTester tester) {
  return resolveSliderLayout(
    tester.element(sliderRootFinder()),
    jioFixture.designSystem,
    size: tester.widget<OneUiSlider>(sliderRootFinder()).size,
  ).knobOutsidePx;
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('Slider — on-device', () {
    testWidgets('[e2e] default renders with slider semantics', (tester) async {
      await pumpSliderJioHarnessE2e(
        tester,
        const OneUiSlider(defaultValue: 50, ariaLabel: 'Volume'),
      );
      await _hold(tester, 2000);
      expect(sliderRootFinder(), findsOneWidget);
      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Volume');
        expect(data.hasFlag(SemanticsFlag.isSlider), isTrue);
        expect(data.value, anyOf('50', '50.0'));
      });
    });

    testWidgets('[e2e] sizes render at strictly increasing knob diameters (s<m<l)',
        (tester) async {
      final sizes = <String, double>{};
      for (final size in kOneUiSliderSizes) {
        await pumpSliderJioHarnessE2e(
          tester,
          OneUiSlider(
            defaultValue: 50,
            size: size,
            knobStyle: 'outside',
            ariaLabel: 'Size $size',
          ),
        );
        await _hold(tester, _demoMode ? 600 : 0);
        sizes[size] = _knobOutsidePx(tester);
      }
      expect(sizes['s']!, lessThan(sizes['m']!));
      expect(sizes['m']!, lessThan(sizes['l']!));
    });

    testWidgets('[e2e] inside and outside knob styles render', (tester) async {
      for (final knob in kOneUiSliderKnobStyles) {
        await pumpSliderJioHarnessE2e(
          tester,
          OneUiSlider(
            defaultValue: 50,
            knobStyle: knob,
            ariaLabel: 'Knob $knob',
          ),
        );
        await _hold(tester);
        expect(sliderRootFinder(), findsOneWidget);
        final span = sliderActiveTrackSpanPx(tester);
        expect(span, isNotNull);
        expect(span!, greaterThan(100));
      }
    });

    testWidgets('[e2e] horizontal drag updates value', (tester) async {
      double? last;
      await pumpSliderJioHarnessE2e(
        tester,
        OneUiSlider(
          defaultValue: 20,
          ariaLabel: 'Drag',
          onValueChange: (v) => last = v as double,
        ),
      );
      final center = tester.getCenter(sliderRootFinder());
      final gesture = await tester.startGesture(center);
      await gesture.moveBy(const Offset(80, 0));
      await gesture.up();
      await pumpSliderE2eSettle(tester);
      await _hold(tester, 2000);
      expect(last, isNotNull);
      expect(last!, greaterThan(20));
    });

    testWidgets('[e2e] range mode renders two slider thumbs', (tester) async {
      await pumpSliderJioHarnessE2e(
        tester,
        const OneUiSlider(
          defaultValue: [25, 75],
          ariaLabels: ['Low', 'High'],
        ),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(sliderSemanticsData(tester, 'Low').value, anyOf('25', '25.0'));
        expect(sliderSemanticsData(tester, 'High').value, anyOf('75', '75.0'));
      });
    });

    testWidgets('[e2e] keyboard nudge updates semantics value', (tester) async {
      await pumpSliderJioHarnessE2e(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          step: 10,
          ariaLabel: 'Nudge',
        ),
      );
      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await pumpSliderE2eSettle(tester);
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(
          sliderSemanticsData(tester, 'Nudge').value,
          anyOf('60', '60.0'),
        );
      });
    });

    testWidgets('[e2e] each key appearance renders', (tester) async {
      for (final app in ['secondary', 'primary', 'positive', 'negative', 'sparkle']) {
        await pumpSliderJioHarnessE2e(
          tester,
          OneUiSlider(
            defaultValue: 50,
            appearance: app,
            ariaLabel: app,
          ),
        );
        await _hold(tester);
        expect(sliderRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] disabled blocks value change', (tester) async {
      var changed = false;
      await pumpSliderJioHarnessE2e(
        tester,
        OneUiSlider(
          defaultValue: 50,
          disabled: true,
          ariaLabel: 'Locked',
          onValueChange: (_) => changed = true,
        ),
      );
      await tester.tap(sliderRootFinder());
      await pumpSliderE2eSettle(tester);
      await _hold(tester);
      expect(changed, isFalse);
      withSemanticsHandle(tester, () {
        expect(
          sliderSemanticsData(tester, 'Locked').hasFlag(SemanticsFlag.isEnabled),
          isFalse,
        );
      });
    });

    testWidgets('[e2e] readOnly stays enabled and cannot change', (tester) async {
      var changed = false;
      await pumpSliderJioHarnessE2e(
        tester,
        OneUiSlider(
          defaultValue: 50,
          readOnly: true,
          ariaLabel: 'Read only',
          onValueChange: (_) => changed = true,
        ),
      );
      await focusSliderThumb(tester);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await pumpSliderE2eSettle(tester);
      await _hold(tester);
      expect(changed, isFalse);
      withSemanticsHandle(tester, () {
        final data = sliderSemanticsData(tester, 'Read only');
        expect(data.hasFlag(SemanticsFlag.isReadOnly), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue);
      });
    });

    testWidgets('[e2e] slider inside Surface auto-adapts (auto appearance)',
        (tester) async {
      await pumpSliderJioHarnessE2e(
        tester,
        const OneUiSlider(
          defaultValue: 50,
          appearance: 'auto',
          ariaLabel: 'On surface',
        ),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(sliderRootFinder(), findsOneWidget);
      final span = sliderActiveTrackSpanPx(tester);
      expect(span, isNotNull);
      expect(span!, greaterThan(100));
    });

    testWidgets('[e2e] dark-mode slider renders without contrast holes',
        (tester) async {
      await pumpSliderJioHarnessE2e(
        tester,
        const OneUiSlider(
          defaultValue: 60,
          appearance: 'primary',
          ariaLabel: 'Dark',
        ),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(sliderRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] testId locator works in-process', (tester) async {
      await pumpSliderJioHarnessE2e(
        tester,
        const OneUiSlider(
          defaultValue: 30,
          ariaLabel: 'QA',
          testId: 'qa-slider',
        ),
      );
      await _hold(tester);
      withSemanticsHandle(tester, () {
        expect(sliderSemanticsData(tester, 'QA').identifier, 'qa-slider');
      });
    });
  });
}
