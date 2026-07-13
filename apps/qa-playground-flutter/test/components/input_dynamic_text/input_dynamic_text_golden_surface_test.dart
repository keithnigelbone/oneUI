/// InputDynamicText visual-regression tests — SURFACE context.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[golden][surface] InputDynamicText', () {
    for (final mode in ['subtle', 'bold', 'minimal', 'elevated']) {
      testWidgets('in surface $mode', (tester) async {
        await pumpInputDynamicTextJioHarnessSettled(
          tester,
          const OneUiInputDynamicText(
            content: '0 / 100 characters',
            end: 'Helper Button',
          ),
          surfaceMode: mode,
          surfaceAppearance: 'secondary',
        );
        await expectLater(
          inputDynamicTextRootFinder(),
          matchesGoldenFile(
            'goldens/surface/input_dynamic_text_in_surface_$mode.png',
          ),
        );
      });
    }
  });
}
