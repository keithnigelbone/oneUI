/// LinearProgressIndicator functional QA tests.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  group('[smoke] LinearProgressIndicator', () {
    testWidgetsAllPlatforms('[smoke] determinate renders bar', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(value: 45, semanticsLabel: 'Upload'),
      );
      expect(lpiRootFinder(), findsOneWidget);
      expect(lpiLayoutFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] indeterminate renders', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'indeterminate',
          semanticsLabel: 'Loading',
        ),
        settle: false,
      );
      expect(lpiIsIndeterminate(tester), isTrue);
    });
  });

  group('[functional] LinearProgressIndicator — type', () {
    testWidgetsAllPlatforms('[fn] determinate is not indeterminate',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(value: 50, semanticsLabel: 'P'),
      );
      expect(lpiIsIndeterminate(tester), isFalse);
    });

    testWidgetsAllPlatforms('[fn] indeterminate flag', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          type: 'indeterminate',
          semanticsLabel: 'L',
        ),
        settle: false,
      );
      expect(lpiIsIndeterminate(tester), isTrue);
    });
  });

  group('[functional] LinearProgressIndicator — value → fill', () {
    Future<double> fill(WidgetTester tester, double value) async {
      await pumpLpiQaHarness(
        tester,
        OneUiLinearProgressIndicator(value: value, semanticsLabel: 'V'),
      );
      return lpiFillFraction(tester);
    }

    testWidgetsAllPlatforms('[fn] value=25 → quarter fill', (tester) async {
      expect(await fill(tester, 25), closeTo(0.25, 0.001));
    });

    testWidgetsAllPlatforms('[fn] clamps value', (tester) async {
      expect(await fill(tester, 150), closeTo(1.0, 0.001));
      expect(await fill(tester, -5), closeTo(0.0, 0.001));
    });
  });

  group('[functional] LinearProgressIndicator — size', () {
    testWidgetsAllPlatforms('[fn] S/M/L track heights increase', (tester) async {
      final heights = <String, double>{};
      for (final size in ['S', 'M', 'L']) {
        await pumpLpiQaHarness(
          tester,
          OneUiLinearProgressIndicator(
            size: size,
            value: 50,
            semanticsLabel: 's',
          ),
        );
        heights[size] = lpiTrackHeightPx(tester);
        expect(heights[size], closeTo(kQaLpiTrackHeightPx[size]!, 0.5));
      }
      expect(heights['S']!, lessThan(heights['M']!));
      expect(heights['M']!, lessThan(heights['L']!));
    });
  });

  group('[functional] LinearProgressIndicator — roundCaps', () {
    testWidgetsAllPlatforms('[fn] round caps use pill radius', (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          roundCaps: true,
          value: 50,
          semanticsLabel: 'r',
        ),
      );
      final height = lpiTrackHeightPx(tester);
      expect(lpiBorderRadiusPx(tester), greaterThan(0));
      expect(lpiBorderRadiusPx(tester), closeTo(height / 2, 0.01));
      expect(lpiIndicatorBorderRadiusPx(tester), closeTo(height / 2, 0.01));
    });

    testWidgetsAllPlatforms('[fn] flat caps — square track and indicator',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          roundCaps: false,
          value: 50,
          semanticsLabel: 'f',
        ),
      );
      expect(lpiBorderRadiusPx(tester), 0);
      expect(lpiIndicatorBorderRadiusPx(tester), 0);
    });
  });

  group('[functional] LinearProgressIndicator — appearance', () {
    testWidgetsAllPlatforms('[fn] auto resolves to primary colours',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          appearance: 'auto',
          value: 50,
          semanticsLabel: 'a',
        ),
      );
      expect(lpiIndicatorColor(tester), isA<Color>());
    });
  });
}
