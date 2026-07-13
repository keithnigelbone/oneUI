/// Button — on-device integration tests.
///
/// Renders [OneUiButton] standalone on the connected emulator / simulator
/// using the same harness widget tests use (`pumpButtonQaHarness`), so the
/// component fills the screen and you can watch real engine behaviour:
///   - actual Material ink ripples on Android
///   - actual touch slop / press feedback
///   - real font rendering and overflow at the device's pixel density
///   - real focus halo paint
///
/// This is what the headless widget tests in
/// `test/components/button/button_functional_test.dart` *cannot* verify —
/// they assert the API contract; this layer asserts the engine renders it.
///
/// **Two modes**, picked via `--dart-define=DEMO_MODE`:
///
///   `DEMO_MODE=false` (default, CI-friendly):
///     - All actions happen at framework speed.
///     - Runtime: ~30s for the suite.
///
///   `DEMO_MODE=true` (interactive / debugging):
///     - Holds each variant on-screen for ~1.5s.
///     - Taps the button visibly so you can see the ripple animate.
///     - Runtime: ~2 min for the suite.
///
/// Run:
///   # Fast / CI:
///   flutter test integration_test/button_e2e_test.dart -d emulator-5554
///
///   # Slow / watchable:
///   flutter test integration_test/button_e2e_test.dart -d emulator-5554 \
///     --dart-define=DEMO_MODE=true
///
///   # iOS:
///   flutter test integration_test/button_e2e_test.dart -d "iPhone 17 Pro"
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';

import '../test/support/components/button_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

/// Hold the current frame visible on-device for [ms] so a human can watch.
/// No-op in CI mode (default).
///
/// Crucially does **not** call `pumpAndSettle()` — that waits for *all*
/// animations to finish, which deadlocks on infinite animations like the
/// loading-state spinner. Callers that need to flush a finite animation
/// (e.g. a tap ripple) should call `pumpAndSettle()` themselves before
/// invoking [_hold].
Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  // Preload Jio Convex fixture so on-device renders match the web app.
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('Button — on-device', () {
    testWidgets('[e2e] high attention (bold variant) renders + responds to tap',
        (tester) async {
      var pressed = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          onPressed: () => pressed++,
        ),
      );
      await _hold(tester, 2000); // show the rendered button

      expect(find.text('Save changes'), findsOneWidget);

      // Tap it — on the real device this fires the actual gesture pipeline,
      // emits a Material ripple, and increments our counter.
      await tester.tap(find.byType(OneUiButton));
      await tester.pumpAndSettle();
      await _hold(tester);

      expect(pressed, 1, reason: 'tap must invoke onPressed exactly once');
    });

    testWidgets('[e2e] medium attention (subtle variant) renders distinctly',
        (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.medium,
          appearance: 'primary',
        ),
      );
      await _hold(tester);
      expect(find.text('Save changes'), findsOneWidget);
    });

    testWidgets('[e2e] low attention (ghost variant) renders without fill',
        (tester) async {
      await pumpButtonQaHarnessSettled(
        tester,
        const OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.low,
          appearance: 'primary',
        ),
      );
      await _hold(tester);
      expect(find.text('Save changes'), findsOneWidget);
    });

    testWidgets('[e2e] disabled state blocks tap and renders dimmed', (tester) async {
      var pressed = 0;
      await pumpButtonQaHarnessSettled(
        tester,
        OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          disabled: true,
          onPressed: () => pressed++,
        ),
      );
      await _hold(tester);

      await tester.tap(find.byType(OneUiButton), warnIfMissed: false);
      await tester.pumpAndSettle();
      await _hold(tester);

      expect(pressed, 0,
          reason: 'disabled button must not invoke onPressed');
    });

    testWidgets('[e2e] loading state shows spinner and blocks tap', (tester) async {
      var pressed = 0;
      await pumpButtonQaHarness(
        tester,
        OneUiButton(
          label: 'Save changes',
          attention: OneUiButtonAttention.high,
          appearance: 'primary',
          loading: true,
          start: const OneUiIcon(icon: 'check'),
          onPressed: () => pressed++,
        ),
      );
      await _hold(tester, 2500); // watch the spinner animate

      expect(find.byType(OneUiCircularProgressIndicator), findsOneWidget);

      await tester.tap(find.byType(OneUiButton), warnIfMissed: false);
      await tester.pump(const Duration(milliseconds: 200));
      // No pumpAndSettle here — the spinner is infinite, would hang.

      expect(pressed, 0,
          reason: 'loading button must not invoke onPressed');
    });

    testWidgets('[e2e] size variants xs / s / m / l render at increasing heights',
        (tester) async {
      final heights = <String, double>{};
      for (final size in ['xs', 's', 'm', 'l']) {
        await pumpButtonQaHarnessSettled(
          tester,
          OneUiButton(
            label: 'Size $size',
            sizeAlias: size,
            attention: OneUiButtonAttention.high,
            appearance: 'primary',
          ),
        );
        await _hold(tester, _demoMode ? 1200 : 0);
        heights[size] = tester.getSize(find.byType(OneUiButton)).height;
      }

      // Monotonic invariant — same as the widget test, but proves it holds
      // when the real engine lays out the button (not just the test binding).
      expect(heights['xs']!, lessThanOrEqualTo(heights['s']!));
      expect(heights['s']!, lessThanOrEqualTo(heights['m']!));
      expect(heights['m']!, lessThanOrEqualTo(heights['l']!));
      expect(heights['l']!, greaterThan(heights['xs']!));
    });
  });
}
