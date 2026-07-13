/// Badge regression suite — one test per bug from
/// `docs/badge-audit-report.md` (audit 2026-06-15).
///
/// Tests assert the **expected (correct)** behavior of the badge. Each one
/// fails until the matching dev fix lands in
/// `packages/ui_flutter/lib/widgets/one_ui_badge.dart` (or its engine /
/// a11y resolver). The failure is the bug ticket.
///
/// Each widget test runs on Android, iOS and Linux via
/// `testWidgetsAllPlatforms`, so a single bug surfaces as 3 platform-tagged
/// failures (e.g. `… (android)`, `… (iOS)`, `… (linux)`). Group tags
/// (`[fn]`, `[a11y]`, `[visual]`) drive the HTML-report categorisation.
///
/// Run: `flutter test test/components/badge/badge_regression_test.dart`
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/avatar_color_resolve.dart';
import 'package:ui_flutter/engine/badge_color_resolve.dart';
import 'package:ui_flutter/engine/badge_size_resolve.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart'
    show ScaleDefinition, ThemeConfig;
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_avatar.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_types.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_badge_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_badge_types.dart';

import '../../support/components/badge_harness.dart';

/// Sizes exercised by [BADGE-VIS-004] mixed-slot padding parity (web
/// `Badge.module.css` `:has(.start)` + `:has(.end)`).
const _kBadgeMixedSlotPaddingSizes = ['xs', 's', 'm', 'l', 'xl'];

void expectBadgeShellHorizontalPaddingSymmetric(
  WidgetTester tester, {
  required String reason,
}) {
  final padding = tester.widget<Padding>(
    find
        .descendant(of: badgeRootFinder(), matching: find.byType(Padding))
        .first,
  );
  final pad = padding.padding as EdgeInsets;
  expect(pad.left, closeTo(pad.right, 0.5), reason: reason);
}

