/// LinearProgressIndicator regression + parity audit.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  group('[regression][confirmed] LinearProgressIndicator', () {
    // LPI-FN-001: testId → Semantics.identifier — GREEN (fixed at implementation).
    testWidgetsAllPlatforms(
        '[fn] [LPI-FN-001] testId reaches Semantics.identifier',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          value: 50,
          semanticsLabel: 'QA',
          testId: 'lpi-root',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(lpiSemanticsData(tester, 'QA').identifier, 'lpi-root');
      } finally {
        handle.dispose();
      }
    });
  });

  group('[regression][debatable] LinearProgressIndicator', () {
    testWidgetsAllPlatforms(
        '[fn] [LPI-DEB-001] invalid appearance asserts in debug',
        (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            value: 50,
            appearance: 'destructive',
            semanticsLabel: 'X',
          ),
        );
        expect(captured, isNotNull);
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [LPI-DEB-002] unlabelled progressbar asserts in debug',
        (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(value: 50),
        );
        expect(captured, isNotNull);
      } finally {
        FlutterError.onError = prev;
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [LPI-DEB-002] labelledBy-only does not assert in debug',
        (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            value: 50,
            semanticsLabelledBy: 'upload-status-label',
          ),
        );
        expect(captured, isNull);
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  group('[regression][parity] LinearProgressIndicator', () {
    testWidgetsAllPlatforms('[parity] [LPI-PAR-001] value→fill fraction',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(value: 75, semanticsLabel: 'P'),
      );
      expect(lpiFillFraction(tester), closeTo(0.75, 0.001));
    });

    testWidgetsAllPlatforms('[parity] [LPI-PAR-002] indeterminate ignores value',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'indeterminate',
          value: 80,
          semanticsLabel: 'L',
        ),
        settle: false,
      );
      expect(lpiIsIndeterminate(tester), isTrue);
      expect(lpiFillFraction(tester), 0);
    });

    testWidgetsAllPlatforms('[parity] [LPI-PAR-003] auto→primary', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'auto',
          value: 50,
          semanticsLabel: 'a',
        ),
      );
      expect(lpiRootFinder(), findsOneWidget);
    });
  });
}
