/// LinearProgressIndicator smoke + state resolver tests.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator_types.dart';

import 'lpi_test_harness.dart';

void main() {
  group('[smoke] OneUiLinearProgressIndicator', () {
    testWidgetsAllPlatforms('[smoke] determinate renders', (tester) async {
      await tester.pumpWidget(
        pumpLpiApp(
          const OneUiLinearProgressIndicator(
            value: 50,
            semanticsLabel: 'Upload',
          ),
        ),
      );
      await pumpLpiLayout(tester);
      expect(lpiRootFinder(), findsOneWidget);
      expect(lpiLayoutFinder(), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] indeterminate renders', (tester) async {
      await tester.pumpWidget(
        pumpLpiApp(
          const OneUiLinearProgressIndicator(
            type: 'indeterminate',
            semanticsLabel: 'Loading',
          ),
        ),
      );
      await pumpLpiLayout(tester);
      expect(lpiIsIndeterminate(tester), isTrue);
    });
  });

  group('[fn] resolveOneUiLinearProgressIndicatorState', () {
    test('[fn] defaults type=determinate size=M appearance=primary', () {
      final s = resolveOneUiLinearProgressIndicatorState();
      expect(s.resolvedType, 'determinate');
      expect(s.resolvedSize, 'M');
      expect(s.resolvedAppearance, 'primary');
      expect(s.roundCaps, isTrue);
    });

    test('[fn] indeterminate ignores value', () {
      final s = resolveOneUiLinearProgressIndicatorState(
        type: 'indeterminate',
        value: 80,
      );
      expect(s.isIndeterminate, isTrue);
      expect(s.fillFraction, 0);
    });

    test('[fn] clampProgressValue clamps 0–100', () {
      expect(clampLpiProgressValue(-10), 0);
      expect(clampLpiProgressValue(150), 100);
      expect(clampLpiProgressValue(45), 45);
    });

    test('[fn] auto appearance resolves to primary', () {
      expect(
        resolveOneUiLinearProgressIndicatorState(appearance: 'auto')
            .resolvedAppearance,
        'primary',
      );
    });

    test('[fn] dataAttrs include component key', () {
      final attrs = resolveOneUiLinearProgressIndicatorState().dataAttrs;
      expect(attrs['data-oneui-component'], 'LinearProgressIndicator');
      expect(attrs['data-size'], 'M');
      expect(attrs['data-type'], 'determinate');
    });
  });
}
