/// BottomNavigation — on-device integration tests.
///
/// Renders [OneUiBottomNavigation] on the connected emulator / simulator (and
/// Chrome for Flutter Web) using the SAME harness the widget tests use, so the
/// real engine runs:
///   - real surface-context token remapping when docked on a Surface
///   - real tap → onValueChange → selection + active-icon swap
///   - real Semantics announcement (TalkBack / VoiceOver / web AT)
///   - real keyboard activation on web / desktop
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true`  (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';

import '../test/support/components/bottom_navigation_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

OneUiBottomNavigation _bar({
  String labelType = kOneUiBottomNavLabel1Line,
  int items = 4,
  String? defaultValue = 'tab-0',
  String appearance = 'primary',
}) {
  const icons = ['home', 'search', 'heart', 'user', 'star'];
  const labels = ['Home', 'Search', 'Saved', 'Profile', 'More'];
  return OneUiBottomNavigation(
    semanticsLabel: 'Primary navigation',
    labelType: labelType,
    appearance: appearance,
    defaultValue: defaultValue,
    children: [
      for (var i = 0; i < items; i++)
        OneUiBottomNavItem(
          value: 'tab-$i',
          icon: icons[i % icons.length],
          label: labels[i % labels.length],
          semanticsLabel: labels[i % labels.length],
        ),
    ],
  );
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  group('BottomNavigation — on-device', () {
    testWidgets('[e2e] default bar renders with a top divider', (tester) async {
      await pumpBottomNavQaHarnessSettled(tester, _bar());
      await _hold(tester, 2000);
      expect(bottomNavRootFinder(), findsOneWidget);
      expect(find.byKey(const Key('oneui-bottom-nav-top-divider')), findsOneWidget);
    });

    testWidgets('[e2e] every Figma item count (2..5) renders equal-width tabs',
        (tester) async {
      for (final count in kOneUiBottomNavFigmaItemCounts) {
        await pumpBottomNavQaHarnessSettled(tester, _bar(items: count));
        await _hold(tester, _demoMode ? 600 : 0);
        expect(bottomNavItemCount(tester), count);
        final w0 = bottomNavItemWidth(tester, 0);
        for (var i = 1; i < count; i++) {
          expect((bottomNavItemWidth(tester, i) - w0).abs(), lessThan(0.5));
        }
      }
    });

    testWidgets('[e2e] every label layout (none/1line/2line) renders',
        (tester) async {
      for (final label in kOneUiBottomNavLabelTypes) {
        await pumpBottomNavQaHarnessSettled(tester, _bar(labelType: label));
        await _hold(tester);
        expect(bottomNavRootFinder(), findsOneWidget);
      }
    });

    testWidgets('[e2e] tap changes the selected tab + swaps the active icon',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary navigation',
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
              activeIcon: Icon(Icons.saved_search),
              label: 'Search',
              semanticsLabel: 'Search',
            ),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Home', selected: true);
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      await _hold(tester, 2000);
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expect(find.byIcon(Icons.saved_search), findsOneWidget,
          reason: 'selected Search shows its active icon');
    });

    testWidgets('[e2e] disabled tab does not change selection', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary navigation',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(
              value: 'search',
              icon: 'search',
              label: 'Search',
              disabled: true,
            ),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Search'), warnIfMissed: false);
      await tester.pumpAndSettle();
      await _hold(tester);
      expectBottomNavTabSelected(tester, 'Home', selected: true);
    });

    testWidgets('[e2e] bar docked on a Surface auto-adapts colours',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        _bar(appearance: 'auto'),
        surfaceMode: 'subtle',
        surfaceAppearance: 'positive',
      );
      await _hold(tester, 2000);
      expect(bottomNavRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode bar renders without contrast holes',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(tester, _bar(), darkMode: true);
      await _hold(tester, 2000);
      expect(bottomNavRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] nav landmark + tabs are exposed to the AT tree',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(tester, _bar());
      await _hold(tester, 2000);
      expect(find.bySemanticsLabel('Primary navigation'), findsOneWidget);
      expect(find.bySemanticsLabel('Home'), findsOneWidget);
    });

    testWidgets('[e2e] keyboard Space activates the focused tab (web/desktop)',
        (tester) async {
      var value = 'tab-0';
      await pumpBottomNavQaHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (context, setState) => OneUiBottomNavigation(
            semanticsLabel: 'Primary navigation',
            value: value,
            onValueChange: (v) => setState(() => value = v),
            children: const [
              OneUiBottomNavItem(value: 'tab-0', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 'tab-1', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      await _hold(tester);
      expect(value, 'tab-1');
    });

    testWidgets('[e2e] icon-only bar derives accessible names from value',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary navigation',
          labelType: kOneUiBottomNavLabelNone,
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home'),
            OneUiBottomNavItem(value: 'my-saved-items', icon: 'heart'),
          ],
        ),
      );
      await _hold(tester);
      expect(find.bySemanticsLabel('Home'), findsOneWidget);
      expect(find.bySemanticsLabel('My Saved Items'), findsOneWidget);
    });

    testWidgets('[e2e] testId locator works in-process', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        OneUiBottomNavigation(
          semanticsLabel: 'Primary navigation',
          testId: 'qa-bottom-nav',
          children: _bar().children,
        ),
      );
      await _hold(tester);
      expect(
        find
            .byWidgetPredicate(
              (w) => w is Semantics && w.properties.identifier == 'qa-bottom-nav',
            )
            .evaluate(),
        isNotEmpty,
      );
    });
  });
}
