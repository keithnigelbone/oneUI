/// React LPI parity — `LinearProgressIndicator.shared.ts` + test.tsx contracts.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_types.dart';

import 'lpi_test_harness.dart';

void main() {
  group('[parity] React LPI — state resolver', () {
    test('[parity] clampProgressValue matches web', () {
      expect(clampLpiProgressValue(-10), 0);
      expect(clampLpiProgressValue(150), 100);
      expect(clampLpiProgressValue(null), 0);
    });

    test('[parity] indeterminate sets progressValue null equivalent', () {
      final s = resolveOneUiLinearProgressIndicatorState(type: 'indeterminate');
      expect(s.isIndeterminate, isTrue);
      expect(s.fillFraction, 0);
    });

    test('[parity] auto → primary', () {
      expect(
        resolveOneUiLinearProgressIndicatorState(appearance: 'auto')
            .resolvedAppearance,
        'primary',
      );
    });

    test('[parity] roundCaps data attr', () {
      expect(
        resolveOneUiLinearProgressIndicatorState(roundCaps: false)
            .dataAttrs['data-round-caps'],
        'false',
      );
    });
  });

  group('[parity] React LPI — widget semantics', () {
    testWidgetsAllPlatforms('[parity] determinate value string', (tester) async {
      await tester.pumpWidget(
        pumpLpiApp(
          const OneUiLinearProgressIndicator(
            value: 75,
            semanticsLabel: 'Task progress',
          ),
        ),
      );
      await pumpLpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          lpiSemanticsData(tester, 'Task progress').value,
          '75',
        );
        expect(lpiSemanticsData(tester, 'Task progress').minValue, '0');
        expect(lpiSemanticsData(tester, 'Task progress').maxValue, '100');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[parity] indeterminate uses loadingSpinner role', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpLpiApp(
          const OneUiLinearProgressIndicator(
            type: 'indeterminate',
            semanticsLabel: 'Loading',
          ),
        ),
      );
      await pumpLpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        final data = lpiSemanticsData(tester, 'Loading');
        expect(data.value, anyOf(isNull, isEmpty));
        expect(data.hasFlag(SemanticsFlag.isHidden), isFalse);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[parity] testId → Semantics.identifier (LPI-FN-001 fix)',
        (tester) async {
      await tester.pumpWidget(
        pumpLpiApp(
          const OneUiLinearProgressIndicator(
            value: 50,
            semanticsLabel: 'QA',
            testId: 'lpi-root',
          ),
        ),
      );
      await pumpLpiLayout(tester);
      final handle = tester.ensureSemantics();
      try {
        expect(
          lpiSemanticsData(tester, 'QA').identifier,
          'lpi-root',
        );
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
      '[parity] semanticsLabelledBy id is exposed as semantics identifier',
      (tester) async {
        await tester.pumpWidget(
          pumpLpiApp(
            const OneUiLinearProgressIndicator(
              value: 10,
              semanticsLabel: 'Upload',
              semanticsLabelledBy: 'upload-status-label',
            ),
          ),
        );
        await pumpLpiLayout(tester);
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
      '[parity] semanticsLabelledBy-only falls back to identifier without anchor',
      (tester) async {
        await tester.pumpWidget(
          pumpLpiApp(
            const OneUiLinearProgressIndicator(
              value: 10,
              semanticsLabelledBy: 'upload-status-label',
            ),
          ),
        );
        await pumpLpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data =
              lpiSemanticsDataByIdentifier(tester, 'upload-status-label');
          expect(data.label, anyOf(isNull, isEmpty));
          expect(data.identifier, 'upload-status-label');
          expect(find.bySemanticsLabel(RegExp(r'.')), findsNothing);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[parity] semanticsLabelledBy-only resolves label from identifier anchor',
      (tester) async {
        await tester.pumpWidget(
          pumpLpiApp(
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
          ),
        );
        await pumpLpiLayout(tester);
        final handle = tester.ensureSemantics();
        try {
          final data = lpiProgressBarSemanticsData(tester);
          expect(data.label, 'Upload status');
          expect(data.identifier, anyOf(isNull, isEmpty));
          expect(data.value, '10');
          expect(data.minValue, '0');
          expect(data.maxValue, '100');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[parity] testId wins Semantics.identifier over semanticsLabelledBy',
      (tester) async {
        await tester.pumpWidget(
          pumpLpiApp(
            const OneUiLinearProgressIndicator(
              value: 10,
              semanticsLabel: 'Upload',
              semanticsLabelledBy: 'upload-status-label',
              testId: 'lpi-automation-id',
            ),
          ),
        );
        await pumpLpiLayout(tester);
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
      '[parity] semanticsDescribedBy exposes controlsNodes (not identifier)',
      (tester) async {
        await tester.pumpWidget(
          pumpLpiApp(
            const OneUiLinearProgressIndicator(
              value: 10,
              semanticsLabel: 'Upload',
              semanticsDescribedBy: 'upload-desc-id',
            ),
          ),
        );
        await pumpLpiLayout(tester);
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
