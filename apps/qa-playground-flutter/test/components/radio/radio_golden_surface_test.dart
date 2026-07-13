/// Radio visual-regression tests — INSIDE SURFACE.
///
/// Validates that `appearance: 'auto'` inherits the parent Surface context: the
/// unchecked stroke follows the surface's resolved appearance
/// (`resolveOneUiRadioUncheckedAppearance` → parent role), while the checked
/// fill stays on the secondary stack. Each baseline pairs an unchecked + checked
/// radio so the unchecked-appearance inheritance is visible.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

const _kSurfaceModes = <String>['subtle', 'bold'];
const _kSurfaceAppearances = <String>['primary', 'positive', 'negative'];

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  group('[golden][surface] Radio — appearance:auto inherits surface', () {
    for (final mode in _kSurfaceModes) {
      for (final app in _kSurfaceAppearances) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpRadioJioHarnessSettled(
            tester,
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OneUiRadioGroup(children: [
                  OneUiRadio(value: 'a', appearance: 'auto', ariaLabel: 'u'),
                ]),
                const SizedBox(height: 12),
                OneUiRadioGroup(defaultValue: 'a', children: [
                  OneUiRadio(value: 'a', appearance: 'auto', ariaLabel: 'c'),
                ]),
              ],
            ),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            find.byType(Column).first,
            matchesGoldenFile('goldens/surface/radio_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
