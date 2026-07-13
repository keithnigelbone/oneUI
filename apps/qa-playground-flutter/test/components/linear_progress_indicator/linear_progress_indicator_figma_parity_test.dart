/// LinearProgressIndicator Figma API matrix — offline measurement harness.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  group('[figma] LinearProgressIndicator — type', () {
    for (final type in ['determinate', 'indeterminate']) {
      testWidgetsAllPlatforms('[figma] type=$type', (tester) async {
        await pumpLpiQaHarness(
          tester,
          OneUiLinearProgressIndicator(
            type: type,
            value: 55,
            semanticsLabel: type,
          ),
          settle: type == 'indeterminate' ? false : true,
        );
        expect(lpiIsIndeterminate(tester), type == 'indeterminate');
      });
    }
  });

  group('[figma] LinearProgressIndicator — size', () {
    for (final size in ['S', 'M', 'L']) {
      testWidgetsAllPlatforms('[figma] size=$size', (tester) async {
        await pumpLpiQaHarness(
          tester,
          OneUiLinearProgressIndicator(
            size: size,
            value: 55,
            semanticsLabel: size,
          ),
        );
        expect(
          lpiTrackHeightPx(tester),
          closeTo(kQaLpiTrackHeightPx[size]!, 0.5),
        );
      });
    }
  });

  group('[figma] LinearProgressIndicator — roundCaps', () {
    for (final caps in [true, false]) {
      testWidgetsAllPlatforms('[figma] roundCaps=$caps', (tester) async {
        await pumpLpiQaHarness(
          tester,
          OneUiLinearProgressIndicator(
            roundCaps: caps,
            value: 45,
            semanticsLabel: 'c',
          ),
        );
        if (caps) {
          expect(lpiBorderRadiusPx(tester), greaterThan(0));
        } else {
          expect(lpiBorderRadiusPx(tester), 0);
          expect(lpiIndicatorBorderRadiusPx(tester), 0);
        }
      });
    }
  });

  group('[figma] LinearProgressIndicator — appearance', () {
    for (final appearance in [
      'auto',
      'neutral',
      'primary',
      'secondary',
      'sparkle',
      'negative',
      'positive',
      'warning',
      'informative',
    ]) {
      testWidgetsAllPlatforms('[figma] appearance=$appearance', (tester) async {
        await pumpLpiQaHarness(
          tester,
          OneUiLinearProgressIndicator(
            appearance: appearance,
            value: 65,
            semanticsLabel: appearance,
          ),
        );
        expect(lpiIndicatorColor(tester), isA<Color>());
        expect(lpiTrackColor(tester), isA<Color>());
      });
    }
  });

  group('[figma] LinearProgressIndicator — value matrix', () {
    for (final value in [0, 25, 50, 75, 100]) {
      testWidgetsAllPlatforms('[figma] value=$value', (tester) async {
        await pumpLpiQaHarness(
          tester,
          OneUiLinearProgressIndicator(
            value: value.toDouble(),
            semanticsLabel: 'v',
          ),
        );
        expect(
          lpiFillFraction(tester),
          closeTo(value / 100, 0.001),
        );
      });
    }
  });
}
