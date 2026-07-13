/// Input visual-regression tests — SURFACE context.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  group('[golden][surface] Input', () {
    for (final mode in ['subtle', 'bold', 'minimal', 'elevated']) {
      testWidgets('in surface $mode', (tester) async {
        await pumpInputJioHarnessSettled(
          tester,
          const OneUiInput(
            appearance: OneUiInputAppearance.auto,
            placeholder: 'Auto',
          ),
          surfaceMode: mode,
          surfaceAppearance: 'secondary',
        );
        await expectLater(
          inputRootFinder(),
          matchesGoldenFile('goldens/surface/input_in_surface_$mode.png'),
        );
      });
    }
  });
}
