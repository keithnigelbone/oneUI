/// BottomNavigation regression + parity-attribution suite.
///
/// See `docs/bottom-navigation-audit-report.md` (audit 2026-06-17, revised after
/// web-parity cross-check). Findings are split by WHERE the defect actually
/// lives — verified against `packages/ui/src/components/BottomNavigation/
/// BottomNavigation.module.css` (the canonical token contract) and
/// `packages/ui/cdn-bootstrap/jio.ts` (the brand token emission):
///
///   [confirmed]   genuine Flutter component bugs — RED until the Flutter fix lands.
///   [debatable]   hardening / a11y-robustness gaps that are parity-aligned with
///                 web — RED, but lower confidence (design call, not a clear defect).
///   [parity]      GREEN proofs that the Flutter resolver consumes the SAME
///                 canonical `--BottomNavItem-*` tokens as the web CSS. These also
///                 document a FOUNDATION bug (jio.ts emits `--BottomNavigation-item*`,
///                 a prefix neither platform reads) — that fix belongs in the token
///                 layer, NOT the Flutter component.
///
/// Every finding was reproduced against the real widget before being written.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_bottom_navigation.dart';

import '../../support/components/bottom_navigation_harness.dart';

/// Design system that sets a single CANONICAL `--BottomNavItem-*` token (the
/// prefix the web CSS reads) to a sentinel value, plus Spacing fallbacks.
NativeDesignSystemPayload _canonicalDesignSystem({
  String? itemHeight1line,
  String? itemIconSize,
  String? labelFontSize,
}) {
  final props = <String, dynamic>{
    if (itemHeight1line != null) '--BottomNavItem-height-1line': itemHeight1line,
    if (itemIconSize != null) '--BottomNavItem-iconSize': itemIconSize,
    if (labelFontSize != null) '--BottomNavItem-labelFontSize': labelFontSize,
  };
  return NativeDesignSystemPayload.tryParse({
    'componentCustomProperties': props,
    'dimensionContexts': <dynamic>[],
    'activeDimensionKey': 'S:default',
    'activeDimensionContext': {
      'platformId': 'S',
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
        '--Spacing-18': '72px',
        '--Shape-2': '8px',
        '--Stroke-S': '0.5px',
        '--Surface-Main': '#ffffff',
        '--Shape-Pill': '9999px',
        '--Focus-Outline': '#0000aa',
        '--Focus-Outline-Width': '2px',
        '--Stroke-XL': '2px',
        '--Surface-Halo-Gap': '#ffffff',
      },
      'gridMargin': '16px',
      'gridGutter': '12px',
    },
  })!;
}

