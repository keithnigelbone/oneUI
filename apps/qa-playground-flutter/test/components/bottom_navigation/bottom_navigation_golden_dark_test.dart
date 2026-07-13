/// BottomNavigation visual-regression tests — DARK MODE.
///
/// The bar must keep readable contrast on a dark page: active accent + label
/// stay legible, inactive icons dim correctly, divider does not vanish.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';

import '../../support/components/bottom_navigation_harness.dart';

const _kIcons = ['home', 'search', 'heart', 'user', 'star'];
const _kLabels = ['Home', 'Search', 'Saved', 'Profile', 'More'];

OneUiBottomNavigation _bar({
  required int items,
  required String labelType,
  String appearance = 'primary',
}) {
  return OneUiBottomNavigation(
    semanticsLabel: 'Primary',
    labelType: labelType,
    appearance: appearance,
    defaultValue: 'tab-0',
    children: [
      for (var i = 0; i < items; i++)
        OneUiBottomNavItem(
          value: 'tab-$i',
          icon: _kIcons[i % _kIcons.length],
          label: _kLabels[i % _kLabels.length],
          semanticsLabel: _kLabels[i % _kLabels.length],
        ),
    ],
  );
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('[golden][dark] BottomNavigation — label sweep (4 items)', () {
    for (final label in kOneUiBottomNavLabelTypes) {
      testWidgets('label=$label (dark)', (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          _bar(items: 4, labelType: label),
          darkMode: true,
        );
        await expectLater(
          bottomNavRootFinder(),
          matchesGoldenFile('goldens/dark/bottom_nav_dark_4items_$label.png'),
        );
      });
    }
  });

  group('[golden][dark] BottomNavigation — appearance sweep (4 items / 1line)', () {
    for (final app in const ['primary', 'secondary', 'positive', 'negative']) {
      testWidgets('appearance=$app (dark)', (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          _bar(items: 4, labelType: kOneUiBottomNavLabel1Line, appearance: app),
          darkMode: true,
        );
        await expectLater(
          bottomNavRootFinder(),
          matchesGoldenFile('goldens/dark/bottom_nav_dark_appearance_$app.png'),
        );
      });
    }
  });
}
