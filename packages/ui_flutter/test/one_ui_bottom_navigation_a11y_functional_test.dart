/// BottomNavigation accessibility + functional tests — parity with
/// `BottomNavigation.test.tsx`, RN `BottomNavigationItemA11y.test.ts`,
/// and `BottomNavigationA11y.test.ts`.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/engine/bottom_navigation_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_types.dart';

import 'bottom_navigation_test_harness.dart';

const _homeIconKey = Key('home-icon');
const _homeFilledKey = Key('home-filled-icon');

Widget _homeIcon() => const Icon(Icons.home, key: _homeIconKey);
Widget _homeFilledIcon() => const Icon(Icons.home_filled, key: _homeFilledKey);
Widget _searchIcon() => const Icon(Icons.search, key: Key('search-icon'));

void main() {
  group('RN parity — item accessibility helpers', () {
    test('maps aria-label to tab label with selected state', () {
      final a11y = resolveOneUiBottomNavItemSemantics(
        ariaLabel: 'Home tab',
        isActive: true,
        disabled: false,
      );
      expect(a11y.label, 'Home tab');
      expect(a11y.selected, isTrue);
    });

    test('falls back to visible label', () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(label: 'Search'),
        'Search',
      );
    });

    test('falls back to humanized value for icon-only tabs', () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(
            value: 'my-saved-favorites'),
        'My Saved Favorites',
      );
      expect(
        resolveOneUiBottomNavItemSemantics(
          value: 'settings',
          isActive: false,
          disabled: false,
        ).label,
        'Settings',
      );
    });

    test('returns empty label when no name source is provided', () {
      expect(resolveOneUiBottomNavItemAccessibilityLabel(), '');
    });

    test('prefers aria-label over label and value', () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(
          ariaLabel: 'Custom',
          label: 'Home',
          value: 'home',
        ),
        'Custom',
      );
    });

    test('reflects disabled state', () {
      final a11y = resolveOneUiBottomNavItemSemantics(
        label: 'Home',
        isActive: false,
        disabled: true,
      );
      expect(a11y.disabled, isTrue);
    });

    test('forwards accessibilityHint', () {
      final a11y = resolveOneUiBottomNavItemSemantics(
        label: 'Home',
        accessibilityHint: 'Go to home screen',
        isActive: false,
        disabled: false,
      );
      expect(a11y.hint, 'Go to home screen');
    });
  });

  group('RN parity — humanizeBottomNavigationValue', () {
    test('title-cases hyphenated and underscored values', () {
      expect(humanizeOneUiBottomNavigationValue('account-profile'),
          'Account Profile');
      expect(humanizeOneUiBottomNavigationValue('my_account'), 'My Account');
    });
  });

  group('RN parity — container accessibility helpers', () {
    test('exposes tablist label from aria-label', () {
      final a11y = resolveOneUiBottomNavigationSemantics(
        ariaLabel: 'Primary navigation',
      );
      expect(a11y.label, 'Primary navigation');
    });

    test('forwards accessibilityHint', () {
      final a11y = resolveOneUiBottomNavigationSemantics(
        ariaLabel: 'Primary navigation',
        accessibilityHint: 'Swipe between sections',
      );
      expect(a11y.hint, 'Swipe between sections');
    });

    test('prefers semanticsLabel over ariaLabel and accessibilityLabel', () {
      final a11y = resolveOneUiBottomNavigationSemantics(
        semanticsLabel: 'Screen reader nav',
        ariaLabel: 'Aria nav',
        accessibilityLabel: 'RN nav',
      );
      expect(a11y.label, 'Screen reader nav');
    });

    test('falls back to default label when no name source is provided', () {
      expect(
        resolveOneUiBottomNavigationSemantics().label,
        'Bottom navigation',
      );
    });

    test('prefers semanticsLabel over ariaLabel on items', () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(
          semanticsLabel: 'Screen reader tab',
          ariaLabel: 'Aria tab',
          label: 'Home',
        ),
        'Screen reader tab',
      );
    });

    test('prefers accessibilityLabel over visible label on items', () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(
          accessibilityLabel: 'RN tab',
          label: 'Home',
        ),
        'RN tab',
      );
    });
  });

  group('web parity — resolveBottomNavigationItemActive', () {
    test('explicit active wins inside navigation group', () {
      expect(
        resolveOneUiBottomNavItemActive(
          active: true,
          value: 'search',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isTrue,
      );
    });

    test('parent value applies when active is unset', () {
      expect(
        resolveOneUiBottomNavItemActive(
          value: 'home',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isTrue,
      );
      expect(
        resolveOneUiBottomNavItemActive(
          value: 'search',
          parentValue: 'home',
          inNavigationGroup: true,
        ),
        isFalse,
      );
    });
  });

  group('widget — navigation landmark + tabs', () {
    testWidgetsAllPlatforms('renders nav with semantics label', (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Primary'), findsOneWidget);
    });

    testWidgetsAllPlatforms(
        'ariaLabel resolves nav landmark when semanticsLabel empty', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: '',
            ariaLabel: 'Primary',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Primary'), findsOneWidget);
    });

    testWidgetsAllPlatforms('forwards container accessibilityHint to semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            accessibilityHint: 'Swipe between sections',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Primary'))
            .getSemanticsData();
        expect(data.hint, 'Swipe between sections');
      });
    });

    testWidgetsAllPlatforms('renders all children as button tabs',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                  value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(countBottomNavTabButtons(tester), 2);
        expect(bottomNavTabFinder('Home'), findsOneWidget);
        expect(bottomNavTabFinder('Search'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms('marks selected tab from defaultValue',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'search',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                  value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms(
        'explicit active wins over parent defaultValue (web)', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'home',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                value: 'search',
                icon: 'search',
                label: 'Search',
                active: true,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      // Web BottomNavigation.test.tsx — only asserts explicit `active` tab is current.
      expectBottomNavTabSelected(tester, 'Search', selected: true);
    });

    testWidgetsAllPlatforms(
        'explicit active applies when parent has no selection', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                value: 'search',
                icon: 'search',
                label: 'Search',
                active: true,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms('swaps activeIcon when active', (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'home',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: _homeIcon(),
                activeIcon: _homeFilledIcon(),
                label: 'Home',
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(_homeFilledKey), findsOneWidget);
      expect(find.byKey(_homeIconKey), findsNothing);
    });

    testWidgetsAllPlatforms('uses base icon when inactive', (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'search',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: _homeIcon(),
                activeIcon: _homeFilledIcon(),
                label: 'Home',
              ),
              OneUiBottomNavItem(
                value: 'search',
                icon: _searchIcon(),
                label: 'Search',
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(_homeIconKey), findsOneWidget);
      expect(find.byKey(_homeFilledKey), findsNothing);
    });

    testWidgetsAllPlatforms('updates active item on tap (uncontrolled)',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            defaultValue: 'home',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                  value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Search'));
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms(
        'BN-FN-002 controlled padded value selects and emits raw value', (
      tester,
    ) async {
      var value = ' home ';
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                value: value,
                onValueChange: (v) => setState(() => value = v),
                children: const [
                  OneUiBottomNavItem(
                    value: ' home ',
                    icon: 'home',
                    label: 'Home',
                  ),
                  OneUiBottomNavItem(
                    value: 'search',
                    icon: 'search',
                    label: 'Search',
                  ),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Home', selected: true);
      await tester.tap(find.bySemanticsLabel('Search'));
      await tester.pumpAndSettle();
      expect(value, 'search');
      expectBottomNavTabSelected(tester, 'Search', selected: true);
    });

    testWidgetsAllPlatforms(
        'BN-VIS-003 honours --BottomNavItem-labelFontSize override', (
      tester,
    ) async {
      late TextStyle labelStyle;
      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          '--Spacing-0': '0px',
          '--Spacing-1': '4px',
          '--Spacing-1-5': '6px',
          '--Spacing-4': '16px',
          '--Spacing-5': '20px',
          '--Spacing-6': '24px',
          '--Spacing-14': '56px',
          '--Spacing-16': '64px',
          '--Shape-2': '8px',
          '--BottomNavItem-labelFontSize': '29px',
        },
        'dimensionContexts': <dynamic>[],
        'activeDimensionKey': 'L:default',
      })!;
      final root = buildRootSurfaceContext(
        themeConfig: bottomNavigationTestThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      await tester.pumpWidget(
        OneUiScope(
          platformId: 'L',
          density: 'default',
          designSystem: ds,
          child: OneUiSurfaceScope(
            value: root,
            child: MaterialApp(
              home: Scaffold(
                body: Builder(
                  builder: (context) {
                    labelStyle = resolveBottomNavigationLayout(
                      context,
                      ds,
                      labelType: kOneUiBottomNavLabel1Line,
                    ).labelStyle;
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(labelStyle.fontSize, 29);
    });

    testWidgetsAllPlatforms(
        'BN-VIS-003 layout itemHeight grows with oversized label', (
      tester,
    ) async {
      late double itemHeight;
      final ds = NativeDesignSystemPayload.tryParse({
        'componentCustomProperties': {
          '--BottomNavItem-labelFontSize': '29px',
        },
        'dimensionContexts': <dynamic>[],
        'activeDimensionKey': 'S-360:default',
        'activeDimensionContext': {
          'platformId': 'S-360',
          'density': 'default',
          'dimensions': {
            '--Spacing-0': '0px',
            '--Spacing-1': '4px',
            '--Spacing-1-5': '6px',
            '--Spacing-4': '16px',
            '--Spacing-5': '20px',
            '--Spacing-6': '24px',
            '--Spacing-14': '56px',
            '--Spacing-16': '64px',
            '--Shape-2': '8px',
          },
        },
      })!;
      final root = buildRootSurfaceContext(
        themeConfig: bottomNavigationTestThemeConfig(),
        rootParentStep: 2500,
        darkMode: false,
      );
      await tester.pumpWidget(
        OneUiScope(
          platformId: 'S-360',
          density: 'default',
          designSystem: ds,
          child: OneUiSurfaceScope(
            value: root,
            child: MaterialApp(
              home: Scaffold(
                body: Builder(
                  builder: (context) {
                    itemHeight = resolveBottomNavigationLayout(
                      context,
                      ds,
                      labelType: kOneUiBottomNavLabel1Line,
                    ).itemHeight;
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(itemHeight, greaterThan(64));
    });

    testWidgetsAllPlatforms('invalid appearance encodes primary in payload', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            appearance: 'destructive',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.byKey(
          const ValueKey<String>(
            'oneui-bottom-nav|data-items=1|data-label-type=1line|data-appearance=primary',
          ),
        ),
        findsOneWidget,
      );
    });

    testWidgetsAllPlatforms('fires onValueChange in controlled mode',
        (tester) async {
      var value = 'home';
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                value: value,
                onValueChange: (v) => setState(() => value = v),
                children: const [
                  OneUiBottomNavItem(
                      value: 'home', icon: 'home', label: 'Home'),
                  OneUiBottomNavItem(
                      value: 'search', icon: 'search', label: 'Search'),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Search'));
      await tester.pumpAndSettle();
      expect(value, 'search');
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms(
        'controlled value stays until parent updates (React)', (tester) async {
      String? lastChange;
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            value: 'home',
            onValueChange: (v) => lastChange = v,
            children: const [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(
                  value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Search'));
      await tester.pumpAndSettle();
      expect(lastChange, 'search');
      expectBottomNavTabSelected(tester, 'Home', selected: true);
      expectBottomNavTabSelected(tester, 'Search', selected: false);
    });

    testWidgetsAllPlatforms('onClick fires before onValueChange',
        (tester) async {
      final order = <String>[];
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            onValueChange: (_) => order.add('change'),
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                onClick: () => order.add('click'),
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Home'));
      await tester.pumpAndSettle();
      expect(order, ['click', 'change']);
    });

    testWidgetsAllPlatforms('onTap and onPressed fire before onValueChange',
        (tester) async {
      final order = <String>[];
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            onValueChange: (_) => order.add('change'),
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                onTap: () => order.add('tap'),
                onPressed: () => order.add('press'),
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Home'));
      await tester.pumpAndSettle();
      expect(order, ['tap', 'press', 'change']);
    });

    testWidgetsAllPlatforms('href exposes link semantics when enabled',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                href: '/home',
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expectBottomNavTabLink(tester, 'Home', href: '/home');
    });

    testWidgetsAllPlatforms('disabled href omits link url', (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                href: '/home',
                disabled: true,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expectBottomNavTabLink(tester, 'Home', href: null);
      expectBottomNavTabDisabled(tester, 'Home');
    });

    testWidgetsAllPlatforms('accessibilityLabel resolves tab semantics',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                accessibilityLabel: 'Home tab',
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.bySemanticsLabel('Home tab'), findsOneWidget);
    });

    testWidgetsAllPlatforms('inherits parent labelType (2line)',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            labelType: kOneUiBottomNavLabel2Line,
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      final twoLineText = find.descendant(
        of: find.byType(OneUiBottomNavItem),
        matching: find.byWidgetPredicate(
          (widget) => widget is Text && widget.maxLines == 2,
        ),
      );
      expect(twoLineText, findsOneWidget);
    });

    testWidgetsAllPlatforms('item overrides parent labelType', (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            labelType: kOneUiBottomNavLabel1Line,
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                labelType: kOneUiBottomNavLabelNone,
                semanticsLabel: 'Home',
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Home'), findsNothing);
      expect(find.bySemanticsLabel('Home'), findsOneWidget);
    });

    testWidgetsAllPlatforms('omits divider when showDivider is false',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            showDivider: false,
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
          find.byKey(const Key('oneui-bottom-nav-top-divider')), findsNothing);
    });

    testWidgetsAllPlatforms('renders divider when showDivider is true',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            showDivider: true,
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('oneui-bottom-nav-top-divider')),
          findsOneWidget);
      expect(find.byType(OneUiDivider), findsOneWidget);
      final divider = tester.widget<OneUiDivider>(find.byType(OneUiDivider));
      expect(divider.size, kOneUiDividerSizeS);
    });

    testWidgetsAllPlatforms('disabled item does not fire onValueChange',
        (tester) async {
      String? changed;
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            onValueChange: (v) => changed = v,
            children: const [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                disabled: true,
              ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Home'));
      await tester.pumpAndSettle();
      expect(changed, isNull);
      expectBottomNavTabDisabled(tester, 'Home');
    });

    testWidgetsAllPlatforms('disabled item does not change selection',
        (tester) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
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
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Search'));
      await tester.pumpAndSettle();
      expectBottomNavTabSelected(tester, 'Home', selected: true);
      expectBottomNavTabDisabled(tester, 'Search');
    });

    testWidgetsAllPlatforms('Space activates focused tab (keyboard / web)',
        (tester) async {
      var value = 'home';
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          StatefulBuilder(
            builder: (context, setState) {
              return OneUiBottomNavigation(
                semanticsLabel: 'Primary',
                value: value,
                onValueChange: (v) => setState(() => value = v),
                children: const [
                  OneUiBottomNavItem(
                    value: 'home',
                    icon: 'home',
                    label: 'Home',
                  ),
                  OneUiBottomNavItem(
                    value: 'search',
                    icon: 'search',
                    label: 'Search',
                  ),
                ],
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Search'));
      await tester.pumpAndSettle();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(value, 'search');
      expectBottomNavTabSelected(tester, 'Search', selected: true);
    });

    testWidgetsAllPlatforms(
        'renders all items when more than five (web warning only)', (
      tester,
    ) async {
      await tester.pumpWidget(
        pumpBottomNavigationApp(
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              for (var i = 0; i < 6; i++)
                OneUiBottomNavItem(
                  value: 'tab-$i',
                  icon: 'home',
                  label: 'Tab $i',
                ),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        expect(countBottomNavTabButtons(tester), 6);
        expect(find.bySemanticsLabel('Tab 0'), findsOneWidget);
        expect(find.bySemanticsLabel('Tab 5'), findsOneWidget);
      });
    });
  });
}
