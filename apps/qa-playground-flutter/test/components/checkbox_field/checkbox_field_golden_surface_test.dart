/// CheckboxField visual-regression tests — INSIDE SURFACE.
///
/// Validates that `appearance: 'auto'` (the field default → resolves to the
/// secondary stack, with the inner Checkbox's unchecked stroke inheriting the
/// parent Surface context) renders correctly when the whole field shell — label,
/// description and feedback copy — sits on a tinted / bold surface. Each baseline
/// pairs an unchecked + checked field so the unchecked-appearance inheritance and
/// the on-surface text contrast are both visible.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../../support/components/checkbox_field_harness.dart';
import '../../support/golden_capture.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][surface] CheckboxField — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpCheckboxFieldJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(
              const Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OneUiCheckboxField(
                    label: 'Unchecked',
                    description: 'On surface.',
                    appearance: 'auto',
                    checked: false,
                  ),
                  SizedBox(height: 12),
                  OneUiCheckboxField(
                    label: 'Checked',
                    description: 'On surface.',
                    appearance: 'auto',
                    checked: true,
                  ),
                ],
              ),
            ),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/surface/checkbox_field_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