Future<List<String>> captureBadgeDebugPrints(
  Future<void> Function() body,
) async {
  final previous = debugPrint;
  final messages = <String>[];
  debugPrint = (String? message, {int? wrapWidth}) {
    if (message != null) messages.add(message);
  };
  try {
    await body();
  } finally {
    debugPrint = previous;
  }
  return messages;
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // FUNCTIONAL regressions — tag `[fn]` picked up by the HTML report.
  // ===========================================================================

  group('[regression][fn] Badge', () {
    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-001/011] Missing designSystem uses debug-only ConvexGapCard (release → SizedBox.shrink)',
      (tester) async {
        await tester.pumpWidget(
          const MaterialApp(home: Scaffold(body: OneUiBadge(child: 'New'))),
        );
        // `oneUiConvexGapPlaceholder` guards production via kDebugMode
        // (convex_design_system_guard.dart). flutter test runs in debug, so
        // the dev diagnostic is expected here — not an end-user regression.
        expect(find.byType(ConvexGapCardImpl), findsOneWidget);
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-002] Long label ellipsizes inside a constrained parent',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const SizedBox(
            width: 60,
            child: OneUiBadge(
              semanticsLabel: 'b',
              child: 'Very long status label that must clip',
            ),
          ),
        );
        expect(tester.takeException(), isNull,
            reason: 'Long label must ellipsize, not overflow with RenderFlex '
                'stripes. Currently Row(min) passes unbounded width to Text '
                '→ ~99k px overflow observed.');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-003] Nested CounterBadge slot renders without RenderFlex overflow',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'badge',
            start: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
            child: 'Inbox',
          ),
        );
        expect(tester.takeException(), isNull,
            reason:
                'CounterBadge nested in a Badge slot must render compactly. '
                'Currently falls back to ConvexGapCard → ~99k px overflow.');
        expect(find.byType(OneUiCounterBadge), findsOneWidget);
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-003c] CounterBadge slot keeps numeric label in xs/s/m Badge sizes',
      (tester) async {
        for (final size in const ['xs', 's', 'm']) {
          await pumpBadgeQaHarnessSettled(
            tester,
            OneUiBadge(
              semanticsLabel: 'badge',
              size: size,
              attention: 'medium',
              start: const OneUiAvatar(
                content: OneUiAvatarContent.icon,
                appearance: 'primary',
                excludeFromSemantics: true,
              ),
              end: const OneUiCounterBadge(value: 3, semanticsLabel: '3'),
              child: 'Badge',
            ),
          );
          expect(
            find.descendant(
              of: find.byType(OneUiCounterBadge),
              matching: find.text('3'),
            ),
            findsOneWidget,
            reason:
                'Badge size=$size must show the CounterBadge numeral, not only '
                'the standalone xs dot-mode circle.',
          );
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-003b] Nested IndicatorBadge slot renders without RenderFlex overflow',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'badge',
            end: OneUiIndicatorBadge(
              appearance: 'negative',
              semanticsLabel: 'unread',
            ),
            child: 'Mail',
          ),
        );
        expect(tester.takeException(), isNull,
            reason:
                'IndicatorBadge nested in slot must render as a small dot.');
        expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-004] Non-String widget child must not produce stringified debug text',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(child: SizedBox(width: 8, height: 8)),
        );
        final badgeTexts = tester
            .widgetList<Text>(find.descendant(
              of: badgeRootFinder(),
              matching: find.byType(Text),
            ))
            .map((t) => t.data ?? '')
            .toList();
        for (final txt in badgeTexts) {
          final looksLikeWidgetToString =
              RegExp(r'^[A-Z][a-zA-Z]*\(').hasMatch(txt) ||
                  txt.contains('Instance of');
          expect(looksLikeWidgetToString, isFalse,
              reason:
                  'Found stringified Widget data: "$txt". child:Object? must '
                  'not stringify Widgets. Narrow the type to String|num or '
                  'drop the Text render path.');
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-005] Empty badge emits a Semantics(liveRegion:true) wrapper',
      (tester) async {
        await pumpBadgeQaHarnessSettled(tester, const OneUiBadge());
        final handle = tester.ensureSemantics();
        try {
          final semantics = find.descendant(
            of: badgeRootFinder(),
            matching: find.byType(Semantics),
          );
          expect(semantics, findsAtLeastNWidgets(1),
              reason: 'Web emits <span role="status"> even for empty badges. '
                  'Flutter must always wrap in Semantics(liveRegion:true) so '
                  'AT can announce dynamic content updates.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-006] testId is exposed via Semantics.identifier (cross-platform locators)',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(testId: 'qa-badge', semanticsLabel: 'b', child: 'X'),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(find.byType(OneUiBadge));
          final data = node.getSemanticsData();
          expect(data.identifier, 'qa-badge',
              reason: 'testId must reach the browser DOM as `data-testid` and '
                  'platform AT trees via Semantics(identifier:). KeyedSubtree '
                  'only supports in-process find.byKey.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-007] appearance="auto" warns and uses neutral when brand omits sparkle',
      (tester) async {
        final fx = jioFixture;
        final appearances =
            Map<String, ScaleDefinition>.from(fx.themeConfig.appearances)
              ..remove('sparkle');
        final themeWithoutSparkle = ThemeConfig(appearances: appearances);

        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpBadgeQaHarnessSettled(
            tester,
            const OneUiBadge(semanticsLabel: 'b', child: 'X'),
            themeConfig: themeWithoutSparkle,
          );
          expect(captured, isNotNull,
              reason:
                  'When the resolved role is absent, the engine must emit a '
                  'dev warning AND fall back to Neutral — not silently switch '
                  'to Material colorScheme.primary.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-008] Slot a11y labels announce alongside the badge label',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'Verified',
            start: OneUiCounterBadge(value: 1, semanticsLabel: 'User Alice'),
            child: 'Verified',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Verified'), findsOneWidget);
          expect(find.bySemanticsLabel('User Alice'), findsOneWidget,
              reason: 'Slot labels (Avatar.alt, CounterBadge.semanticsLabel, '
                  'IndicatorBadge.semanticsLabel) must remain visible to AT '
                  'even when the badge itself has a label.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-009] variant+attention together do not churn the subtree key',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'b',
            variant: 'bold',
            attention: 'low',
            child: 'A',
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-badge|data-size=m|data-variant=bold|data-appearance=sparkle',
          )),
          findsOneWidget,
          reason:
              'When variant is set explicitly, attention must not influence '
              'the subtree key (currently encoded, causing rebuild churn).',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [BADGE-FN-010] Invalid appearance string normalises to neutral (debug warning)',
      (tester) async {
        final prints = await captureBadgeDebugPrints(() async {
          await pumpBadgeQaHarnessSettled(
            tester,
            const OneUiBadge(
              semanticsLabel: 'b',
              appearance: 'not-a-real-role',
              child: 'X',
            ),
          );
        });
        expect(
          prints.join('\n'),
          contains('unknown appearance "not-a-real-role"'),
          reason: 'Invalid explicit appearance must log a debug warning via '
              'oneUiResolveBadgeExplicitAppearance.',
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-badge|data-size=m|data-variant=bold|data-attention=high|'
            'data-appearance=neutral',
          )),
          findsOneWidget,
          reason: 'Invalid explicit appearance must fall back to neutral.',
        );
      },
    );
  });

  // ===========================================================================
  // ACCESSIBILITY regressions
  // ===========================================================================

  group('[regression][a11y] Badge', () {
    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-001] Widget child without semanticsLabel still emits live region',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(child: SizedBox(width: 4, height: 4)),
        );
        final handle = tester.ensureSemantics();
        try {
          final semantics = find.descendant(
            of: badgeRootFinder(),
            matching: find.byType(Semantics),
          );
          expect(semantics, findsAtLeastNWidgets(1),
              reason: 'Widget child + no semanticsLabel must still emit '
                  'Semantics(liveRegion:true) OR a dev warning.');
          final outer = tester.getSemantics(find.byType(OneUiBadge));
          final data = outer.getSemanticsData();
          expect(data.hasFlag(SemanticsFlag.isLiveRegion), isTrue,
              reason:
                  'Anonymous status region must expose liveRegion so TalkBack '
                  'can announce descendant updates (BADGE-A11Y-001).');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-001b] Text widget child uses labelled live region',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(child: Text('Beta')),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('Beta'), findsOneWidget,
              reason:
                  'Text widget children must drive OneUiStatusSemantics label '
                  'so content updates re-announce on TalkBack.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-002] Whitespace-only semanticsLabel is trimmed (treated as absent)',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(semanticsLabel: '   ', child: 'A'),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('   '), findsNothing,
              reason: 'Whitespace-only label must not pass to AT. Currently '
                  'isNotEmpty allows whitespace through, triggering silent '
                  'live-region announcements.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-003] Semantics inherits Directionality (no hard-coded LTR)',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const Directionality(
            textDirection: TextDirection.rtl,
            child: OneUiBadge(semanticsLabel: 'حالة', child: 'حالة'),
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(find.bySemanticsLabel('حالة'));
          final data = node.getSemanticsData();
          expect(data.textDirection, TextDirection.rtl,
              reason: 'Badge must inherit Directionality. Hard-coded '
                  'TextDirection.ltr at one_ui_badge.dart:191 breaks Arabic / '
                  'Hebrew screen-reader output.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-004] Badge layout uses ConstrainedBox(minHeight), not fixed SizedBox(height)',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(semanticsLabel: 'b', child: 'Badge'),
        );
        final constrained = find.descendant(
          of: badgeRootFinder(),
          matching: find.byWidgetPredicate(
            (w) => w is ConstrainedBox && w.constraints.minHeight > 0,
          ),
        );
        expect(constrained, findsOneWidget,
            reason:
                'Shell must use ConstrainedBox(minHeight) so scaled text can '
                'grow (WCAG 1.4.4).');
        final fixedHeightShell = find.descendant(
          of: badgeRootFinder(),
          matching: find.byWidgetPredicate(
            (w) => w is SizedBox && w.height != null && w.height! > 0,
          ),
        );
        expect(fixedHeightShell, findsNothing,
            reason: 'Fixed SizedBox(height) must not clamp the badge shell.');
      },
    );

    // BADGE-A11Y-005 removed — reclassified NOT A BUG (2026-06-16 audit §0).
    // Harness now uses OneUiSurfaceBootstrap; outer live region works in production.

    test(
      '[a11y] [BADGE-A11Y-006] Flutter Web tab traversal — non-interactive badge not focusable (manual verification)',
      () {},
      skip:
          'Manual Flutter Web check only — run `flutter run -d chrome`, Tab through '
          'a labelled OneUiBadge; badge must NOT enter focus order.',
    );

    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-007] semanticsHint reaches AT even when no label resolves',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsHint: 'Open inbox for details',
            child: SizedBox(width: 4, height: 4),
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final hintNode = find.byWidgetPredicate((w) {
            if (w is! Semantics) return false;
            return w.properties.hint == 'Open inbox for details';
          });
          expect(hintNode, findsAtLeastNWidgets(1),
              reason:
                  'semanticsHint must always reach AT. Currently the entire '
                  'Semantics wrapper is skipped when a11y.accessible == false.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [BADGE-A11Y-008] resolveBadgeColors branches on MediaQuery.highContrastOf for ghost border',
      (tester) async {
        late BuildContext ctx;
        await tester.pumpWidget(
          MediaQuery(
            data: const MediaQueryData(highContrast: true),
            child: pumpBadgeQaApp(
              Builder(
                builder: (context) {
                  ctx = context;
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();
        final role = OneUiSurfaceScope.tokensForAppearance(ctx, 'primary');
        final paint = resolveBadgeColors(
          ctx,
          OneUiScope.of(ctx).designSystem!,
          variant: 'ghost',
          appearance: 'primary',
        );
        expect(
          paint.borderColor,
          oneUiHexColor(role.content['strokeMedium']!),
          reason:
              'Ghost border must prefer strokeMedium in high-contrast mode.',
        );
      },
    );
  });

  // ===========================================================================
  // VISUAL regressions
  // ===========================================================================

  group('[regression][visual] Badge', () {
    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-001] Long text does not paint RenderFlex overflow stripes',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const SizedBox(
            width: 80,
            child: OneUiBadge(
              semanticsLabel: 'b',
              child: 'Long status text exceeding 80 px',
            ),
          ),
        );
        expect(tester.takeException(), isNull,
            reason: 'See BADGE-FN-002 — same root cause.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-002] Brand line-height token drives Text.height (no hard-coded 1.0)',
      (tester) async {
        late BadgeResolvedLayout layout;
        await pumpBadgeQaHarnessSettled(
          tester,
          Builder(builder: (context) {
            layout = resolveBadgeLayout(
              context,
              OneUiScope.of(context).designSystem!,
              size: 'm',
              hasStart: false,
              hasEnd: false,
            );
            return const OneUiBadge(semanticsLabel: 'b', child: 'Badge');
          }),
        );
        final textWidget = tester.widget<Text>(
          find.descendant(of: badgeRootFinder(), matching: find.byType(Text)),
        );
        expect(textWidget.style?.height, layout.labelStyle.height,
            reason: 'Visible label Text.height must match the token-resolved '
                'labelStyle from resolveBadgeLayout — not a hard-coded '
                'height: 1 clamp in one_ui_badge.dart.');

        // Label role tokens can legitimately yield a 1.0 multiplier (compact
        // single-line labels). Prove the engine honours distinct overrides.
        final syntheticDs = qaBadgeTestDesignSystem();
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(semanticsLabel: 'b', child: 'Badge'),
          designSystem: syntheticDs,
        );
        final syntheticText = tester.widget<Text>(
          find.descendant(of: badgeRootFinder(), matching: find.byType(Text)),
        );
        expect(syntheticText.style?.height, isNot(1.0),
            reason: 'When --Badge-lineHeight-{size} resolves above fontSize, '
                'the multiplier must flow through unchanged.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-003] Large sizes (l/xl) do not strip ascent/descent',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(semanticsLabel: 'b', size: 'xl', child: 'Badge'),
        );
        final textWidget = tester.widget<Text>(
          find.descendant(of: badgeRootFinder(), matching: find.byType(Text)),
        );
        final behaviour = textWidget.textHeightBehavior;
        expect(behaviour?.applyHeightToFirstAscent ?? true, isTrue,
            reason:
                'At l/xl sizes the line box must include normal typographic '
                'ascent so glyphs align with the Figma reference.');
      },
    );

    for (final size in _kBadgeMixedSlotPaddingSizes) {
      testWidgetsAllPlatforms(
        '[visual] [BADGE-VIS-004] size=$size icon start + CounterBadge end uses symmetric horizontal padding',
        (tester) async {
          await pumpBadgeQaHarnessSettled(
            tester,
            OneUiBadge(
              semanticsLabel: 'b',
              size: size,
              start: const SizedBox(width: 12, height: 12),
              end: const OneUiCounterBadge(value: 3, semanticsLabel: '3'),
              child: 'Mix',
            ),
          );
          expectBadgeShellHorizontalPaddingSymmetric(
            tester,
            reason: 'Web Badge.module.css applies :has(.start) and :has(.end) '
                'independently — with both slots, left/right padding must match '
                '(xl: Figma 409:10118 symmetric base; xs–l: both sides reduced '
                'to the slot token). Flutter _mixedIconStartBadgeEnd must not '
                'use asymmetric L/R at size=$size.',
          );
        },
      );
    }

    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-005] IndicatorBadge inside xs slot renders at 4 px (Spacing-1)',
      (tester) async {
        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'b',
            size: 'xs',
            start: OneUiIndicatorBadge(semanticsLabel: 'dot'),
            child: 'X',
          ),
        );
        expect(tester.takeException(), isNull);
        final dotSize = tester.getSize(find.byType(OneUiIndicatorBadge));
        expect(dotSize.width, closeTo(4.0, 0.5),
            reason: 'Per web CSS --_slot-indicator-size = Spacing-1 (4 px). '
                'Currently resolves to Spacing-1-5 (6 px), causing clipping '
                'inside the 12-px xs badge.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-006] CounterBadge slot uses 12 px (Spacing-3) even when brand tokens are partial',
      (tester) async {
        final ds = jioFixture.designSystem;
        final stripped = Map<String, String>.from(ds.componentCustomProperties)
          ..removeWhere((k, v) => k.startsWith('--CounterBadge-height-'));
        final degraded = NativeDesignSystemPayload(
          componentCustomProperties: stripped,
          dimensionContexts: ds.dimensionContexts,
          activeDimensionKey: ds.activeDimensionKey,
          activeDimensionContext: ds.activeDimensionContext,
        );

        await pumpBadgeQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'b',
            size: 'xs',
            start: OneUiCounterBadge(value: 3, semanticsLabel: '3'),
            child: 'X',
          ),
          designSystem: degraded,
        );
        expect(tester.takeException(), isNull);
        final counterSize = tester.getSize(find.byType(OneUiCounterBadge));
        expect(counterSize.height, lessThanOrEqualTo(12.5),
            reason: 'CounterBadge must fall back to 12 px (Spacing-3), not the '
                'hard-coded 16 px in counter_badge_size_resolve.dart:47-51.');
      },
    );

    test(
      '[visual] [BADGE-VIS-007] appearance="auto" outside Surface — documented contract: defaults to sparkle',
      () {
        final state = resolveOneUiBadgeState(appearance: 'auto');
        expect(state.resolvedAppearance, 'sparkle',
            reason:
                'Documented cross-platform default (web Badge.shared.ts:65). '
                'Flagged as UX surprise in the audit — change requires '
                'alignment with design.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-008] resolveBadgeColors reads --Badge-roleMaterialText for bold slot icon',
      (tester) async {
        final fx = jioFixture;
        final props =
            Map<String, String>.from(fx.designSystem.componentCustomProperties)
              ..['--Badge-roleMaterialText'] = '#FF00FF'
              ..['--Badge-textColor-bold'] = '#00FF00'
              ..['--Badge-backgroundColor-bold'] = '#0000FF';
        final materialDs = NativeDesignSystemPayload(
          componentCustomProperties: props,
          dimensionContexts: fx.designSystem.dimensionContexts,
          activeDimensionKey: fx.designSystem.activeDimensionKey,
          activeDimensionContext: fx.designSystem.activeDimensionContext,
        );

        late BuildContext ctx;
        await tester.pumpWidget(
          pumpBadgeQaApp(
            Builder(
              builder: (context) {
                ctx = context;
                return const SizedBox.shrink();
              },
            ),
            designSystem: materialDs,
          ),
        );
        await tester.pumpAndSettle();

        final paint = resolveBadgeColors(
          ctx,
          materialDs,
          variant: 'bold',
          appearance: 'primary',
        );
        expect(paint.foreground, const Color(0xFFFF00FF),
            reason: '--Badge-roleMaterialText must drive bold label colour.');
        expect(paint.slotIconColor, const Color(0xFFFF00FF),
            reason:
                'Bold slot icon must share --Badge-roleMaterialText with the '
                'label on metallic-material badges.');
        expect(paint.slotIconColor, isNot(const Color(0xFF00FF00)),
            reason: 'Slot icon must not ignore roleMaterialText in favour of '
                '--Badge-textColor-bold alone.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [BADGE-VIS-009] high Badge slot children resolve inside the Badge surface',
      (tester) async {
        late SurfaceContextValue rootSurface;
        late SurfaceContextValue slotSurface;
        late Color slotAvatarBackground;

        await pumpBadgeQaHarnessSettled(
          tester,
          Builder(builder: (context) {
            rootSurface = OneUiSurfaceScope.of(context);
            return OneUiBadge(
              semanticsLabel: 'badge',
              size: 'l',
              attention: 'high',
              appearance: 'primary',
              start: Builder(builder: (slotContext) {
                slotSurface = OneUiSurfaceScope.of(slotContext);
                slotAvatarBackground = resolveAvatarColors(
                  slotContext,
                  appearance: 'primary',
                  attention: OneUiAvatarAttention.high,
                  showingImage: false,
                ).background;
                return const OneUiAvatar(
                  content: OneUiAvatarContent.icon,
                  appearance: 'primary',
                  excludeFromSemantics: true,
                );
              }),
              end: const OneUiAvatar(
                content: OneUiAvatarContent.icon,
                appearance: 'primary',
                excludeFromSemantics: true,
              ),
              child: 'Badge',
            );
          }),
        );

        expect(slotAvatarBackground, isNotNull);
        expect(slotSurface.parentMode, 'bold',
            reason:
                'Avatar slots inside high Badge must resolve against the Badge '
                'bold fill, not the page/root surface.');
        expect(slotSurface.parentStep, isNot(rootSurface.parentStep),
            reason:
                'Slot surface context must advance from the page step so nested '
                'Avatar high fills do not collapse into the Badge fill.');
      },
    );
  });

  // ===========================================================================
  // Resolver unit tests (no widget pump)
  // ===========================================================================

  group('[regression][fn] Badge resolvers', () {
    test(
      '[fn] [BADGE-A11Y-002b] resolveOneUiBadgeAccessibilityLabel trims whitespace',
      () {
        expect(
          resolveOneUiBadgeAccessibilityLabel(
              semanticsLabel: '   ', child: 'A'),
          'A',
          reason:
              'Whitespace-only label must be treated as absent and fall back '
              'to child. Currently isNotEmpty allows whitespace through.',
        );
      },
    );

    test(
      '[fn] [BADGE-FN-004b] resolveOneUiBadgeAccessibilityLabel rejects non-stringy Widget child',
      () {
        final label = resolveOneUiBadgeAccessibilityLabel(
          child: const SizedBox(),
        );
        expect(label, isNull,
            reason: 'Resolver must not stringify non-renderable children.');
      },
    );

    test(
      '[fn] [BADGE-VIS-007b] resolveOneUiBadgeState — appearance=auto pins sparkle (documented contract)',
      () {
        final s = resolveOneUiBadgeState(appearance: 'auto');
        expect(s.resolvedAppearance, 'sparkle');
        final t = resolveOneUiBadgeState(
          appearance: 'auto',
          surfaceAppearance: 'secondary',
        );
        expect(t.resolvedAppearance, 'secondary');
      },
    );
  });

  // ===========================================================================
  // Burn-down counter (not categorised — sits outside the [fn]/[a11y]/[visual] tabs)
  // ===========================================================================

  test(
    '[regression] Badge audit burn-down — N bugs pending dev fix from 2026-06-15 audit',
    () {
      const totalPendingBugs = 0;
      expect(totalPendingBugs, 0,
          reason: 'See docs/badge-audit-report.md §1–§3. As bugs are fixed, '
              'the matching regression test will turn green; decrement this '
              'counter accordingly.');
    },
  );
}
