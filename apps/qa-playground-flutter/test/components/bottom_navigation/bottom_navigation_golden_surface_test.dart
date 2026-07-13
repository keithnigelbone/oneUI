/// BottomNavigation visual-regression tests — INSIDE A SURFACE.
///
/// Bottom navigation is frequently docked on a tinted / branded surface. This
/// validates the divider stroke flips to the Primary role (Divider.module.css
/// inside `[data-surface]`) and item colours remap against the parent step,
/// rather than the page-level defaults.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';

import '../../support/components/bottom_navigation_harness.dart';

const _kIcons = ['home', 'search', 'heart', 'user'];
const _kLabels = ['Home', 'Search', 'Saved', 'Profile'];

OneUiBottomNavigation _bar() => OneUiBottomNavigation(
      semanticsLabel: 'Primary',
      labelType: kOneUiBottomNavLabel1Line,
      appearance: 'auto',
      defaultValue: 'tab-0',
      children: [
        for (var i = 0; i < 4; i++)
          OneUiBottomNavItem(
            value: 'tab-$i',
            icon: _kIcons[i],
            label: _kLabels[i],
            semanticsLabel: _kLabels[i],
          ),
      ],
    );

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][surface] BottomNavigation — appearance:auto inherits surface',
      () {
    for (final mode in const ['subtle', 'bold']) {
      for (final app in const ['primary', 'positive', 'negative']) {
        testWidgets('mode=$mode / appearance=$app', (tester) async {
          await pumpBottomNavQaHarnessSettled(
            tester,
            _bar(),
            surfaceMode: mode,
            surfaceAppearance: app,
          );
          await expectLater(
            bottomNavRootFinder(),
            matchesGoldenFile('goldens/surface/bottom_nav_surface_${mode}_$app.png'),
          );
        });
      }
    }
  });
}
