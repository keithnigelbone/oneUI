/// RadioField visual-regression tests — INSIDE SURFACE.
///
/// Validates that `appearance: 'auto'` options inherit the parent Surface
/// context (unchecked stroke follows the surface role; checked fill stays on the
/// secondary stack).
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] RadioField — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpRadioJioHarnessSettled(
            tester,
            OneUiRadioField(label: 'Plan', appearance: 'auto', defaultValue: 'basic', children: [
              OneUiRadio(value: 'basic', label: 'Basic'),
              OneUiRadio(value: 'pro', label: 'Pro'),
            ]),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            find.byType(OneUiRadioField),
            matchesGoldenFile('goldens/surface/radio_field_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
