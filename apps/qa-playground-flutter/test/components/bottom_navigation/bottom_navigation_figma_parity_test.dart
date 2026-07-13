/// BottomNavigation ↔ Figma parity tests.
///
/// Validates the component implements the EXACT Figma API surface shown in the
/// design source:
///
///   BottomNav            items : 2 | 3 | 4 | 5
///                        label : 1Line | 2Line | none
///   BottomNav.Item       active: true | false
///                        type  : label1Line | label2Line | labelFalse
///
/// Each property value is exercised end-to-end against the rendered widget so
/// the parity claim reflects real behaviour, not a constant table.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';

import '../../support/components/bottom_navigation_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Figma API catalogue — the value sets must match the design source exactly
  // ===========================================================================

  group('[figma] BottomNav — API catalogue', () {
    test('[figma] items property accepts exactly {2,3,4,5}', () {
      expect(kOneUiBottomNavFigmaItemCounts, [2, 3, 4, 5]);
      expect(kOneUiBottomNavMinItems, 2);
      expect(kOneUiBottomNavMaxItems, 5);
    });

    test('[figma] label property has canonical {none,1line,2line}', () {
      expect(kOneUiBottomNavLabelTypes, [
        kOneUiBottomNavLabelNone,
        kOneUiBottomNavLabel1Line,
        kOneUiBottomNavLabel2Line,
      ]);
    });

    test('[figma] BottomNav.Item type has {label1Line,label2Line,labelFalse}', () {
      expect(kOneUiBottomNavFigmaItemTypes, [
        kOneUiBottomNavItemTypeLabel1Line,
        kOneUiBottomNavItemTypeLabel2Line,
        kOneUiBottomNavItemTypeLabelFalse,
      ]);
    });

    test('[figma] Figma label tokens (1Line/2Line) map to canonical values', () {
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavFigmaLabel1Line),
          kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavFigmaLabel2Line),
          kOneUiBottomNavLabel2Line);
    });

    test('[figma] item type tokens map to canonical label layout', () {
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavItemTypeLabel1Line),
          kOneUiBottomNavLabel1Line);
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavItemTypeLabel2Line),
          kOneUiBottomNavLabel2Line);
      expect(normalizeOneUiBottomNavLabelType(kOneUiBottomNavItemTypeLabelFalse),
          kOneUiBottomNavLabelNone);
    });
  });

  // ===========================================================================
  // items 2–5 render distinct, equal-weight tabs (Figma rows)
  // ===========================================================================

  group('[figma] BottomNav — items 2..5 render', () {
    for (final count in kOneUiBottomNavFigmaItemCounts) {
      testWidgetsAllPlatforms('[figma] items=$count renders $count equal tabs',
          (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              for (var i = 0; i < count; i++)
                OneUiBottomNavItem(
                  value: 'tab-$i',
                  icon: 'home',
                  label: 'Tab $i',
                  semanticsLabel: 'Tab $i',
                ),
            ],
          ),
        );
        expect(bottomNavItemCount(tester), count);
        final w0 = bottomNavItemWidth(tester, 0);
        for (var i = 1; i < count; i++) {
          expect((bottomNavItemWidth(tester, i) - w0).abs(), lessThan(0.5));
        }
      });
    }
  });

  // ===========================================================================
  // label 1Line / 2Line / none render the Figma layout
  // ===========================================================================

  group('[figma] BottomNav — label layouts', () {
    testWidgetsAllPlatforms('[figma] label=1Line → single-line text', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavFigmaLabel1Line,
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Label'),
          ],
        ),
      );
      expect(tester.widget<Text>(find.text('Label')).maxLines, 1);
    });

    testWidgetsAllPlatforms('[figma] label=2Line → label wraps to two lines',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavFigmaLabel2Line,
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Label can go into 2 lines if needed',
            ),
          ],
        ),
      );
      expect(
        tester.widget<Text>(find.textContaining('Label can go')).maxLines,
        2,
      );
    });

    testWidgetsAllPlatforms('[figma] label=none → icon only, larger glyph',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabelNone,
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Label'),
          ],
        ),
      );
      expect(find.text('Label'), findsNothing);
    });
  });

  // ===========================================================================
  // BottomNav.Item active true/false
  // ===========================================================================

  group('[figma] BottomNav.Item — active', () {
    testWidgetsAllPlatforms('[figma] active=true → selected + filled icon',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
              semanticsLabel: 'Home',
              active: true,
            ),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Home', selected: true);
      expect(find.byIcon(Icons.home), findsOneWidget,
          reason: 'active item shows the activeIcon (filled)');
    });

    testWidgetsAllPlatforms('[figma] active=false → not selected + base icon',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
              semanticsLabel: 'Home',
              active: false,
            ),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Home', selected: false);
      expect(find.byIcon(Icons.home_outlined), findsOneWidget,
          reason: 'inactive item shows the base (outlined) icon');
    });
  });

  // ===========================================================================
  // BottomNav.Item type label1Line / label2Line / labelFalse
  // ===========================================================================

  group('[figma] BottomNav.Item — type', () {
    testWidgetsAllPlatforms('[figma] type=label1Line', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Label',
              type: kOneUiBottomNavItemTypeLabel1Line,
            ),
          ],
        ),
      );
      expect(tester.widget<Text>(find.text('Label')).maxLines, 1);
    });

    testWidgetsAllPlatforms('[figma] type=label2Line', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Label can go into 2 lines',
              type: kOneUiBottomNavItemTypeLabel2Line,
            ),
          ],
        ),
      );
      expect(tester.widget<Text>(find.textContaining('Label can go')).maxLines, 2);
    });

    testWidgetsAllPlatforms('[figma] type=labelFalse → no label', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Label',
              type: kOneUiBottomNavItemTypeLabelFalse,
              semanticsLabel: 'Home',
            ),
          ],
        ),
      );
      expect(find.text('Label'), findsNothing);
    });
  });
}
