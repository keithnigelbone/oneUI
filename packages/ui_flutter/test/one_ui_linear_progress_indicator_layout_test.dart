/// LPI layout + fill fraction tests.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import 'lpi_test_harness.dart';

void main() {
  group('[fn] LinearProgressIndicator — value → fill', () {
    Future<double> fractionFor(WidgetTester tester, double value) async {
      await tester.pumpWidget(
        pumpLpiApp(
          OneUiLinearProgressIndicator(value: value, semanticsLabel: 'V'),
        ),
      );
      await tester.pumpAndSettle();
      return lpiFillFraction(tester);
    }

    testWidgetsAllPlatforms('[fn] value=0 → empty, value=100 → full',
        (tester) async {
      expect(await fractionFor(tester, 0), closeTo(0.0, 0.001));
      expect(await fractionFor(tester, 100), closeTo(1.0, 0.001));
    });

    testWidgetsAllPlatforms('[fn] value=50 → half fill', (tester) async {
      expect(await fractionFor(tester, 50), closeTo(0.5, 0.001));
    });

    testWidgetsAllPlatforms('[fn] clamps above max and below min',
        (tester) async {
      expect(await fractionFor(tester, 150), closeTo(1.0, 0.001));
      expect(await fractionFor(tester, -10), closeTo(0.0, 0.001));
    });
  });

  group('[fn] LinearProgressIndicator — size → track height', () {
    testWidgetsAllPlatforms('[fn] S < M < L track heights', (tester) async {
      final heights = <String, double>{};
      for (final size in ['S', 'M', 'L']) {
        await tester.pumpWidget(
          pumpLpiApp(
            OneUiLinearProgressIndicator(
              size: size,
              value: 50,
              semanticsLabel: 's',
            ),
          ),
        );
        await tester.pumpAndSettle();
        heights[size] = lpiTrackHeightPx(tester);
      }
      expect(heights['S']!, closeTo(6, 0.5));
      expect(heights['M']!, closeTo(10, 0.5));
      expect(heights['L']!, closeTo(14, 0.5));
      expect(heights['S']!, lessThan(heights['M']!));
      expect(heights['M']!, lessThan(heights['L']!));
    });
  });
}
