/// CircularProgressIndicator accessibility QA tests — resolver units + real
/// widget SemanticsData.
///
/// Probed contract: determinate exposes a value string ("N percent");
/// indeterminate is busy (no value); `semanticsHint` surfaces; `ariaHidden`
/// collapses the node; `aria-live: polite|assertive` enables a live region;
/// `semanticsLabelledBy` resolves accessible names from identifier anchors;
/// centre percentage text is excluded so it is not announced twice.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator_types.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

void main() {
  // ===========================================================================
  // RESOLVER — resolveOneUiCircularProgressIndicatorSemantics units.
  // ===========================================================================

  group('[a11y] resolveOneUiCircularProgressIndicatorSemantics', () {
    test('[a11y] indeterminate exposes busy state and no value', () {
      final state = resolveOneUiCircularProgressIndicatorState();
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Loading',
      );
      expect(a11y.isBusy, isTrue);
      expect(a11y.valueNow, isNull);
      expect(a11y.label, 'Loading');
    });

    test('[a11y] determinate exposes valueNow', () {
      final state = resolveOneUiCircularProgressIndicatorState(value: 45);
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: state,
        semanticsLabel: 'Upload',
        min: 0,
        max: 100,
      );
      expect(a11y.isBusy, isFalse);
      expect(a11y.valueNow, 45);
      expect(a11y.valueMin, 0);
      expect(a11y.valueMax, 100);
    });

    test('[a11y] ariaHidden requests excluded semantics', () {
      final a11y = resolveOneUiCircularProgressIndicatorSemantics(
        state: resolveOneUiCircularProgressIndicatorState(value: 10),
        semanticsLabel: 'X',
        ariaHidden: true,
      );
      expect(a11y.excludeSemantics, isTrue);
    });

    test('[a11y] aria-live polite/assertive enable a live region', () {
      expect(resolveCpiSemanticsLiveRegion('polite'), isTrue);
      expect(resolveCpiSemanticsLiveRegion('assertive'), isTrue);
      expect(resolveCpiSemanticsLiveRegion('off'), isFalse);
      expect(resolveCpiSemanticsLiveRegion(null), isFalse);
    });

    test('[a11y] semanticsLabelledBy and semanticsDescribedBy are separate', () {
      expect(
        resolveOneUiCircularProgressIndicatorSemantics(
          state: resolveOneUiCircularProgressIndicatorState(value: 1),
          semanticsLabelledBy: 'cap',
        ).labelledBy,
        'cap',
      );
      expect(
        resolveOneUiCircularProgressIndicatorSemantics(
          state: resolveOneUiCircularProgressIndicatorState(value: 1),
          semanticsDescribedBy: 'desc',
        ).describedBy,
        'desc',
      );
      expect(
        resolveOneUiCircularProgressIndicatorSemantics(
          state: resolveOneUiCircularProgressIndicatorState(value: 1),
          semanticsDescribedBy: 'desc',
        ).labelledBy,
        isNull,
      );
    });
  });

  // ===========================================================================
  // WIDGET — real SemanticsData on the rendered progressbar.
  // ===========================================================================

  group('[a11y] CircularProgressIndicator widget — real semantics', () {
    testWidgetsAllPlatforms('[a11y] semanticsLabel exposes the accessible name', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 30, semanticsLabel: 'Loading content'),
      );
      expect(find.bySemanticsLabel('Loading content'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] determinate announces "N percent"', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 42, semanticsLabel: 'Upload'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Upload').value, '42');
      });
    });

    testWidgetsAllPlatforms('[a11y] custom min/max reflected in the percent string', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 5, min: 0, max: 10, semanticsLabel: 'Scaled'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Scaled').value, '50');
      });
    });

    testWidgetsAllPlatforms('[a11y] indeterminate omits the value (busy)', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(variant: 'indeterminate', semanticsLabel: 'Loading'),
        settle: false,
      );
      withSemanticsHandle(tester, () {
        final data = cpiSemanticsData(tester, 'Loading');
        expect(data.label, 'Loading');
        expect(data.value, anyOf(isNull, isEmpty));
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint surfaces in semantics', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 25,
          semanticsLabel: 'Upload',
          semanticsHint: 'Downloading file',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Upload').hint, 'Downloading file');
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaHidden collapses the semantics tree', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 10, ariaHidden: true, semanticsLabel: 'Hidden'),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Hidden'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] aria-live polite enables a live region', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 0, semanticsLabel: 'Live', ariaLive: 'polite'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsWithLiveRegionFinder(), findsWidgets);
        expect(cpiSemanticsData(tester, 'Live').label, 'Live');
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsLabelledBy is exposed as identifier', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 10,
          semanticsLabel: 'Bar',
          semanticsLabelledBy: 'caption-id',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Bar').identifier, 'caption-id');
      });
    });

    testWidgetsAllPlatforms(
      '[a11y] semanticsLabelledBy-only falls back to identifier without anchor',
      (tester) async {
        await pumpCpiQaHarness(
          tester,
          const OneUiCircularProgressIndicator(
            value: 10,
            semanticsLabelledBy: 'caption-id',
          ),
        );
        withSemanticsHandle(tester, () {
          final data = cpiSemanticsDataByIdentifier(tester, 'caption-id');
          expect(data.label, anyOf(isNull, isEmpty));
          expect(data.identifier, 'caption-id');
        });
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] semanticsLabelledBy-only resolves label from identifier anchor',
      (tester) async {
        await pumpCpiQaHarness(
          tester,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Semantics(
                container: true,
                identifier: 'caption-id',
                label: 'Upload status',
                child: ExcludeSemantics(
                  child: Text('Upload status'),
                ),
              ),
              const SizedBox(height: 8),
              const OneUiCircularProgressIndicator(
                value: 10,
                semanticsLabelledBy: 'caption-id',
              ),
            ],
          ),
        );
        withSemanticsHandle(tester, () {
          final data = cpiProgressBarSemanticsData(tester);
          expect(data.label, 'Upload status');
          expect(data.identifier, anyOf(isNull, isEmpty));
        });
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] semanticsDescribedBy exposes controlsNodes (not identifier)',
      (tester) async {
        await pumpCpiQaHarness(
          tester,
          const OneUiCircularProgressIndicator(
            value: 10,
            semanticsLabel: 'Bar',
            semanticsDescribedBy: 'desc-id',
          ),
        );
        withSemanticsHandle(tester, () {
          final data = cpiSemanticsData(tester, 'Bar');
          expect(data.controlsNodes, contains('desc-id'));
          expect(data.identifier, anyOf(isNull, isEmpty));
        });
      },
    );

    testWidgetsAllPlatforms('[a11y] centre percentage is not announced twice', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          size: 'L',
          content: 'text',
          semanticsLabel: 'Half done',
        ),
      );
      withSemanticsHandle(tester, () {
        expect(find.text('50'), findsOneWidget);
        expect(find.bySemanticsLabel('50'), findsNothing);
        expect(cpiSemanticsData(tester, 'Half done').value, '50');
      });
    });
  });
}
