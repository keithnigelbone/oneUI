/// Checkbox visual-regression tests — INSIDE SURFACE.
///
/// Validates that `appearance: 'auto'` inherits the parent Surface context: the
/// unchecked stroke follows the surface's resolved appearance
/// (`resolveOneUiCheckboxUncheckedAppearance` → parent role), while the checked
/// fill stays on the secondary stack. Each baseline pairs an unchecked + checked
/// checkbox so the unchecked-appearance inheritance is visible.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import '../../support/components/checkbox_harness.dart';
import '../../support/golden_capture.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][surface] Checkbox — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpCheckboxJioHarnessSettled(
            tester,
            wrapOneUiGoldenChild(
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OneUiCheckbox(ariaLabel: 'u', appearance: 'auto', checked: false),
                  const SizedBox(height: 12),
                  OneUiCheckbox(ariaLabel: 'c', appearance: 'auto', checked: true),
                ],
              ),
            ),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            oneUiGoldenCaptureFinder(),
            matchesGoldenFile('goldens/surface/checkbox_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
