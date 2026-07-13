/// LinearProgressIndicator accessibility QA tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_types.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  group('[a11y] resolveOneUiLinearProgressIndicatorSemantics', () {
    test('[a11y] indeterminate busy', () {
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: resolveOneUiLinearProgressIndicatorState(type: 'indeterminate'),
        semanticsLabel: 'Loading',
      );
      expect(a11y.isBusy, isTrue);
      expect(a11y.valueNow, isNull);
    });

    test('[a11y] determinate valueNow', () {
      final a11y = resolveOneUiLinearProgressIndicatorSemantics(
        state: resolveOneUiLinearProgressIndicatorState(value: 60),
        semanticsLabel: 'Task',
      );
      expect(a11y.valueNow, 60);
    });
  });

  group('[a11y] LinearProgressIndicator widget semantics', () {
    testWidgetsAllPlatforms('[a11y] value announced as N percent', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(value: 42, semanticsLabel: 'Upload'),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(lpiSemanticsData(tester, 'Upload').value, '42');
        expect(lpiSemanticsData(tester, 'Upload').minValue, '0');
        expect(lpiSemanticsData(tester, 'Upload').maxValue, '100');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[a11y] indeterminate has no value', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'indeterminate',
          semanticsLabel: 'Loading',
        ),
        settle: false,
      );
      final handle = tester.ensureSemantics();
      try {
        expect(lpiSemanticsData(tester, 'Loading').value, anyOf(isNull, isEmpty));
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint surfaces', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          value: 10,
          semanticsLabel: 'P',
          semanticsHint: 'Please wait',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(lpiSemanticsData(tester, 'P').hint, 'Please wait');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[a11y] ariaHidden collapses tree', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          value: 10,
          semanticsLabel: 'Hidden',
          ariaHidden: true,
        ),
      );
      expect(find.bySemanticsLabel('Hidden'), findsNothing);
    });

    testWidgetsAllPlatforms('[a11y] live region for aria-live polite',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          value: 10,
          semanticsLabel: 'Live',
          ariaLive: 'polite',
        ),
      );
      expect(lpiSemanticsWithLiveRegionFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] testId → identifier', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          value: 50,
          semanticsLabel: 'QA',
          testId: 'lpi-qa',
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(lpiSemanticsData(tester, 'QA').identifier, 'lpi-qa');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
      '[a11y] semanticsLabelledBy id is exposed as semantics identifier',
      (tester) async {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            value: 10,
            semanticsLabel: 'Upload',
            semanticsLabelledBy: 'upload-status-label',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(
            lpiSemanticsData(tester, 'Upload').identifier,
            'upload-status-label',
          );
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] semanticsLabelledBy-only falls back to identifier without anchor',
      (tester) async {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            value: 10,
            semanticsLabelledBy: 'upload-status-label',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data =
              lpiSemanticsDataByIdentifier(tester, 'upload-status-label');
          expect(data.label, anyOf(isNull, isEmpty));
          expect(data.identifier, 'upload-status-label');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] semanticsLabelledBy-only resolves label from identifier anchor',
      (tester) async {
        await pumpLpiQaHarness(
          tester,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Semantics(
                container: true,
                identifier: 'upload-status-label',
                label: 'Upload status',
                child: ExcludeSemantics(
                  child: Text('Upload status'),
                ),
              ),
              const SizedBox(height: 8),
              const OneUiLinearProgressIndicator(
                value: 10,
                semanticsLabelledBy: 'upload-status-label',
              ),
            ],
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = lpiProgressBarSemanticsData(tester);
          expect(data.label, 'Upload status');
          expect(data.identifier, anyOf(isNull, isEmpty));
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] testId wins identifier over semanticsLabelledBy',
      (tester) async {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            value: 10,
            semanticsLabel: 'Upload',
            semanticsLabelledBy: 'upload-status-label',
            testId: 'lpi-automation-id',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(
            lpiSemanticsData(tester, 'Upload').identifier,
            'lpi-automation-id',
          );
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] semanticsDescribedBy exposes controlsNodes (not identifier)',
      (tester) async {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            value: 10,
            semanticsLabel: 'Upload',
            semanticsDescribedBy: 'upload-desc-id',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = lpiSemanticsData(tester, 'Upload');
          expect(data.controlsNodes, contains('upload-desc-id'));
          expect(data.identifier, anyOf(isNull, isEmpty));
        } finally {
          handle.dispose();
        }
      },
    );
  });
}
