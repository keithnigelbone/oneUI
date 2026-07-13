/// LinearProgressIndicator platform semantics parity.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_linear_progress_indicator.dart';

import '../../support/components/linear_progress_indicator_harness.dart';

void main() {
  group('[platform] LinearProgressIndicator', () {
    testWidgets('[platform] mobile value semantics', (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(value: 33, semanticsLabel: 'M'),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(lpiSemanticsData(tester, 'M').value, '33');
        } finally {
          handle.dispose();
        }
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('[platform] desktop indeterminate busy', (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        await pumpLpiQaHarness(
          tester,
          const OneUiLinearProgressIndicator(
            type: 'indeterminate',
            semanticsLabel: 'D',
          ),
          settle: false,
        );
        final handle = tester.ensureSemantics();
        try {
          expect(lpiSemanticsData(tester, 'D').value, anyOf(isNull, isEmpty));
        } finally {
          handle.dispose();
        }
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });
}
