/// BottomNavigation visual-regression tests — captures golden PNGs across the
/// Figma matrix: items {2,3,4,5} × label {none,1line,2line}, plus appearance
/// sweep, active-icon swap and disabled state. Light mode / Jio fixture.
library;

import 'package:flutter/material.dart';
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
  String selected = 'tab-0',
}) {
  return OneUiBottomNavigation(
    semanticsLabel: 'Primary',
    labelType: labelType,
    appearance: appearance,
    defaultValue: selected,
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

  // items × labelType matrix — 12 baselines
  group('[golden] BottomNavigation — items × label matrix', () {
    for (final count in kOneUiBottomNavFigmaItemCounts) {
      for (final label in kOneUiBottomNavLabelTypes) {
        testWidgets('items=$count / label=$label', (tester) async {
          await pumpBottomNavQaHarnessSettled(
            tester,
            _bar(items: count, labelType: label),
          );
          await expectLater(
            bottomNavRootFinder(),
            matchesGoldenFile('goldens/bottom_nav_${count}items_$label.png'),
          );
        });
      }
    }
  });

  // appearance sweep (items=4 / 1line) — selected tab shows the accent colour
  group('[golden] BottomNavigation — appearance sweep (4 items / 1line)', () {
    for (final app in const [
      'primary',
      'secondary',
      'neutral',
      'sparkle',
      'positive',
      'negative',
      'warning',
      'informative',
    ]) {
      testWidgets('appearance=$app', (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          _bar(items: 4, labelType: kOneUiBottomNavLabel1Line, appearance: app),
        );
        await expectLater(
          bottomNavRootFinder(),
          matchesGoldenFile('goldens/bottom_nav_appearance_$app.png'),
        );
      });
    }
  });

  // active-icon swap — selected tab uses the filled glyph
  group('[golden] BottomNavigation — active icon swap', () {
    testWidgets('home active (filled) vs search inactive', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
              semanticsLabel: 'Home',
            ),
            OneUiBottomNavItem(
              value: 'search',
              icon: Icon(Icons.search),
              label: 'Search',
              semanticsLabel: 'Search',
            ),
          ],
        ),
      );
      await expectLater(
        bottomNavRootFinder(),
        matchesGoldenFile('goldens/bottom_nav_active_icon_swap.png'),
      );
    });
  });

  // disabled item
  group('[golden] BottomNavigation — disabled item', () {
    testWidgets('one disabled tab (dimmed)', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
              value: 'search',
              icon: 'search',
              label: 'Search',
              disabled: true,
            ),
            OneUiBottomNavItem(value: 'saved', icon: 'heart', label: 'Saved'),
          ],
        ),
      );
      await expectLater(
        bottomNavRootFinder(),
        matchesGoldenFile('goldens/bottom_nav_disabled_item.png'),
      );
    });
  });

  // no divider
  group('[golden] BottomNavigation — divider toggle', () {
    testWidgets('showDivider=false', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          showDivider: false,
          defaultValue: 'tab-0',
          children: [
            for (var i = 0; i < 3; i++)
              OneUiBottomNavItem(
                value: 'tab-$i',
                icon: _kIcons[i],
                label: _kLabels[i],
                semanticsLabel: _kLabels[i],
              ),
          ],
        ),
      );
      await expectLater(
        bottomNavRootFinder(),
        matchesGoldenFile('goldens/bottom_nav_no_divider.png'),
      );
    });
  });
}
