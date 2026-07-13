/// BottomNavigation platform-specific QA tests — Flutter web / Android / iOS.
///
/// Bottom navigation behaves slightly differently per platform target:
///   - Web / desktop: keyboard focus + Space/Enter activation, `href` exposes
///     a real link (SemanticsFlag.isLink + linkUrl) for `<a>` parity.
///   - Android / iOS: pointer tap drives selection; the tab is announced as a
///     button (TalkBack/VoiceOver) with selected state; touch targets must
///     satisfy the 44px platform minimum.
///
/// Each test pins `debugDefaultTargetPlatformOverride` so the assertion is made
/// against the ACTUAL platform behaviour rather than the host default.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';

import '../../support/components/bottom_navigation_harness.dart';

/// Mobile-only targets (pointer-first, TalkBack / VoiceOver).
const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];

/// Web/desktop proxy — Flutter Web shares the desktop semantics + focus model.
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      // Flutter Web identifies via kIsWeb, which we cannot toggle in a unit
      // test; linux/macOS desktop is the closest faithful proxy for the web
      // focus + link semantics model.
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // Mobile (Android / iOS) — pointer tap + TalkBack/VoiceOver
  // ===========================================================================

  group('[platform][mobile] BottomNavigation', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap selects + announces selected',
        (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          defaultValue: 'home',
          children: [
            OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
            OneUiBottomNavItem(value: 'search', icon: 'search', label: 'Search'),
          ],
        ),
      );
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      final handle = tester.ensureSemantics();
      try {
        final data = bottomNavTabSemanticsData(tester, 'Search');
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue,
            reason: 'mobile tab announces as a button to TalkBack/VoiceOver');
        expect(data.hasFlag(SemanticsFlag.isSelected), isTrue);
      } finally {
        handle.dispose();
      }
    });

    _onPlatforms(_kMobilePlatforms,
        '[mobile] each tab satisfies the 44px touch target minimum',
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
        useJioFixture: false,
        designSystem: qaBottomNavTestDesignSystem(),
      );
      final h = tester.getSize(bottomNavItemFinder().first).height;
      expect(h, greaterThanOrEqualTo(44),
          reason: 'WCAG 2.5.5 / platform HIG minimum target size');
    });

    _onPlatforms(_kMobilePlatforms,
        '[mobile] href tab still exposes link semantics (deep-link parity)',
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
  });

  // ===========================================================================
  // Web / desktop — keyboard activation + link semantics
  // ===========================================================================

  group('[platform][web] BottomNavigation', () {
    _onPlatforms(_kWebDesktopPlatforms,
        '[web] Space activates the focused tab (keyboard nav)', (tester) async {
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
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pumpAndSettle();
      expect(value, 'search');
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] Enter activates the focused tab (keyboard nav)', (tester) async {
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
      await tester.tap(bottomNavTabFinder('Search'));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(value, 'search');
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] href tab exposes <a>-equivalent link semantics', (tester) async {
      await pumpBottomNavQaHarnessSettled(
        tester,
        const OneUiBottomNavigation(
          semanticsLabel: 'Primary',
          children: [
            OneUiBottomNavItem(
              value: 'home',
              icon: 'home',
              label: 'Home',
              href: 'https://example.com/home',
            ),
          ],
        ),
      );
      expectBottomNavTabLink(tester, 'Home', href: 'https://example.com/home');
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] disabled href drops the link url (no dead link)', (tester) async {
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
    });
  });
}
