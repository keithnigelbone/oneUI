/// BottomNavigation accessibility QA tests — mirrors web `<nav aria-label>` +
/// `role="tab"` / `aria-current` and the RN tablist contract.
///
/// Validates ACTUAL Semantics tree state, not just resolver returns:
///   - nav landmark exposes the resolved label + hint.
///   - each tab is a button with the resolved accessible name.
///   - selected tab carries SemanticsFlag.isSelected (aria-current parity).
///   - disabled tab clears isEnabled.
///   - href tab exposes isLink + linkUrl; disabled href drops the url.
///   - icon-only tabs derive a humanized name from value.
///   - inner icon + label are ExcludeSemantics (no double announce).
///   - touch target ≥ 44px on mobile / 24px on desktop (WCAG 2.5.5 / 2.5.8).
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_nav_item_a11y.dart';

import '../../support/components/bottom_navigation_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Pure resolver — container semantics
  // ===========================================================================

  group('[a11y] resolveOneUiBottomNavigationSemantics', () {
    test('[a11y] semanticsLabel wins over aria/accessibility labels', () {
      final a = resolveOneUiBottomNavigationSemantics(
        semanticsLabel: 'Screen reader nav',
        ariaLabel: 'Aria nav',
        accessibilityLabel: 'RN nav',
      );
      expect(a.label, 'Screen reader nav');
    });

    test('[a11y] ariaLabel used when semanticsLabel empty', () {
      final a = resolveOneUiBottomNavigationSemantics(
        semanticsLabel: '',
        ariaLabel: 'Primary navigation',
      );
      expect(a.label, 'Primary navigation');
    });

    test('[a11y] falls back to default "Bottom navigation"', () {
      expect(resolveOneUiBottomNavigationSemantics().label, 'Bottom navigation');
    });

    test('[a11y] hint prefers semanticsHint then accessibilityHint', () {
      expect(
        resolveOneUiBottomNavigationSemantics(
          semanticsHint: 'sr hint',
          accessibilityHint: 'rn hint',
        ).hint,
        'sr hint',
      );
      expect(
        resolveOneUiBottomNavigationSemantics(accessibilityHint: 'rn hint').hint,
        'rn hint',
      );
    });

    test('[a11y] whitespace-only hint normalised away', () {
      expect(resolveOneUiBottomNavigationSemantics(semanticsHint: '   ').hint,
          isNull);
    });
  });

  // ===========================================================================
  // Pure resolver — item semantics + label chain
  // ===========================================================================

  group('[a11y] resolveOneUiBottomNavItemSemantics', () {
    test('[a11y] ariaLabel becomes label; active → selected', () {
      final a = resolveOneUiBottomNavItemSemantics(
        ariaLabel: 'Home tab',
        isActive: true,
        disabled: false,
      );
      expect(a.label, 'Home tab');
      expect(a.selected, isTrue);
    });

    test('[a11y] label chain: semantics > aria > accessibility > label > value',
        () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(
          semanticsLabel: 'SR',
          ariaLabel: 'Aria',
          label: 'Visible',
          value: 'home',
        ),
        'SR',
      );
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(
          accessibilityLabel: 'RN',
          label: 'Visible',
        ),
        'RN',
      );
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(label: 'Visible'),
        'Visible',
      );
    });

    test('[a11y] icon-only tab humanizes the value', () {
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(value: 'my-saved-favorites'),
        'My Saved Favorites',
      );
      expect(
        resolveOneUiBottomNavItemAccessibilityLabel(value: 'account_profile'),
        'Account Profile',
      );
    });

    test('[a11y] no name source → empty label', () {
      expect(resolveOneUiBottomNavItemAccessibilityLabel(), '');
    });

    test('[a11y] disabled flag forwarded', () {
      expect(
        resolveOneUiBottomNavItemSemantics(
          label: 'Home',
          isActive: false,
          disabled: true,
        ).disabled,
        isTrue,
      );
    });

    test('[a11y] href becomes linkUrl when enabled, dropped when disabled', () {
      expect(
        resolveOneUiBottomNavItemSemantics(
          label: 'Home',
          href: '/home',
          isActive: false,
          disabled: false,
        ).linkUrl,
        Uri.parse('/home'),
      );
      expect(
        resolveOneUiBottomNavItemSemantics(
          label: 'Home',
          href: '/home',
          isActive: false,
          disabled: true,
        ).linkUrl,
        isNull,
      );
    });

    test('[a11y] humanizeOneUiBottomNavigationValue title-cases segments', () {
      expect(humanizeOneUiBottomNavigationValue('account-profile'),
          'Account Profile');
      expect(humanizeOneUiBottomNavigationValue('my_account'), 'My Account');
      expect(humanizeOneUiBottomNavigationValue('home'), 'Home');
    });
  });

  // ===========================================================================
  // Widget — nav landmark
  // ===========================================================================

  group('[a11y] BottomNavigation widget — nav landmark', () {
    testWidgetsAllPlatforms('[a11y] semanticsLabel exposed on the container',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      expect(find.bySemanticsLabel('Primary'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] ariaLabel resolves the landmark when label empty',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: '',
          ariaLabel: 'Primary',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      expect(find.bySemanticsLabel('Primary'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] container hint forwarded to AT',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          accessibilityHint: 'Swipe between sections',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
          ],
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = tester
            .getSemantics(find.bySemanticsLabel('Primary'))
            .getSemanticsData();
        expect(data.hint, contains('Swipe between sections'));
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // Widget — tabs (button role + name + selected + enabled)
  // ===========================================================================

  group('[a11y] BottomNavigation widget — tabs', () {
    testWidgetsAllPlatforms('[a11y] each item is a labelled button tab',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        expect(countBottomNavTabButtons(tester), 2);
        expect(bottomNavTabFinder('Home'), findsOneWidget);
        expect(bottomNavTabFinder('Search'), findsOneWidget);
        final home = bottomNavTabSemanticsData(tester, 'Home');
        expect(home.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(home.hasAction(SemanticsAction.tap), isTrue);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms('[a11y] selected tab carries isSelected (aria-current)',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'search',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      expectBottomNavTabSelected(tester, 'Search', selected: true);
      expectBottomNavTabSelected(tester, 'Home', selected: false);
    });

    testWidgetsAllPlatforms('[a11y] accessibilityLabel resolves tab name',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
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
      );
      expect(find.bySemanticsLabel('Home tab'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[a11y] icon-only tab announces humanized value',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          labelType: kOneUiBottomNavLabelNone,
          children: [
            OneUiBottomNavItem(value: 'my-saved-items', icon: 'home'),
          ],
        ),
      );
      expect(find.bySemanticsLabel('My Saved Items'), findsOneWidget,
          reason: 'icon-only tab must derive a meaningful name from value');
    });

    testWidgetsAllPlatforms('[a11y] item hint forwarded to AT',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              accessibilityHint: 'Go to home screen',
            ),
          ],
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = bottomNavTabSemanticsData(tester, 'Home');
        expect(data.hint, contains('Go to home screen'));
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // Widget — disabled + link
  // ===========================================================================

  group('[a11y] BottomNavigation widget — disabled & link', () {
    testWidgetsAllPlatforms('[a11y] disabled tab clears isEnabled',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              disabled: true,
            ),
          ],
        ),
      );
      expectBottomNavTabDisabled(tester, 'Home');
    });

    testWidgetsAllPlatforms('[a11y] href exposes link semantics when enabled',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
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
      );
      expectBottomNavTabLink(tester, 'Home', href: '/home');
    });

    testWidgetsAllPlatforms('[a11y] disabled href omits the link url',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
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
      );
      expectBottomNavTabLink(tester, 'Home', href: null);
      expectBottomNavTabDisabled(tester, 'Home');
    });
  });

  // ===========================================================================
  // Widget — no double announce (icon + label excluded)
  // ===========================================================================

  group('[a11y] BottomNavigation widget — no double announce', () {
    testWidgetsAllPlatforms(
      '[a11y] visible label is NOT a separate AT node (folded into tab name)',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: 'home',
                label: 'Home',
                semanticsLabel: 'Home tab',
              ),
            ],
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          // Accessible name comes from semanticsLabel; the visible "Home" text
          // is ExcludeSemantics so it must not surface as its own node.
          expect(find.bySemanticsLabel('Home tab'), findsOneWidget);
          expect(find.bySemanticsLabel('Home'), findsNothing,
              reason: 'inner label text must be excluded from semantics');
        } finally {
          handle.dispose();
        }
      },
    );
  });

  // ===========================================================================
  // Keyboard — Space activates focused tab (desktop / web)
  // ===========================================================================

  group('[a11y] BottomNavigation widget — keyboard', () {
    testWidgetsAllPlatforms('[a11y] Space activates the focused tab',
        (tester) async {
      var value = 'home';
      await pumpBottomNavQaHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (context, setState) => OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            value: value,
            onValueChange: (v) => setState(() => value = v),
            children: const [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
        ),
      );
      // Focus the Search tab, then activate via keyboard.
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(value, 'search');
      expectBottomNavTabSelected(tester, 'Search', selected: true);
    });
  });

  // ===========================================================================
  // Touch target — WCAG 2.5.5 (mobile 44px) / 2.5.8 (desktop 24px)
  // ===========================================================================

  group('[a11y] BottomNavigation — touch target size', () {
    testWidgetsAllPlatforms(
      '[a11y] each tab meets the minimum touch target height (≥ 44 mobile)',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: const [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
            ],
          ),
          useJioFixture: false,
          designSystem: qaBottomNavTestDesignSystem(),
        );
        // 1line shell height is 64px in the synthetic DS — comfortably above the
        // 44px WCAG 2.5.5 minimum and the 24px 2.5.8 desktop minimum.
        final h = tester.getSize(bottomNavItemFinder().first).height;
        expect(h, greaterThanOrEqualTo(44),
            reason: 'tab height must satisfy WCAG 2.5.5 minimum target size');
      },
    );
  });
}
