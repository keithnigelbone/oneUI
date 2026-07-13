/// LinearProgressIndicator visual regression burn-down — LPI-VIS-00N.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  group('[visual] LinearProgressIndicator burn-down', () {
    testWidgetsAllPlatforms('[visual] [LPI-VIS-001] determinate fill visible',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(value: 60, semanticsLabel: 'V'),
      );
      expect(lpiFillFraction(tester), greaterThan(0));
      expect(lpiIndicatorColor(tester), isNot(equals(lpiTrackColor(tester))));
    });

    testWidgetsAllPlatforms('[visual] [LPI-VIS-002] size L thicker than S',
        (tester) async {
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          size: 'S',
          value: 50,
          semanticsLabel: 's',
        ),
      );
      final sHeight = lpiTrackHeightPx(tester);
      await pumpLpiQaHarness(
        tester,
        const OneUiLinearProgressIndicator(
          size: 'L',
          value: 50,
          semanticsLabel: 'l',
        ),
      );
      expect(lpiTrackHeightPx(tester), greaterThan(sHeight));
    });
  });
}
