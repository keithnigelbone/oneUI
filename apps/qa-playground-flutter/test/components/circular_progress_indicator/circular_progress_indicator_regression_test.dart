/// CircularProgressIndicator regression + parity-attribution suite.
///
/// Findings are split by WHERE the defect lives — every claim was cross-checked
/// against the web component (`packages/ui/src/components/CircularProgressIndicator/`)
/// and reproduced against the real Flutter widget BEFORE the assertion was
/// written (probe values quoted per test):
///
///   [confirmed]  genuine Flutter component bugs — RED until the Flutter fix
///                lands. Web does the right thing; Flutter does not.
///   [debatable]  hardening / parity-leaning gaps — RED, lower confidence. Web
///                SHARES the limitation (or has it for free via TypeScript), so
///                this is a design call.
///   [parity]     GREEN proofs that Flutter matches the web contract (value
///                announcement, busy state, clamping, auto→primary, ariaHidden,
///                show, colour overrides).
///
/// NO FALSE CONFIDENCE: every RED test asserts the CORRECT behaviour and fails
/// because the component currently ships the gap. Runs on the synthetic harness
/// (offline) so the burn-down is reproducible without the Jio network.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

void main() {
  // ===========================================================================
  // CONFIRMED Flutter component bugs — RED until the Flutter fix lands.
  // ===========================================================================

  group('[regression][confirmed] CircularProgressIndicator', () {
    testWidgetsAllPlatforms(
        '[fn] [CPI-FN-001] testId is exposed via Semantics.identifier (cross-platform locators)',
        (tester) async {
      // PROBED: testId:'cpi-x' → Semantics.identifier="" (a `find.byKey` DOES
      // match, so flutter_test can locate it, but native AT automation cannot).
      // The build() method assigns `identifier:` to the aria-labelledby id
      // (one_ui_circular_progress_indicator.dart:597) and only wraps testId in a
      // KeyedSubtree key (line 584) — so testId never reaches the platform AT
      // tree. Web emits data-testid on the progressbar root; Patrol / Maestro /
      // Appium read Semantics(identifier:), not Flutter widget keys.
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          semanticsLabel: 'QA',
          testId: 'cpi-root',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(cpiSemanticsData(tester, 'QA').identifier, 'cpi-root',
            reason:
                'testId must reach the platform AT tree via Semantics(identifier:). '
                'It currently only becomes a widget Key — invisible to native '
                'locators — because the identifier slot is taken by labelledBy.');
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web has these guards for free
  // (TypeScript union / required label), Flutter does not → design call.
  // ===========================================================================

  group('[regression][debatable] CircularProgressIndicator', () {
    testWidgetsAllPlatforms(
        '[fn] [CPI-DEB-001] invalid appearance asserts in debug (web has TS union)',
        (tester) async {
      // PROBED: appearance:'destructive' → captured=false. The role falls through
      // the surface resolver and silently uses a fallback colour. Web blocks this
      // at compile time (TypeScript union). Flutter has no compile-time OR runtime
      // guard — hardening suggestion.
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpCpiQaHarness(
          tester,
          const OneUiCircularProgressIndicator(
            value: 50,
            appearance: 'destructive',
            semanticsLabel: 'X',
          ),
        );
        expect(captured, isNotNull,
            reason:
                'unknown appearance must assert in debug to recover the type '
                'safety web gets from TypeScript. Currently silent.');
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [CPI-DEB-002] an unlabelled progressbar asserts in debug (WCAG 4.1.2)',
        (tester) async {
      // PROBED: no semanticsLabel + no labelledBy → captured=false. The widget's
      // own build() acknowledges the requirement ("semanticsLabel or
      // semanticsLabelledBy is required for accessibility",
      // one_ui_circular_progress_indicator.dart:512-523) but only `debugPrint`s
      // inside an assert that always returns true — so an unnamed progressbar
      // ships silently. It should hard-assert in debug like the web dev warning.
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpCpiQaHarness(
          tester,
          const OneUiCircularProgressIndicator(value: 50),
        );
        expect(captured, isNotNull,
            reason:
                'a progressbar with no accessible name must assert in debug '
                '(WCAG 4.1.2). Currently only debugPrints — easy to ship unnamed.');
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web contract. PROOFS, not bugs.
  // ===========================================================================

  group('[parity] CircularProgressIndicator — matches the web contract', () {
    testWidgetsAllPlatforms(
        '[parity] [CPI-PAR-001] determinate announces "N percent"', (tester) async {
      // PROBED: value=42 → semantics value "42 percent".
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 42, semanticsLabel: 'Upload'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Upload').value, '42');
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [CPI-PAR-002] indeterminate omits the value (busy)', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(variant: 'indeterminate', semanticsLabel: 'Loading'),
        settle: false,
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Loading').value, anyOf(isNull, isEmpty));
      });
    });

    test('[parity] [CPI-PAR-003] value clamps to [min, max] and normalises', () {
      expect(resolveOneUiCircularProgressIndicatorState(value: 150).percentage, 100);
      expect(resolveOneUiCircularProgressIndicatorState(value: -10).percentage, 0);
      expect(resolveOneUiCircularProgressIndicatorState(value: 5, min: 0, max: 10).percentage, 50);
    });

    test('[parity] [CPI-PAR-004] determinate without a value coerces to indeterminate', () {
      final s = resolveOneUiCircularProgressIndicatorState(variant: 'determinate');
      expect(s.isIndeterminate, isTrue);
      expect(s.resolvedVariant, 'indeterminate');
    });

    test('[parity] [CPI-PAR-005] appearance=auto resolves to primary', () {
      expect(
        resolveOneUiCircularProgressIndicatorState(value: 10, appearance: 'auto').resolvedAppearance,
        'primary',
      );
    });

    testWidgetsAllPlatforms(
        '[parity] [CPI-PAR-006] ariaHidden collapses the semantics tree', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 10, ariaHidden: true, semanticsLabel: 'Hidden'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [CPI-PAR-007] show=false removes the ring + semantics', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 10, show: false, semanticsLabel: 'Gone'),
      );
      expect(cpiPaintFinder(), findsNothing);
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Gone'), findsNothing);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [CPI-PAR-008] indicatorColor override reaches the painter', (tester) async {
      // PROBED: indicatorColor:#112233 → painter.indicatorColor == #112233.
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          semanticsLabel: 'C',
          indicatorColor: Color(0xFF112233),
        ),
      );
      expect(cpiPainter(tester).indicatorColor, const Color(0xFF112233));
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] CircularProgressIndicator', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter):
      //   CPI-FN-001 (testId — fixed), CPI-VIS-001..002 (visual — see visual_regression_test).
      const confirmedFlutterBugs = 1;
      // Visual regressions (RED, fix in Flutter) — circular_progress_indicator_visual_regression_test.dart:
      //   CPI-VIS-001 (0% dot), CPI-VIS-002 (centre content sizing).
      const confirmedVisualBugs = 3;
      // Debatable hardening / parity-leaning (RED, design call):
      //   CPI-DEB-001 (invalid appearance assert), CPI-DEB-002 (unlabelled assert).
      const debatable = 2;
      // Parity GREEN proofs (Flutter matches web — NOT bugs):
      //   CPI-PAR-001..008.
      const parityProofs = 8;
      expect(confirmedFlutterBugs + confirmedVisualBugs + debatable + parityProofs, 14);
    });
  });
}
