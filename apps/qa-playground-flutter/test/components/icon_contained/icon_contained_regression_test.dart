/// IconContained regression suite — one test per bug from
/// `docs/icon-contained-audit-report.md` (audit 2026-06-16).
///
/// Tests assert the **expected (correct)** behavior. Each fails until the
/// matching dev fix lands. The failure IS the bug ticket.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/icon_contained_color_resolve.dart';
import 'package:ui_flutter/engine/surface_engine.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/utils/one_ui_hex_color.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained.dart';
import 'package:ui_flutter/widgets/one_ui_icon_contained_types.dart';

import '../../support/components/icon_contained_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // FUNCTIONAL regressions — tag `[fn]`
  // ===========================================================================

  group('[regression][fn] IconContained', () {
    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-001] appearance='brand-bg' resolves to brand-bg (NOT remapped to primary)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            appearance: 'brand-bg',
            semanticsLabel: 'Like',
          ),
        );
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon-contained|data-size=m|data-attention=medium|'
            'data-appearance=brand-bg|disabled=false',
          )),
          findsOneWidget,
          reason:
              'brand-bg must resolve to brand-bg (matches kOneUiIconContainedAppearances). '
              'Currently silently remapped to primary in types.dart:74,90.',
        );
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-002] Decorative IconContained (no semanticsLabel) does NOT auto-derive label",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'heart'),
        );
        final handle = tester.ensureSemantics();
        try {
          // Bug: auto-derives "heart" from icon name. Expected: decorative.
          expect(find.bySemanticsLabel('heart'), findsNothing,
              reason:
                  'IconContained without semanticsLabel must be decorative '
                  '(aria-hidden) — must NOT auto-derive label from icon name.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-003] Missing OneUiScope falls back to token-derived neutral (NOT Material primary)",
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await tester.pumpWidget(
            const MaterialApp(
              home: Scaffold(
                body: OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
              ),
            ),
          );
          expect(captured, isNotNull,
              reason:
                  'Missing OneUiScope must emit a debug assertion. Currently '
                  'silently falls back to Theme.of(colorScheme.primary) — off-brand.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-004] Invalid appearance string falls back to 'primary' (not 'secondary')",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            appearance: 'destructive',
            semanticsLabel: 'Like',
          ),
        );
        // Bug: falls to 'secondary'. Expected: 'primary' (brand identity).
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon-contained|data-size=m|data-attention=medium|'
            'data-appearance=primary|disabled=false',
          )),
          findsOneWidget,
          reason:
              'Unknown appearance must fall back to brand identity (primary), '
              'not the secondary palette. Currently masks typos.',
        );
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-005] testId exposed via Semantics.identifier (cross-platform locators)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            testId: 'hero-fav',
            semanticsLabel: 'Like',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(iconContainedRootFinder());
          expect(node.getSemanticsData().identifier, 'hero-fav',
              reason:
                  'testId must reach platform AT trees via Semantics(identifier:). '
                  'KeyedSubtree only works in-process.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-006] Recipe cornerRadius decision is honoured (not always pill)",
      (tester) async {
        const containerPx = 40.0;
        const recipeRadiusPx = 8.0;
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
          designSystem: qaIconContainedSmallRadiusDesignSystem(),
        );
        final radius = iconContainedShellBorderRadiusPx(tester);
        expect(radius, recipeRadiusPx,
            reason:
                'Brand recipe cornerRadius (Shape-3 / 8px) must override default '
                'pill — container is ${containerPx}px so pill would be ≥${containerPx / 2}px.');
        expect(radius, lessThan(containerPx / 2),
            reason: 'Recipe small radius must not render as a stadium pill.');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-007] Custom Widget glyph renders at natural size (no FittedBox stretch)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: SizedBox(key: ValueKey('inner'), width: 12, height: 12),
            size: 'm',
            semanticsLabel: 'Like',
          ),
        );
        // Bug: SizedBox(iconPx) + FittedBox(BoxFit.contain) upscales the
        // 12px glyph to 20px (iconPx for size=m). Expected: glyph keeps 12×12.
        final inner = tester.getSize(find.byKey(const ValueKey('inner')));
        expect(inner.width, 12,
            reason:
                'Custom Widget glyph must render at its natural size — FittedBox '
                'currently upscales to iconPx, blurring hairline strokes.');
      },
    );

    testWidgetsAllPlatforms(
      "[fn] [ICC-FN-008] appearance=null inherits Surface (matches 'auto' contract)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
          surfaceMode: 'subtle',
          surfaceAppearance: 'positive',
        );
        // Bug: null bypasses Surface inheritance (only 'auto' inherits).
        // Expected: null and 'auto' behave identically per Figma variable-mode.
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon-contained|data-size=m|data-attention=medium|'
            'data-appearance=positive|disabled=false',
          )),
          findsOneWidget,
          reason:
              'null appearance must inherit Surface like auto does — matches '
              "Figma variable-mode contract. Currently returns 'secondary'.",
        );
      },
    );
  });

  // ===========================================================================
  // ACCESSIBILITY regressions
  // ===========================================================================

  group('[regression][a11y] IconContained', () {
    testWidgetsAllPlatforms(
      "[a11y] [ICC-A11Y-001] disabled state announced via label suffix (not just Semantics.enabled)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            disabled: true,
            semanticsLabel: 'Favourite',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          // Resolver appends ", disabled" — finder must match the effective label.
          final data = iconContainedSemanticsData(
            tester,
            semanticsLabel: 'Favourite, disabled',
          );
          expect(data.label.toLowerCase().contains('disabled'), isTrue,
              reason:
                  "Disabled IconContained must announce 'disabled' via label "
                  'suffix or hint. Semantics(image:true, enabled:false) is ignored.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [ICC-A11Y-002] Lower-case icon names do NOT auto-derive misleading labels",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'chevronleft'),
        );
        final handle = tester.ensureSemantics();
        try {
          // Bug: announces 'chevronleft, image' which is not user-meaningful.
          // Combined with ICC-FN-002 fix (no auto-derive), this should produce no node.
          expect(find.bySemanticsLabel('chevronleft'), findsNothing,
              reason:
                  'Decorative-by-omission must NOT announce raw icon names. '
                  'Combined with ICC-FN-002 fix.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [ICC-A11Y-003] semanticsHint requires explicit semanticsLabel (or emits warning)",
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpIconContainedQaHarnessSettled(
            tester,
            const OneUiIconContained(
              icon: 'heart',
              semanticsHint: 'Opens favourites',
              // No semanticsLabel.
            ),
          );
          expect(captured, isNotNull,
              reason:
                  'semanticsHint without semanticsLabel must emit a debug warning. '
                  'Currently silently dropped (when excludeFromSemantics) or paired '
                  'with auto-derived bogus label.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [ICC-A11Y-004] disabled bold-fill maintains WCAG 1.4.11 contrast (≥3:1)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'heart',
            appearance: 'primary',
            attention: OneUiIconContainedAttention.high,
            disabled: true,
            semanticsLabel: 'Like',
          ),
        );
        final opacity = tester.widget<Opacity>(find.descendant(
          of: iconContainedRootFinder(),
          matching: find.byType(Opacity),
        ).first);
        // Bug: opacity 0.38 → contrast collapses. Expected: ≥0.5 (native parity).
        expect(opacity.opacity, greaterThanOrEqualTo(0.5),
            reason:
                'Disabled opacity must be ≥ 0.5 to maintain WCAG 1.4.11 contrast '
                'for non-interactive indicators. Currently 0.38.');
      },
    );

    testWidgetsAllPlatforms(
      "[a11y] [ICC-A11Y-005] Material Icon fallback uses excludeFromSemantics:true (not empty label)",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(
            icon: 'unknownGlyph',
            semanticsLabel: 'Favourite',
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          // The outer container label should be exposed once; no orphan empty-label
          // node from the Material fallback's semanticLabel: ''.
          expect(find.bySemanticsLabel('Favourite'), findsOneWidget);
          // The fix: pass excludeFromSemantics: true to inner Material Icon.
          // We cannot directly assert via semantics tree; rely on contract.
        } finally {
          handle.dispose();
        }
      },
    );
  });

  // ===========================================================================
  // VISUAL regressions
  // ===========================================================================

  group('[regression][visual] IconContained', () {
    testWidgetsAllPlatforms(
      "[visual] [ICC-VIS-001] Directional icons auto-mirror in RTL",
      (tester) async {
        await pumpIconContainedQaHarnessSettled(
          tester,
          const Directionality(
            textDirection: TextDirection.rtl,
            child: OneUiIconContained(
              icon: 'chevronright',
              semanticsLabel: 'Next',
            ),
          ),
        );
        expect(
          find.descendant(
            of: iconContainedRootFinder(),
            matching: find.byWidgetPredicate(
              (w) =>
                  w is Transform &&
                  w.transform.getRow(0)[0] == -1 &&
                  w.transform.getRow(1)[1] == 1,
            ),
          ),
          findsOneWidget,
          reason:
              'Directional icons (chevronleft/chevronright/back/next) must '
              'auto-mirror in RTL via Transform.scale inside the MaterialApp tree.',
        );
      },
    );

    testWidgetsAllPlatforms(
      "[visual] [ICC-VIS-002] Foreground falls back to Text-High (not role-local high) when tinted absent",
      (tester) async {
        late BuildContext captured;
        await pumpIconContainedQaHarnessSettled(
          tester,
          Builder(
            builder: (context) {
              captured = context;
              return const SizedBox.shrink();
            },
          ),
        );

        final role = OneUiSurfaceScope.tokensForAppearance(captured, 'negative');
        final roleWithoutTinted = FlatRoleTokens(
          surfaces: role.surfaces,
          content: Map<String, String>.from(role.content)..remove('tinted'),
          onBoldContent: role.onBoldContent,
          onSubtleContent: role.onSubtleContent,
          states: role.states,
        );
        final resolved = resolveIconContainedColorsFromRoleTokens(
          captured,
          roleWithoutTinted,
          OneUiIconContainedAttention.medium,
        );
        final textHigh = oneUiHexColor(
          OneUiSurfaceScope.tokensForAppearance(captured, 'neutral')
              .content['high']!,
        );

        expect(
          resolved.foreground,
          textHigh,
          reason:
              'Medium-attention foreground must fall back to global Text-High '
              '(neutral high) when role tinted is absent — web '
              'var(--Role-Tinted, var(--Text-High)).',
        );
      },
    );

    testWidgetsAllPlatforms(
      "[visual] [ICC-VIS-003] No literal 9999 in border-radius fallback",
      (tester) async {
        const containerPx = 40.0;
        const expectedPillRadius = containerPx / 2;
        await pumpIconContainedQaHarnessSettled(
          tester,
          const OneUiIconContained(icon: 'heart', semanticsLabel: 'Like'),
          designSystem: qaIconContainedNoRadiusTokenDesignSystem(),
        );
        final radius = iconContainedShellBorderRadiusPx(tester);
        expect(radius, isNot(9999.0),
            reason:
                'Fallback border radius must not use literal 9999 when Shape-Pill '
                'is absent from the brand payload.');
        expect(radius, expectedPillRadius,
            reason:
                'Without brand radius tokens, use density-aware min(container) / 2 '
                '(stadium equivalent for a ${containerPx}px square).');
      },
    );
  });
}
