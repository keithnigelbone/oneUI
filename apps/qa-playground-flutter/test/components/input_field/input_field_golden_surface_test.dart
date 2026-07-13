/// InputField visual-regression tests — INSIDE SURFACE.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_field_harness.dart';

const _kSurfaceModes = <String>['subtle', 'bold', 'minimal', 'elevated'];
const _kSurfaceAppearances = <String>['primary', 'secondary'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  group('[golden][surface] InputField — on tinted surfaces', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpInputFieldJioHarnessSettled(
            tester,
            const Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiInputField(
                  label: 'Email',
                  description: 'On surface context.',
                  placeholder: 'you@example.com',
                  appearance: OneUiInputAppearance.auto,
                ),
                SizedBox(height: 12),
                OneUiInputField(
                  label: 'With error',
                  error: 'Validation failed.',
                  appearance: OneUiInputAppearance.auto,
                ),
              ],
            ),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            find.byType(Column).first,
            matchesGoldenFile(
                'goldens/surface/input_field_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
