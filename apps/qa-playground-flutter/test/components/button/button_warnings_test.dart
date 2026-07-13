/// Button — strict-warnings tests.
///
/// Some real component bugs surface as runtime warnings rather than test
/// failures. The default behavior is: `print` and continue → CI green even
/// when the component is misbehaving. These tests promote those warnings
/// to failures so we catch them in regression instead of in production.
///
/// Bugs guarded here:
///   - BUG-13 (Visual / Parity): `One UI: unknown semantic icon "<name>"
///     — using placeholder` printed every render. Indicates the icon
///     registry is missing an entry. Tests that use deprecated icon names
///     (`arrow_forward`) currently log this on every render and CI
///     ignores it.
///   - BUG-14 (A11y): `OneUiCircularProgressIndicator: semanticsLabel or
///     semanticsLabelledBy is required for accessibility.` printed THREE
///     times per loading button render. Indicates Button is not passing a
///     loading label down to the spinner — or the spinner is too strict.
///
/// These tests deliberately fail today (until the underlying bugs are
/// fixed); leaving them red is the regression gate. The owning team
/// should fix the warnings, not silence the tests.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';

import '../../support/components/button_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[strict] Button — runtime warnings must fail the test', () {
    // Capture every line passed to debugPrint while a test body runs, so
    // assertions can be made against the captured output. `debugPrint` is
    // the channel Flutter uses for both `One UI: unknown semantic icon`
    // and the `OneUiCircularProgressIndicator: semanticsLabel ...` lines.
    Future<List<String>> capturePrints(Future<void> Function() body) async {
      final captured = <String>[];
      final previous = debugPrint;
      debugPrint = (String? message, {int? wrapWidth}) {
        if (message != null) captured.add(message);
      };
      try {
        await body();
      } finally {
        debugPrint = previous;
      }
      return captured;
    }

    testWidgets(
      '[a11y] loading button must NOT print spinner-a11y warnings (BUG-14)',
      (tester) async {
        final captured = await capturePrints(() async {
          await pumpButtonQaHarness(
            tester,
            const OneUiButton(label: 'Submit', loading: true),
          );
        });

        final offending = captured
            .where((line) => line.contains(
                'OneUiCircularProgressIndicator: semanticsLabel or semanticsLabelledBy is required'))
            .toList();

        expect(
          offending,
          isEmpty,
          reason:
              'Button(loading:true) must pass a semanticsLabel down to its spinner. '
              'Each missing-label warning is a real a11y gap that Convex tests would never catch. '
              'Fix in OneUiButton — pass `semanticsLabel: "Loading"` to the embedded spinner.',
        );
      },
    );

    testWidgets(
      '[visual] semantic-icon name must resolve — no "unknown semantic icon" warnings (BUG-13)',
      (tester) async {
        final captured = await capturePrints(() async {
          await pumpButtonQaHarnessSettled(
            tester,
            const OneUiButton(
              label: 'Next',
              end: OneUiIcon(icon: 'arrow_forward', emphasis: OneUiIconEmphasis.high),
            ),
          );
        });

        final offending = captured
            .where((line) => line.startsWith('One UI: unknown semantic icon'))
            .toList();

        expect(
          offending,
          isEmpty,
          reason:
              'OneUiIcon name "arrow_forward" must resolve in the registry. '
              'A warning per render means production users see a placeholder glyph. '
              'Either add "arrow_forward" to the icon registry, OR remove every test that uses it.',
        );
      },
    );

    testWidgets(
      '[fn] full default-state render produces zero FlutterError reports',
      (tester) async {
        // This is the catch-all: any Semantics assertion, render-pipeline
        // error, or framework warning that surfaces via FlutterError.onError
        // (e.g. Semantics.label cannot be combined with Semantics.controlsNodes
        // mis-configurations) must be zero.
        final restore = installStrictFlutterErrorListener();
        addTearDown(restore);

        await pumpButtonQaHarnessSettled(
          tester,
          const OneUiButton(label: 'Save'),
        );
        expectNoFlutterErrors(tester);
      },
    );
  });
}
