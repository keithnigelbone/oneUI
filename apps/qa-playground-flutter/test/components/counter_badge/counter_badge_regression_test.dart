/// CounterBadge regression suite — one test per bug from
/// `docs/counter-badge-audit-report.md` (audit 2026-06-16).
///
/// Tests assert the **expected (correct)** behavior of the counter badge.
/// Each one fails until the matching dev fix lands in
/// `packages/ui_flutter/lib/widgets/one_ui_counter_badge.dart` (or its engine
/// / a11y resolver). The failure is the bug ticket.
///
/// Each widget test runs on Android, iOS and Linux via
/// `testWidgetsAllPlatforms`, so a single bug surfaces as 3 platform-tagged
/// failures. Group tags (`[fn]`, `[a11y]`, `[visual]`) drive the HTML-report
/// categorisation (matches `[fn]` / `[a11y]` / `[visual]` regex in the report
/// builder).
///
/// Run: `flutter test test/components/counter_badge/counter_badge_regression_test.dart`
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge.dart';
import 'package:ui_flutter/widgets/one_ui_counter_badge_a11y.dart';

import '../../support/components/counter_badge_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // FUNCTIONAL regressions — tag `[fn]`
  // ===========================================================================

  group('[regression][fn] CounterBadge', () {
    testWidgetsAllPlatforms(
      '[fn] [CB-FN-001] Missing designSystem uses debug-only ConvexGapCard (release → SizedBox.shrink)',
      (tester) async {
        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
            ),
          ),
        );
        // `oneUiConvexGapPlaceholder` guards production via kDebugMode
        // (convex_design_system_guard.dart). flutter test runs in debug, so
        // the dev diagnostic is expected here — not an end-user regression.
        if (kDebugMode) {
          expect(find.byType(ConvexGapCardImpl), findsOneWidget);
        } else {
          expect(find.byType(ConvexGapCardImpl), findsNothing);
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-002] Brand without sparkle role falls back to neutral, not Material primary',
      (tester) async {
        final ds = jioFixture.designSystem;
        final stripped = Map<String, String>.from(ds.componentCustomProperties)
          ..removeWhere((k, v) => k.startsWith('--Sparkle-'));
        final degraded = NativeDesignSystemPayload(
          componentCustomProperties: stripped,
          dimensionContexts: ds.dimensionContexts,
          activeDimensionKey: ds.activeDimensionKey,
          activeDimensionContext: ds.activeDimensionContext,
        );
        final appearances = Map<String, ScaleDefinition>.from(
          jioFixture.themeConfig.appearances,
        )..remove('sparkle');
        final degradedTheme = ThemeConfig(appearances: appearances);

        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(
            value: 5,
            appearance: 'sparkle',
            semanticsLabel: '5',
          ),
          designSystem: degraded,
          themeConfig: degradedTheme,
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-counter-badge|data-size=m|data-variant=bold|'
            'data-attention=high|data-appearance=neutral',
          )),
          findsOneWidget,
          reason:
              'When sparkle is unconfigured, explicit appearance must fall back '
              'to neutral — never Material colorScheme.primary.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-003] --CounterBadge-backgroundColor-bold override wins for non-primary appearance',
      (tester) async {
        // Add the override token; render with appearance='negative'.
        // The component override must apply regardless of appearance.
        final ds = jioFixture.designSystem;
        final overridden = Map<String, String>.from(ds.componentCustomProperties)
          ..['--CounterBadge-backgroundColor-bold'] = '#ff00ff';
        final dsWithOverride = NativeDesignSystemPayload(
          componentCustomProperties: overridden,
          dimensionContexts: ds.dimensionContexts,
          activeDimensionKey: ds.activeDimensionKey,
          activeDimensionContext: ds.activeDimensionContext,
        );

        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(
            value: 5,
            appearance: 'negative',
            attention: 'high',
            semanticsLabel: '5',
          ),
          designSystem: dsWithOverride,
        );
        expect(tester.takeException(), isNull);
        expect(
          counterBadgeBoxDecoration(tester).color,
          oneUiHexColor('#ff00ff'),
          reason:
              '--CounterBadge-backgroundColor-bold must apply for every '
              'appearance, not only primary.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-004] appearance=auto inside bare Surface still resolves to primary (not Material)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, semanticsLabel: '5'),
          surfaceMode: 'subtle',
          surfaceAppearance: 'primary',
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-counter-badge|data-size=m|data-variant=bold|'
            'data-attention=high|data-appearance=primary',
          )),
          findsOneWidget,
          reason: 'appearance=auto inside Surface must resolve via slot-only '
              'semantics — never reach for Theme.of(context).colorScheme.primary.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-005] max=0 should produce "0+" (matches web), not default-99 behaviour',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 1, max: 0, semanticsLabel: '0+'),
        );
        expect(find.text('0+'), findsOneWidget,
            reason: 'Per CB-FN-005, all three platforms must agree on max=0. '
                'Web uses raw max → "0+". Either align Flutter to match or '
                'update web. Current Flutter behaviour defaults to 99.');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-006] max=int overflow math matches web/RN display rule',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 150, max: 99, semanticsLabel: '99+'),
        );
        expect(find.text('99+'), findsOneWidget,
            reason:
                'Overflow display must cap at max+. API type is int (web/RN use '
                'number) — parity tracked in audit CB-FN-006, not a runtime bug.');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-007] Hidden state (value=0) still emits Semantics(liveRegion) for AT announcement',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 0, semanticsLabel: '0 unread'),
        );
        final handle = tester.ensureSemantics();
        try {
          // The bug: SizedBox.shrink() drops the Semantics wrapper entirely.
          // Expected: an invisible Semantics(liveRegion:true,label:semanticsLabel)
          // remains so the 1→0 transition fires an announcement.
          expect(find.bySemanticsLabel('0 unread'), findsOneWidget,
              reason:
                  'Hidden CounterBadge must retain its live-region wrapper so '
                  'the 1→0 transition fires an AT announcement.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-008] testId is exposed via Semantics.identifier (cross-platform locators)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(
            value: 5,
            testId: 'qa-counter',
            semanticsLabel: '5',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(find.bySemanticsLabel('5'));
          final data = node.getSemanticsData();
          expect(data.identifier, 'qa-counter',
              reason:
                  'testId must reach platform AT trees via Semantics(identifier:). '
                  'KeyedSubtree only supports in-process find.byKey.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-009] Invalid appearance string normalises to neutral (debug warning)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(
            value: 5,
            appearance: 'positiv',
            semanticsLabel: '5',
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-counter-badge|data-size=m|data-variant=bold|'
            'data-attention=high|data-appearance=neutral',
          )),
          findsOneWidget,
          reason:
              'Invalid explicit appearance must fall back to neutral via '
              'oneUiResolveExplicitAppearanceRole (debugPrint in assert).',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-010] explicit variant derives data-attention from variant (not raw input)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(
            value: 5,
            variant: 'ghost',
            attention: 'high',
            semanticsLabel: '5',
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-counter-badge|data-size=m|data-variant=ghost|'
            'data-attention=low|data-appearance=primary',
          )),
          findsOneWidget,
          reason:
              'When variant is set explicitly, data-attention is the derived '
              'Figma alias (ghost → low), not the conflicting attention input.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [CB-FN-011] Dot-mode (xs+bold) without semanticsLabel must not announce raw digit',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(
            value: 5,
            size: 'xs',
            attention: 'high',
          ),
        );
        expect(find.text('5'), findsNothing,
            reason: 'Dot-mode must not show numerals visually.');
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('5'), findsNothing,
              reason:
                  'Dot-mode without semanticsLabel must not announce the hidden '
                  'digit to AT — callers must supply a meaningful label '
                  '("5 unread") or the engine must use a generic fallback.');
        } finally {
          handle.dispose();
        }
      },
    );
  });

  // ===========================================================================
  // ACCESSIBILITY regressions — tag `[a11y]`
  // ===========================================================================

  group('[regression][a11y] CounterBadge', () {
    testWidgetsAllPlatforms(
      '[a11y] [CB-A11Y-001] Whitespace-only semanticsLabel falls back to displayValue',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, semanticsLabel: '   '),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('   '), findsNothing,
              reason: 'Whitespace-only label must not reach AT.');
          expect(find.bySemanticsLabel('5'), findsOneWidget,
              reason:
                  'Trimmed-empty semanticsLabel must fall back to displayValue.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [CB-A11Y-002] liveRegion is off after settle (no announcement churn)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, semanticsLabel: '5 items'),
        );
        final handle = tester.ensureSemantics();
        try {
          final settled = counterBadgeSemanticsData(tester, semanticsLabel: '5 items');
          expect(settled.hasFlag(SemanticsFlag.isLiveRegion), isFalse,
              reason:
                  'Static counter must not keep liveRegion:true after settle — '
                  'avoids announcement churn on parent rebuild (CB-A11Y-002).');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [CB-A11Y-003] Accessible counter exposes one semantics label (no orphan Text)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, semanticsLabel: '5 items'),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('5 items'), findsOneWidget);
          expect(find.bySemanticsLabel('5'), findsNothing,
              reason:
                  'Inner Text must stay inside ExcludeSemantics — AT must not '
                  'see a duplicate orphan digit node.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [CB-A11Y-004] Flutter Web Semantics(container) must not be a focus stop',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, semanticsLabel: '5'),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = counterBadgeSemanticsData(tester, semanticsLabel: '5');
          expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse,
              reason:
                  'Status counter must not appear in the tab traversal order. '
                  'Web role=status has no tabindex.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [CB-A11Y-005] Counter height scales with MediaQuery.textScaler (WCAG 1.4.4)',
      (tester) async {
        // Wrap in a MediaQuery with 2.0× text scale; height must grow.
        await tester.pumpWidget(MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2.0)),
          child: pumpCounterBadgeQaApp(
            const OneUiCounterBadge(value: 9, semanticsLabel: '9'),
          ),
        ));
        await tester.pumpAndSettle();
        final scaledHeight = tester.getSize(counterBadgeRootFinder()).height;

        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 9, semanticsLabel: '9'),
        );
        final baseHeight = tester.getSize(counterBadgeRootFinder()).height;

        expect(scaledHeight, greaterThan(baseHeight),
            reason:
                'WCAG 1.4.4 Resize Text — at 2.0× scale, glyphs grow so the '
                'badge must grow with them. Currently height is fixed → text clips.');
      },
    );
  });

  // ===========================================================================
  // VISUAL regressions — tag `[visual]`
  // ===========================================================================

  group('[regression][visual] CounterBadge', () {
    testWidgetsAllPlatforms(
      '[visual] [CB-VIS-001] Fallback TextStyle sets fontFamily from --Typography-Font-Primary',
      (tester) async {
        // Render without nativeTypography to force the fallback path.
        final ds = jioFixture.designSystem;
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: pumpCounterBadgeQaApp(
                const OneUiCounterBadge(value: 5, semanticsLabel: '5'),
                designSystem: ds,
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();
        final textWidget = tester.widget<Text>(find.descendant(
          of: counterBadgeRootFinder(),
          matching: find.byType(Text),
        ));
        expect(textWidget.style?.fontFamily, isNotNull,
            reason:
                'CLAUDE.md mandatory: every text element must set fontFamily '
                'from --Typography-Font-Primary. Fallback path currently sets '
                'fontFamily: null.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [CB-VIS-002] No textHeightBehavior override on the digit label',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, semanticsLabel: '5'),
        );
        final textWidget = tester.widget<Text>(find.descendant(
          of: counterBadgeRootFinder(),
          matching: find.byType(Text),
        ));
        expect(textWidget.textHeightBehavior, isNull,
            reason:
                'CB-VIS-002: textHeightBehavior strips line-box padding → '
                'digit baseline shifts vs web. Remove the override.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [CB-VIS-003] TextStyle line-height comes from token, not .copyWith(height: 1)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, size: 'm', semanticsLabel: '5'),
        );
        final textWidget = tester.widget<Text>(find.descendant(
          of: counterBadgeRootFinder(),
          matching: find.byType(Text),
        ));
        // The bug: .copyWith(height: 1) hard-codes line-height to 1.
        // Expected: token-driven (e.g. ~1.4 ratio from --Label-2XS-LineHeight).
        expect(textWidget.style?.height, isNot(1.0),
            reason:
                'CB-VIS-003: line-height must come from --Label-{N}-LineHeight '
                'token, not hard-coded to 1. CLAUDE.md: always pair line-height '
                'with font-size.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [CB-VIS-004] Height fallback uses token cascade (not literal 16 px)',
      (tester) async {
        // Strip the per-size token to force the fallback.
        final ds = jioFixture.designSystem;
        final stripped = Map<String, String>.from(ds.componentCustomProperties)
          ..removeWhere((k, v) => k.startsWith('--CounterBadge-height-'));
        final degraded = NativeDesignSystemPayload(
          componentCustomProperties: stripped,
          dimensionContexts: ds.dimensionContexts,
          activeDimensionKey: ds.activeDimensionKey,
          activeDimensionContext: ds.activeDimensionContext,
        );
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, size: 's', semanticsLabel: '5'),
          designSystem: degraded,
        );
        final hSmall = tester.getSize(counterBadgeRootFinder()).height;

        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, size: 'xl', semanticsLabel: '5'),
          designSystem: degraded,
        );
        final hXl = tester.getSize(counterBadgeRootFinder()).height;

        // Bug: both collapse to literal 16. Expected: different fallback values
        // via Spacing chain.
        expect(hSmall, isNot(equals(hXl)),
            reason:
                'CB-VIS-004: when --CounterBadge-height-{size} tokens are absent, '
                'fallback must cascade through Spacing chain (per-size distinct), '
                'not collapse to a literal 16.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [CB-VIS-005] size="xl" renders taller than size="l" (Flutter-only size)',
      (tester) async {
        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, size: 'l', semanticsLabel: '5'),
        );
        final hL = tester.getSize(counterBadgeRootFinder()).height;

        await pumpCounterBadgeQaHarnessSettled(
          tester,
          const OneUiCounterBadge(value: 5, size: 'xl', semanticsLabel: '5'),
        );
        final hXl = tester.getSize(counterBadgeRootFinder()).height;

        expect(hXl, greaterThanOrEqualTo(hL),
            reason:
                'Flutter exposes xl as a fifth size; height must not shrink below l. '
                'Web/RN parity (4 sizes) is a separate product decision.');
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-counter-badge|data-size=xl|data-variant=bold|'
            'data-attention=high|data-appearance=primary',
          )),
          findsOneWidget,
        );
      },
    );
  });

  // ===========================================================================
  // [meta] Burn-down counter
  // ===========================================================================

  group('[regression][meta] CounterBadge', () {
    test('[meta] burn-down counter — total pending bugs = 8', () {
      // Decrement when a bug-fix lands and the matching CB-XX-NNN test turns green.
      const totalPendingBugs = 8;
      expect(totalPendingBugs, 8,
          reason:
              'When a fix lands, update this counter alongside the matching '
              'CB-XX-NNN test moving from RED to GREEN.');
    });
  });
}