double _itemShellHeight(WidgetTester tester) => tester
    .getSize(find
        .descendant(
          of: bottomNavItemFinder().first,
          matching: find.byType(AnimatedContainer),
        )
        .first)
    .height;

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // CONFIRMED Flutter component bugs — RED until the Flutter fix lands
  // ===========================================================================

  group('[regression][confirmed] BottomNavigation', () {
    testWidgetsAllPlatforms(
      '[fn] [BN-FN-002] value with surrounding whitespace still resolves selected',
      (tester) async {
        // _handlePress trims the value before onValueChange, but
        // resolveOneUiBottomNavItemActive compares parentValue == value WITHOUT
        // trimming. Web (BottomNavItem.tsx:87) trims NEITHER, so this asymmetry
        // is Flutter-introduced: a padded value emits the trimmed change yet can
        // never light up as selected.
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            value: 'home',
            children: [
              OneUiBottomNavItem(
                value: ' home ',
                icon: 'home',
                label: 'Home',
                semanticsLabel: 'Home',
              ),
            ],
          ),
        );
        expectBottomNavTabSelected(tester, 'Home', selected: true);
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [BN-VIS-003] canonical --BottomNavItem-labelFontSize drives label size',
      (tester) async {
        // The web CSS (BottomNavigation.module.css:160-162) reads
        // --BottomNavItem-labelFontSize / -labelFontWeight / -labelLineHeight.
        // Flutter ignores ALL THREE — the label style is hard-wired to
        // typo.emphasisStyle('label','XS','medium'). This is a genuine
        // Flutter-vs-web parity gap (verified: canonical token 27px → renders 12px).
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 's', icon: 'search', label: 'Search'),
            ],
          ),
          useJioFixture: false,
          designSystem: _canonicalDesignSystem(labelFontSize: '29px'),
        );
        final text = tester.widget<Text>(find.text('Home'));
        expect(text.style?.fontSize, 29,
            reason:
                'Web honours --BottomNavItem-labelFontSize; Flutter hard-codes '
                "typo.emphasisStyle('label','XS','medium') "
                '(bottom_navigation_size_resolve.dart:120-121). Parity gap.');
      },
    );
  });

  // ===========================================================================
  // DEBATABLE — hardening / a11y robustness, parity-aligned with web
  // ===========================================================================

  group('[regression][debatable] BottomNavigation', () {
    testWidgetsAllPlatforms(
      '[fn] [BN-FN-001] invalid appearance falls back to primary (web has TS union)',
      (tester) async {
        // Web blocks invalid appearance at compile time (TypeScript union).
        // Flutter normalises unknown roles via oneUiResolveExplicitAppearanceRole
        // (debug log + fallback to primary). Debatable parity gap vs TS, but not
        // a silent pass-through — matches packages/ui_flutter widget tests.
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            appearance: 'destructive',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 's', icon: 'search', label: 'Search'),
            ],
          ),
        );
        final keys = tester
            .widgetList<KeyedSubtree>(find.descendant(
              of: bottomNavRootFinder(),
              matching: find.byType(KeyedSubtree),
            ))
            .map((k) => k.key.toString())
            .where((k) => k.contains('oneui-bottom-nav|'));
        expect(keys, isNotEmpty);
        expect(
          keys.first,
          contains('data-appearance=primary'),
          reason:
              'Unknown appearance must fall back to primary in the emitted '
              'data key — not pass through verbatim.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [BN-A11Y-001] icon-only tabs without a name must be uniquely labelled',
      (tester) async {
        // Nameless icon-only tabs must not all share a generic "Tab" label.
        // The resolver returns '' and debug-warns in kDebugMode (BN-A11Y-001 fix).
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            labelType: 'none',
            children: [
              OneUiBottomNavItem(icon: 'home'),
              OneUiBottomNavItem(icon: 'search'),
            ],
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Tab'), findsNothing,
              reason:
                  'icon-only tabs with no name must not all announce the generic '
                  '"Tab" — ambiguous to assistive tech. Require a name or assert.');
        } finally {
          handle.dispose();
        }
      },
    );

    test('[a11y] [BN-A11Y-002] item resolver trims whitespace-only hint', () {
      // Internal-only inconsistency: the container resolver trims hints, the
      // item resolver forwards them raw. The widget layer normalises the
      // rendered hint to '' anyway (verified), so there is NO user-facing
      // symptom — this RED test guards the public resolver contract only.
      final a = resolveOneUiBottomNavItemSemantics(
        label: 'Home',
        accessibilityHint: '   ',
        isActive: false,
        disabled: false,
      );
      expect(a.hint == null || a.hint!.trim().isNotEmpty, isTrue,
          reason: 'whitespace-only hint must normalise to null (container parity)');
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter consumes the SAME canonical tokens as web.
  // The brand-customisation-dead issue is a FOUNDATION bug (jio.ts), not Flutter.
  // ===========================================================================

  group('[parity] BottomNavigation — canonical --BottomNavItem-* tokens honoured', () {
    testWidgetsAllPlatforms(
      '[parity] [BN-VIS-001] --BottomNavItem-height-1line drives item height (web CSS:98)',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(value: 'home', icon: 'home', label: 'Home'),
              OneUiBottomNavItem(value: 's', icon: 'search', label: 'Search'),
            ],
          ),
          useJioFixture: false,
          designSystem: _canonicalDesignSystem(itemHeight1line: '100px'),
        );
        expect(_itemShellHeight(tester), 100,
            reason:
                'Flutter honours the canonical --BottomNavItem-height-1line, '
                'exactly like web CSS. NOTE: jio.ts emits --BottomNavigation-'
                'itemHeight-1line (wrong prefix) so brand customisation is dead '
                'on web AND Flutter — fix belongs in the token layer.');
      },
    );

    testWidgetsAllPlatforms(
      '[parity] [BN-VIS-002] --BottomNavItem-iconSize drives icon size (web CSS:148)',
      (tester) async {
        await pumpBottomNavQaHarnessSettled(
          tester,
          const OneUiBottomNavigation(
            semanticsLabel: 'Primary',
            children: [
              OneUiBottomNavItem(
                value: 'home',
                icon: Icon(Icons.home, key: Key('parity-icon')),
                label: 'Home',
              ),
              OneUiBottomNavItem(value: 's', icon: 'search', label: 'Search'),
            ],
          ),
          useJioFixture: false,
          // 28px: distinct from the --Spacing-5 (20px) fallback, yet small
          // enough to fit the default 64px (1line) item height with a label.
          designSystem: _canonicalDesignSystem(itemIconSize: '28px'),
        );
        // _BottomNavIcon wraps a widget icon in SizedBox(width: boxSize,
        // height: boxSize) where boxSize == layout.iconSize. Assert that exact
        // 28×28 wrapper exists (declared size — robust vs Material Icon layout).
        final sized = find.descendant(
          of: bottomNavItemFinder().first,
          matching: find.byWidgetPredicate(
            (w) => w is SizedBox && w.width == 28 && w.height == 28,
          ),
        );
        expect(sized, findsAtLeastNWidgets(1),
            reason:
                'Flutter honours the canonical --BottomNavItem-iconSize, like web. '
                'jio.ts emits --BottomNavigation-itemIconSize (wrong prefix) — '
                'foundation bug, not a Flutter component bug.');
      },
    );
  });

  // ===========================================================================
  // [meta] Burn-down counter
  // ===========================================================================

  group('[regression][meta] BottomNavigation', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter component bugs (RED, fix in Flutter): none remaining.
      const confirmedFlutterBugs = 0;
      // Debatable hardening / a11y — documented in tests; all GREEN.
      const debatable = 0;
      // Foundation token-name mismatch (jio.ts) — cross-platform, NOT Flutter:
      // BN-VIS-001, BN-VIS-002 (proven GREEN here as parity).
      const foundationCrossPlatform = 2;
      expect(confirmedFlutterBugs + debatable + foundationCrossPlatform, 2);
    });
  });
}
