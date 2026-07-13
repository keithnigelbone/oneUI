/// IndicatorBadge regression suite — one test per bug from
/// `docs/indicator-badge-audit-report.md` (audit 2026-06-16).
///
/// Each test asserts observable correct behavior. When a bug is fixed in
/// `packages/ui_flutter`, the matching IB-XX-NNN test goes green automatically.
///
/// Each widget test runs on Android, iOS and Linux via
/// `testWidgetsAllPlatforms`. Group tags (`[fn]`, `[a11y]`, `[visual]`) drive
/// HTML-report categorisation.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/surface_engine.dart' show ScaleDefinition, ThemeConfig;
import 'package:ui_flutter/widgets/convex_gap_card.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_indicator_badge_overlay.dart';

import '../../support/components/indicator_badge_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // FUNCTIONAL regressions — tag `[fn]`
  // ===========================================================================

  group('[regression][fn] IndicatorBadge', () {
    testWidgetsAllPlatforms(
      '[fn] [IB-FN-001] IndicatorBadge without OneUiScope falls back silently (not orange debug card)',
      (tester) async {
        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(
              body: OneUiIndicatorBadge(semanticsLabel: 'Online'),
            ),
          ),
        );
        expect(find.byType(ConvexGapCardImpl), findsNothing,
            reason:
                'Production indicator must fall back to a silent placeholder '
                '(SizedBox.shrink with Semantics) when designSystem is null. '
                'Currently returns deep-orange ConvexGapCard with English text.');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-002] --IndicatorBadge-backgroundColor override wins for non-primary appearance',
      (tester) async {
        final ds = jioFixture.designSystem;
        final overridden = Map<String, String>.from(ds.componentCustomProperties)
          ..['--IndicatorBadge-backgroundColor'] = '#ff00ff';
        final dsWithOverride = NativeDesignSystemPayload(
          componentCustomProperties: overridden,
          dimensionContexts: ds.dimensionContexts,
          activeDimensionKey: ds.activeDimensionKey,
          activeDimensionContext: ds.activeDimensionContext,
        );

        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(
            appearance: 'negative',
            semanticsLabel: 'alert',
          ),
          designSystem: dsWithOverride,
        );
        expect(tester.takeException(), isNull);
        expect(
          indicatorBadgeDotDecoration(tester).color,
          const Color(0xFFFF00FF),
          reason:
              'IB-FN-002: --IndicatorBadge-backgroundColor must apply for every '
              'appearance, not only primary.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-003] Unconfigured role falls back to neutral, not Material primary',
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

        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(
            appearance: 'sparkle',
            semanticsLabel: 'dot',
          ),
          designSystem: degraded,
          themeConfig: degradedTheme,
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-indicator-badge|data-size=m|data-appearance=neutral',
          )),
          findsOneWidget,
          reason:
              'When sparkle is unconfigured, explicit appearance must fall back '
              'to neutral — never Material colorScheme.primary.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-004] Invalid appearance string normalises to neutral',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(
            appearance: 'negaitve',
            semanticsLabel: 'dot',
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-indicator-badge|data-size=m|data-appearance=neutral',
          )),
          findsOneWidget,
          reason:
              'Invalid explicit appearance must fall back to neutral via '
              'oneUiResolveExplicitAppearanceRole (debugPrint in assert).',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-005] Empty semanticsLabel is not accessible (dev warning + no AT name)',
      (tester) async {
        final prints = await captureIndicatorBadgeDebugPrints(() async {
          resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '');
        });
        expect(
          prints.any((m) => m.contains('semanticsLabel')),
          isTrue,
          reason: 'Empty semanticsLabel must emit a debug warning in assert builds',
        );
        expect(
          resolveOneUiIndicatorBadgeSemantics(semanticsLabel: '').accessible,
          isFalse,
        );

        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(semanticsLabel: ''),
        );
        expect(find.byType(OneUiIndicatorBadge), findsOneWidget);
        withSemanticsHandle(tester, () {
          expect(find.bySemanticsLabel('Online'), findsNothing);
          expect(find.bySemanticsLabel('dot'), findsNothing);
        });
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-006] appearance=auto inherits from root-level Surface (no surfaceDepth gate)',
      (tester) async {
        // surfaceDepth==0 for the root Surface set by Bootstrap. Web ignores
        // depth and reads parentAppearance directly.
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(semanticsLabel: 'dot'),
          surfaceMode: 'default',
          surfaceAppearance: 'positive',
        );
        // Expected (web parity): appearance resolves to 'positive' from surface
        // even though it's the root-level surface. Currently falls to primary.
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-indicator-badge|data-size=m|data-appearance=positive',
          )),
          findsOneWidget,
          reason:
              'IB-FN-006: appearance=auto must inherit from any Surface '
              'ancestor regardless of surfaceDepth, matching web parity.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-007] bottomEnd overlay applies surface ring by default (opt-out, not opt-in)',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadgeOverlay(
            hostSide: 40,
            host: const ColoredBox(color: Color(0xFFCCCCCC)),
            indicator: const OneUiIndicatorBadge(
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            indicatorSize: 's',
            // No surfaceRingWidth — expected to default to Spacing-0-5 (~2px).
          ),
        );
        final dotSize = tester.getSize(find.byType(OneUiIndicatorBadge));
        expect(
          indicatorBadgeOverlaySurfaceRingFinder(),
          findsWidgets,
          reason:
              'IB-FN-007: bottomEnd avatar overlay must render the outward '
              'surface ring by default (circle fill wrapper, not opt-in).',
        );
        final ringRender = tester.renderObject<RenderBox>(
          indicatorBadgeOverlaySurfaceRingFinder().first,
        );
        expect(
          ringRender.size.width,
          greaterThan(dotSize.width),
          reason: 'Ring wrapper must extend beyond the dot diameter',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [IB-FN-008] Cross-platform parity: testId is exposed via Semantics.identifier',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(
            testId: 'qa-status-dot',
            semanticsLabel: 'Online',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(find.bySemanticsLabel('Online'));
          final data = node.getSemanticsData();
          expect(data.identifier, 'qa-status-dot',
              reason:
                  'testId must reach platform AT trees via Semantics(identifier:). '
                  'KeyedSubtree alone breaks cross-platform e2e harnesses.');
        } finally {
          handle.dispose();
        }
      },
    );
  });

  // ===========================================================================
  // ACCESSIBILITY regressions — tag `[a11y]`
  // ===========================================================================

  group('[regression][a11y] IndicatorBadge', () {
    testWidgetsAllPlatforms(
      '[a11y] [IB-A11Y-001] liveRegion is opt-out for static dots (announceChanges:false)',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(semanticsLabel: 'Online'),
        );
        withSemanticsHandle(tester, () {
          expect(
            indicatorBadgeSemanticsData(tester, semanticsLabel: 'Online')
                .hasFlag(SemanticsFlag.isLiveRegion),
            isFalse,
            reason:
                'Static dots must not expose liveRegion — avoids AT spam on rebuild',
          );
        });

        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(semanticsLabel: 'Online'),
        );
        withSemanticsHandle(tester, () {
          expect(
            indicatorBadgeSemanticsData(tester, semanticsLabel: 'Online')
                .hasFlag(SemanticsFlag.isLiveRegion),
            isFalse,
            reason: 'Identical label rebuild must not re-arm liveRegion',
          );
        });
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [IB-A11Y-002] Flutter Web Semantics(container) must not be a focus stop',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(semanticsLabel: 'Online'),
        );
        final handle = tester.ensureSemantics();
        try {
          final data = indicatorBadgeSemanticsData(tester, semanticsLabel: 'Online');
          expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse,
              reason:
                  'Status indicator must not appear in tab traversal. '
                  'Web role=status has no tabindex.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [IB-A11Y-003] Bold-on-tinted contrast guard (warning dot on warning-subtle surface)',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(
            appearance: 'warning',
            semanticsLabel: 'Caution',
          ),
          surfaceMode: 'subtle',
          surfaceAppearance: 'warning',
        );
        final dot = indicatorBadgeDotDecoration(tester);
        expect(dot.border, isNotNull, reason: 'WCAG 1.4.11 stroke when ratio < 3:1');
        expect(dot.border!.top.width, greaterThan(0));
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [IB-A11Y-004] xs standalone use emits debug warning (sub-pixel invisible)',
      (tester) async {
        final prints = await captureIndicatorBadgeDebugPrints(() async {
          await pumpIndicatorBadgeQaHarnessSettled(
            tester,
            const OneUiIndicatorBadge(size: 'xs', semanticsLabel: 'Online'),
          );
        });
        expect(
          prints.any((m) => m.toLowerCase().contains('xs')),
          isTrue,
          reason:
              'xs standalone use should emit a debug warning (xs is sub-pixel '
              'on high-DPI mobile). Recommend `s` minimum for standalone.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [IB-A11Y-005] High-contrast mode boosts dot contrast (MediaQuery.highContrast)',
      (tester) async {
        await tester.pumpWidget(MediaQuery(
          data: const MediaQueryData(highContrast: true),
          child: pumpIndicatorBadgeQaApp(
            const OneUiIndicatorBadge(
              appearance: 'warning',
              semanticsLabel: 'Caution',
            ),
          ),
        ));
        await tester.pumpAndSettle();
        final dot = indicatorBadgeDotDecoration(tester);
        expect(dot.border, isNotNull,
            reason: 'High-contrast mode must add a perceivable stroke boundary');
        expect(dot.border!.top.width, greaterThan(0));
      },
    );
  });

  // ===========================================================================
  // VISUAL regressions — tag `[visual]`
  // ===========================================================================

  group('[regression][visual] IndicatorBadge', () {
    testWidgetsAllPlatforms(
      '[visual] [IB-VIS-001] Overlay ring renders OUTSIDE the dot (web box-shadow parity)',
      (tester) async {
        // Build two: one ringed, one not. The ringed inner-dot diameter must
        // equal the unringed dot diameter.
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadgeOverlay(
            hostSide: 40,
            host: const ColoredBox(color: Color(0xFFCCCCCC)),
            indicator: const OneUiIndicatorBadge(
              size: 'm',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            indicatorSize: 'm',
            surfaceRingColor: const Color(0xFFFFFFFF),
            surfaceRingWidth: 2,
          ),
        );
        final ringedDot = tester.getSize(find.byType(OneUiIndicatorBadge));

        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadgeOverlay(
            hostSide: 40,
            host: const ColoredBox(color: Color(0xFFCCCCCC)),
            indicator: const OneUiIndicatorBadge(
              size: 'm',
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            indicatorSize: 'm',
          ),
        );
        final unringedDot = tester.getSize(find.byType(OneUiIndicatorBadge));

        // Bug: Border.all insets the inner dot. Expected: same size.
        expect(ringedDot.width, closeTo(unringedDot.width, 0.5),
            reason:
                'IB-VIS-001: ringed dot must match unringed dot diameter. '
                'Border.all currently shrinks the inner content area.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [IB-VIS-002] Overlay supports topStart / bottomStart anchors',
      (tester) async {
        // Currently the enum has only topEnd / bottomEnd. Document the gap.
        const supported = OneUiIndicatorBadgeOverlayAnchor.values;
        expect(supported.length, greaterThanOrEqualTo(4),
            reason:
                'IB-VIS-002: enum must cover all four corners. Currently only '
                'topEnd / bottomEnd — RTL/start-anchored cases break.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [IB-VIS-003] BoxShape.rectangle is used consistently (no circle/rect switch)',
      (tester) async {
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          const OneUiIndicatorBadge(size: 'xl', semanticsLabel: 'dot'),
        );
        // Inspect the inner DecoratedBox; expected shape must be rectangle
        // (with rounded corners), not circle, for cross-platform AA parity.
        final decoratedBox = tester.widget<DecoratedBox>(find.descendant(
          of: indicatorBadgeRootFinder(),
          matching: find.byType(DecoratedBox),
        ));
        final box = decoratedBox.decoration as BoxDecoration;
        expect(box.shape, BoxShape.rectangle,
            reason:
                'IB-VIS-003: use BoxShape.rectangle + BorderRadius.circular '
                'uniformly; avoid the circle/rectangle switch that creates '
                'AA discontinuity at radius == side/2.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [IB-VIS-004] Overlay layout extent includes ring (no sibling overlap)',
      (tester) async {
        const hostSide = 24.0;
        const gap = 1.0;

        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiIndicatorBadgeOverlay(
                hostSide: hostSide,
                host: const ColoredBox(color: Color(0xFFCCCCCC)),
                indicator: const OneUiIndicatorBadge(
                  size: 's',
                  appearance: 'positive',
                  semanticsLabel: 'Online',
                ),
                anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
                indicatorSize: 's',
                surfaceRingColor: const Color(0xFFFFFFFF),
                surfaceRingWidth: 2,
              ),
              const SizedBox(width: gap),
              const SizedBox(
                width: 8,
                height: 8,
                child: ColoredBox(color: Color(0xFF777777)),
              ),
            ],
          ),
        );

        final ringRender = tester.renderObject<RenderBox>(
          indicatorBadgeOverlaySurfaceRingFinder().first,
        );
        final siblingRender = tester.renderObject<RenderBox>(
          find.descendant(
            of: find.byType(Row),
            matching: find.byWidgetPredicate(
              (w) => w is ColoredBox && w.color == const Color(0xFF777777),
            ),
          ),
        );

        final ringTrailing =
            ringRender.localToGlobal(Offset(ringRender.size.width, 0)).dx;
        final siblingLeading = siblingRender.localToGlobal(Offset.zero).dx;

        expect(
          ringTrailing,
          lessThanOrEqualTo(siblingLeading + 0.5),
          reason:
              'IB-VIS-004: ring paint must not overlap the next sibling — '
              'overlay layout extent must reserve ring width on the end edge',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [IB-VIS-005] surfaceRingColor reads from Surface scope (not a frozen literal)',
      (tester) async {
        // Build an overlay with no explicit surfaceRingColor. Expected: the
        // overlay reads from the nearest Surface scope so dark-mode remaps.
        await pumpIndicatorBadgeQaHarnessSettled(
          tester,
          OneUiIndicatorBadgeOverlay(
            hostSide: 40,
            host: const ColoredBox(color: Color(0xFFCCCCCC)),
            indicator: const OneUiIndicatorBadge(
              appearance: 'positive',
              semanticsLabel: 'Online',
            ),
            anchor: OneUiIndicatorBadgeOverlayAnchor.bottomEnd,
            indicatorSize: 'm',
          ),
          darkMode: true,
        );
        expect(indicatorBadgeOverlaySurfaceRingFinder(), findsWidgets);
        final ringColor =
            (tester
                        .widget<DecoratedBox>(
                          indicatorBadgeOverlaySurfaceRingFinder().first,
                        )
                        .decoration
                    as BoxDecoration)
                .color!;
        expect(
          ringColor.computeLuminance(),
          lessThan(0.5),
          reason:
              'IB-VIS-005: surfaceRingColor must default to scoped Surface-Default '
              'so dark-mode remaps apply — not a frozen light literal.',
        );
      },
    );
  });
}
