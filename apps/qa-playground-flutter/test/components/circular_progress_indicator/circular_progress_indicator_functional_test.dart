/// CircularProgressIndicator functional QA tests — mirrors web
/// `CircularProgressIndicator.test.tsx` + RN `useCircularProgressIndicatorState`.
///
/// Runs on the synthetic measurement harness (offline). Every behavioural claim
/// reads REAL rendered state: the ring diameter via `tester.getSize`, the live
/// `CustomPainter` fields (sweep fraction, indeterminate flag, colours), and the
/// rendered centre content — never a bare `findsOneWidget`.
///
/// Probed facts baked in (see harness): size→diameter 2XS=8 … 5XL=64px ;
/// determinate sweep = value/(max-min) ; variant=determinate w/o value coerces
/// to indeterminate ; centre %-text only renders at L and above ;
/// indicatorColor/trackColor overrides reach the painter.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

void main() {
  group('[smoke] CircularProgressIndicator', () {
    testWidgetsAllPlatforms('[smoke] indeterminate renders a ring',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          variant: 'indeterminate',
          semanticsLabel: 'Loading',
        ),
        settle: false,
      );
      expect(cpiRootFinder(), findsOneWidget);
      expect(cpiPaintFinder(), findsWidgets);
    });

    testWidgetsAllPlatforms('[smoke] determinate renders value',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            value: 45, semanticsLabel: 'Upload'),
      );
      expect(cpiRootFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // VARIANT — determinate vs indeterminate (real painter flag).
  // ===========================================================================

  group('[functional] CircularProgressIndicator — variant', () {
    testWidgetsAllPlatforms('[fn] determinate paints a finite arc (not busy)',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, semanticsLabel: 'P'),
      );
      expect(cpiPainter(tester).isIndeterminate, isFalse);
    });

    testWidgetsAllPlatforms('[fn] indeterminate paints a busy spinner',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            variant: 'indeterminate', semanticsLabel: 'L'),
        settle: false,
      );
      expect(cpiPainter(tester).isIndeterminate, isTrue);
    });

    testWidgetsAllPlatforms(
        '[fn] determinate WITHOUT a value coerces to indeterminate',
        (tester) async {
      // RN parity: variant=determinate but value==null ⇒ indeterminate.
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            variant: 'determinate', semanticsLabel: 'C'),
        settle: false,
      );
      expect(cpiPainter(tester).isIndeterminate, isTrue);
    });
  });

  // ===========================================================================
  // VALUE — sweep fraction tracks value across the [min, max] range.
  // ===========================================================================

  group('[functional] CircularProgressIndicator — value → sweep', () {
    Future<double> sweepFor(WidgetTester tester,
        {required double value, double min = 0, double max = 100}) async {
      await pumpCpiQaHarness(
        tester,
        OneUiCircularProgressIndicator(
            value: value, min: min, max: max, semanticsLabel: 'V'),
      );
      return cpiPainter(tester).determinateSweepFraction;
    }

    testWidgetsAllPlatforms('[fn] value=0 → empty arc, value=100 → full arc',
        (tester) async {
      expect(await sweepFor(tester, value: 0), closeTo(0.0, 0.001));
      expect(await sweepFor(tester, value: 100), closeTo(1.0, 0.001));
    });

    testWidgetsAllPlatforms('[fn] value=25 → quarter sweep', (tester) async {
      expect(await sweepFor(tester, value: 25), closeTo(0.25, 0.001));
    });

    testWidgetsAllPlatforms('[fn] value clamps above max and below min',
        (tester) async {
      expect(await sweepFor(tester, value: 150), closeTo(1.0, 0.001));
      expect(await sweepFor(tester, value: -10), closeTo(0.0, 0.001));
    });

    testWidgetsAllPlatforms('[fn] custom min/max normalises the sweep',
        (tester) async {
      expect(await sweepFor(tester, value: 5, min: 0, max: 10),
          closeTo(0.5, 0.001));
    });
  });

  // ===========================================================================
  // SIZE — diameter resolves from the spacing scale (real getSize).
  // ===========================================================================

  group('[functional] CircularProgressIndicator — size', () {
    testWidgetsAllPlatforms('[fn] default size is M (20px diameter)',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, semanticsLabel: 'M'),
      );
      expect(cpiDiameterPx(tester), kQaCpiDiameterPx['M']);
    });

    testWidgetsAllPlatforms(
        '[fn] diameter grows monotonically across the scale', (tester) async {
      double? prev;
      for (final size in kQaCpiDiameterPx.keys) {
        await pumpCpiQaHarness(
          tester,
          OneUiCircularProgressIndicator(
              value: 50, size: size, semanticsLabel: size),
        );
        final d = cpiDiameterPx(tester);
        if (prev != null) {
          expect(d, greaterThan(prev),
              reason: 'size $size must be larger than the previous step');
        }
        prev = d;
      }
    });
  });

  // ===========================================================================
  // CONTENT — none | text (L+) | icon.
  // ===========================================================================

  group('[functional] CircularProgressIndicator — content', () {
    testWidgetsAllPlatforms('[fn] content=text shows the percentage at size L',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 25,
          size: 'L',
          content: 'text',
          semanticsLabel: 'WithLabel',
        ),
      );
      expect(find.text('25'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[fn] content=text renders the percentage at size M', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 25,
          size: 'M',
          content: 'text',
          semanticsLabel: 'WithLabel',
        ),
      );
      expect(find.text('25'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        '[fn] content=text renders the percentage at size S', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 25,
          size: 'S',
          content: 'text',
          semanticsLabel: 'WithLabel',
        ),
      );
      expect(find.text('25'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] content=icon renders the child slot',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 10,
          size: '3XL',
          content: 'icon',
          semanticsLabel: 'WithIcon',
          child: Text('★', key: Key('cpi-icon')),
        ),
      );
      expect(find.byKey(const Key('cpi-icon')), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] content=none renders no centre text',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            value: 80, size: 'L', semanticsLabel: 'Plain'),
      );
      expect(find.text('80'), findsNothing);
    });
  });

  // ===========================================================================
  // COLOUR OVERRIDES — indicatorColor / trackColor reach the painter.
  // ===========================================================================

  group('[functional] CircularProgressIndicator — colour overrides', () {
    testWidgetsAllPlatforms('[fn] indicatorColor override is painted',
        (tester) async {
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

    testWidgetsAllPlatforms('[fn] trackColor override is painted',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
          value: 50,
          semanticsLabel: 'C',
          trackColor: Color(0xFF445566),
        ),
      );
      expect(cpiPainter(tester).trackColor, const Color(0xFF445566));
    });

    testWidgetsAllPlatforms(
        '[fn] indicator and track default to distinct colours', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, semanticsLabel: 'C'),
      );
      final p = cpiPainter(tester);
      expect(p.indicatorColor, isNot(p.trackColor),
          reason: 'the progress arc must be distinguishable from its track');
    });
  });

  // ===========================================================================
  // SHOW — show=false removes the ring entirely.
  // ===========================================================================

  group('[functional] CircularProgressIndicator — show', () {
    testWidgetsAllPlatforms('[fn] show=false collapses the ring',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(
            value: 10, show: false, semanticsLabel: 'Gone'),
      );
      expect(cpiRootFinder(), findsOneWidget);
      expect(cpiPaintFinder(), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] show=true renders the ring', (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 10, semanticsLabel: 'Here'),
      );
      expect(cpiPaintFinder(), findsWidgets);
    });
  });
}
