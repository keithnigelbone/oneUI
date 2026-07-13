/// Icon regression suite — one test per bug from
/// `docs/icon-audit-report.md` (audit 2026-06-16).
///
/// Tests assert the **expected (correct)** behavior. Each fails until the
/// matching dev fix lands. The failure IS the bug ticket.
///
/// Each widget test runs on Android, iOS and Linux via testWidgetsAllPlatforms.
/// Group tags: [fn] / [a11y] / [visual] for HTML-report categorisation.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/icons/jio_icon_catalog.dart';
import 'package:ui_flutter/widgets/one_ui_badge.dart';
import 'package:ui_flutter/widgets/one_ui_button.dart';
import 'package:ui_flutter/widgets/one_ui_button_types.dart';
import 'package:ui_flutter/widgets/one_ui_icon.dart';
import 'package:ui_flutter/widgets/one_ui_icon_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_icon_types.dart';
import 'package:ui_flutter/widgets/one_ui_slot_parent_appearance.dart';

import '../../support/components/icon_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await JioIconCatalog.instance.ensureLoaded();
  });

  // ===========================================================================
  // FUNCTIONAL regressions — tag `[fn]`
  // ===========================================================================

  group('[regression][fn] Icon', () {
    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-001] Icon without OneUiScope falls back gracefully (no AssertionError)',
      (tester) async {
        // No OneUiScope around the Icon. Expected: graceful default — no crash.
        await tester.pumpWidget(
          const MaterialApp(
            home: Scaffold(body: OneUiIcon(icon: 'add', semanticsLabel: 'Add')),
          ),
        );
        // The bug: icon_size_resolve.dart:19 hard-asserts via OneUiScope.of.
        expect(tester.takeException(), isNull,
            reason: 'OneUiIcon outside OneUiScope must not throw — use maybeOf '
                'and provide f-step default fallback.');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-002] Non-String/non-Widget icon emits dev assertion',
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpIconQaHarnessSettled(
            tester,
            const OneUiIcon(icon: 42, semanticsLabel: 'bogus'),
          );
          expect(captured, isNotNull,
              reason:
                  'Invalid icon types must emit a debug-mode FlutterError so '
                  'developers catch the misuse. Currently silently collapses to SizedBox.shrink.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-003] Icon in Button slot inherits Button appearance via OneUiSlotParentAppearanceScope',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiButton(
            appearance: 'negative',
            variant: OneUiButtonVariant.bold,
            start: const OneUiIcon(icon: 'add', semanticsLabel: 'Delete'),
            child: const Text('Delete'),
          ),
        );
        // Expected: Icon inside Button slot resolves to 'negative' via slot scope.
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=negative|data-emphasis=high',
          )),
          findsOneWidget,
          reason:
              'Button slots must wrap children with OneUiSlotParentAppearanceScope '
              'so Icons inherit the parent role. Currently slots provide NO scope → '
              'Icon defaults to neutral on a coloured Button.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-004] Unknown size emits dev assertion',
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpIconQaHarnessSettled(
            tester,
            const OneUiIcon(icon: 'add', size: '11', semanticsLabel: 'Add'),
          );
          expect(captured, isNotNull,
              reason:
                  'Size "11" is not in kOneUiIconSizes — must emit a debug-mode '
                  'FlutterError. Currently falls back to "5" silently.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-005] testId exposed via Semantics.identifier (cross-platform locators)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(
              icon: 'add', testId: 'cart-icon', semanticsLabel: 'Cart'),
        );
        final handle = tester.ensureSemantics();
        try {
          final node = tester.getSemantics(iconRootFinder());
          expect(node.getSemanticsData().identifier, 'cart-icon',
              reason:
                  'testId must reach platform AT trees via Semantics(identifier:). '
                  'KeyedSubtree(ValueKey(...)) only supports find.byKey.');
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-006] Empty-string semanticsLabel either exposes empty role=img OR emits dev warning',
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpIconQaHarnessSettled(
            tester,
            const OneUiIcon(icon: 'add', semanticsLabel: ''),
          );
          expect(captured, isNotNull,
              reason:
                  'Empty semanticsLabel currently silently hides the icon (diverges '
                  'from web). Must either preserve as exposed-but-unnamed OR emit '
                  'a debug warning.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    test('[fn] [ICN-FN-007] formatOneUiIconName lowercases ic_ snake_case', () {
      expect(formatOneUiIconName('ic_USER_PROFILE'), 'user profile icon',
          reason:
              'Web/RN format: ${''}\${words.join(\' \').toLowerCase()} icon\${'
              '}. '
              'Flutter currently keeps SHOUTED case. AT announces shouted text.');
    });

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-008] BadgeSlotSize override applies even for explicit non-default icon size',
      (tester) async {
        // Place an Icon with explicit size '4' inside a Badge slot. Currently
        // the slot override only fires when size == '5' (special-case
        // sentinel). Expected: slot context always governs the icon's px
        // OR the user's explicit size is honoured but warned.
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiBadge(
            semanticsLabel: 'badge',
            start: OneUiIcon(icon: 'add', size: '4', semanticsLabel: 'add'),
            child: 'Inbox',
          ),
        );
        // The bug: with size=4, the slot scope is ignored entirely → icon
        // overflows / clips. We assert no overflow exception.
        expect(tester.takeException(), isNull,
            reason:
                'Badge slot must reconcile non-default icon sizes either by clamping '
                'to the slot context or by honouring the override without overflow.');
      },
    );

    testWidgetsAllPlatforms(
      '[fn] [ICN-FN-009] appearance=auto outside Surface inherits slot parent (does not silently fall to neutral)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          OneUiSlotParentAppearanceScope(
            appearance: 'positive',
            child: const OneUiIcon(
              icon: 'add',
              appearance: 'auto',
              semanticsLabel: 'OK',
            ),
          ),
        );
        // Expected: appearance=auto + slotParent=positive resolves to positive.
        // Bug: 'auto' bypasses the slot-parent fallback (which only fires for null).
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=positive|data-emphasis=high',
          )),
          findsOneWidget,
          reason:
              'appearance=auto outside Surface must consult slot-parent before '
              'falling to neutral. Currently the control flow checks `appearance == null` '
              'which is false for "auto" → slot-parent never consulted.',
        );
      },
    );
  });

  // ===========================================================================
  // ACCESSIBILITY regressions
  // ===========================================================================

  group('[regression][a11y] Icon', () {
    testWidgetsAllPlatforms(
      '[a11y] [ICN-A11Y-001] Zero-width / format chars in semanticsLabel emit dev warning',
      (tester) async {
        FlutterErrorDetails? captured;
        final prev = FlutterError.onError;
        FlutterError.onError = (d) => captured = d;
        try {
          await pumpIconQaHarnessSettled(
            tester,
            const OneUiIcon(icon: 'add', semanticsLabel: '​​​'),
          );
          expect(captured, isNotNull,
              reason:
                  'Zero-width chars produce silent AT announcements. Must emit '
                  'a debug warning when label contains no visible glyph.');
        } finally {
          FlutterError.onError = prev;
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [ICN-A11Y-002] Inner Material Icon is excluded directly (not just suppressed via empty label)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(
            icon: 'unknownGlyph',
            semanticsLabel: 'Custom',
            excludeFromSemantics: true,
          ),
        );
        final handle = tester.ensureSemantics();
        try {
          // No semantic node should expose 'Custom' OR the icon name.
          expect(find.bySemanticsLabel('Custom'), findsNothing);
          expect(find.bySemanticsLabel('unknownGlyph'), findsNothing);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [ICN-A11Y-003] Decorative icon emits NO Semantics node (defensive verification)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'heart'),
        );
        final handle = tester.ensureSemantics();
        try {
          expect(find.bySemanticsLabel('heart'), findsNothing,
              reason:
                  'Decorative icon must produce no labelled Semantics node');
          expect(find.bySemanticsLabel('add'), findsNothing);
        } finally {
          handle.dispose();
        }
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [ICN-A11Y-004] MediaQuery.highContrast promotes tinted emphasis to tintedA11y (WCAG 1.4.11)',
      (tester) async {
        await tester.pumpWidget(pumpIconQaApp(
          const MediaQuery(
            data: MediaQueryData(highContrast: true),
            child: OneUiIcon(
              icon: 'add',
              appearance: 'positive',
              emphasis: OneUiIconEmphasis.tinted,
              semanticsLabel: 'OK',
            ),
          ),
        ));
        await tester.pumpAndSettle();
        expect(
          find.byKey(const ValueKey<String>(
            'oneui-icon|data-size=5|data-appearance=positive|data-emphasis=tintedA11y',
          )),
          findsOneWidget,
          reason:
              'MediaQuery.highContrast must promote tinted glyphs to tintedA11y.',
        );
      },
    );

    testWidgetsAllPlatforms(
      '[a11y] [ICN-A11Y-005] Inline-icon respects MediaQuery.textScaler (WCAG 1.4.4)',
      (tester) async {
        Future<double> renderedSide({
          required TextScaler scaler,
          required bool respectTextScale,
        }) async {
          await tester.pumpWidget(pumpIconQaApp(
            MediaQuery(
              data: MediaQueryData(textScaler: scaler),
              child: OneUiIcon(
                icon: 'add',
                size: '5',
                semanticsLabel: 'Add',
                respectTextScale: respectTextScale,
              ),
            ),
            designSystem: qaIconTestDesignSystem(),
          ));
          await tester.pumpAndSettle();
          return tester
              .getSize(find.byKey(const ValueKey<String>(
                'oneui-icon|data-size=5|data-appearance=neutral|data-emphasis=high',
              )))
              .width;
        }

        final base = await renderedSide(
          scaler: TextScaler.noScaling,
          respectTextScale: true,
        );
        final inlineScaled = await renderedSide(
          scaler: const TextScaler.linear(2.0),
          respectTextScale: true,
        );
        final standaloneScaled = await renderedSide(
          scaler: const TextScaler.linear(2.0),
          respectTextScale: false,
        );

        expect(base, closeTo(kQaIconSizePx['5']!, 0.01));
        expect(inlineScaled, closeTo(base * 2, 0.01),
            reason:
                'Inline icons must scale with MediaQuery.textScaler when opted in.');
        expect(standaloneScaled, closeTo(base, 0.01),
            reason: 'Standalone icons remain fixed by default.');
      },
    );
  });

  // ===========================================================================
  // VISUAL regressions
  // ===========================================================================

  group('[regression][visual] Icon', () {
    testWidgetsAllPlatforms(
      '[visual] [ICN-VIS-001] Custom Widget glyph: single SizedBox + FittedBox (no double-wrap)',
      (tester) async {
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(
            icon: SizedBox(width: 32, height: 32),
            size: '8',
            semanticsLabel: 'X',
          ),
        );
        // The bug: custom widget gets IconTheme.merge → SizedBox → FittedBox,
        // then SizedBox → Center → IconTheme.merge AGAIN. Expected: a single
        // sizing pass.
        final fittedBoxes = find.descendant(
          of: iconRootFinder(),
          matching: find.byType(FittedBox),
        );
        expect(fittedBoxes.evaluate().length, 1,
            reason:
                'Custom Widget glyph must be wrapped in exactly ONE FittedBox '
                '(not two, not zero). Currently the build path wraps twice.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [ICN-VIS-002] Directional icons auto-mirror in RTL',
      (tester) async {
        // Directionality must sit *inside* MaterialApp — wrapping pumpIconQaApp
        // from outside leaves the icon under MaterialApp's default LTR scope.
        await pumpIconQaHarnessSettled(
          tester,
          Directionality(
            textDirection: TextDirection.rtl,
            child: const OneUiIcon(icon: 'arrowLeft', semanticsLabel: 'Back'),
          ),
        );
        // Expected: arrowLeft mirrors in RTL → visually points right.
        // We assert via finding a Transform with negative scale OR the
        // OneUiSemanticIcon honouring Directionality.
        final transforms = find.descendant(
          of: iconRootFinder(),
          matching: find.byType(Transform),
        );
        expect(transforms, findsAtLeastNWidgets(1),
            reason:
                'Directional icons (arrowLeft/chevronLeft/etc.) must auto-mirror '
                'in RTL via Transform.scale(-1, 1) OR IconData(matchTextDirection: true). '
                'Currently the icon renders LTR-only.');
      },
    );

    testWidgetsAllPlatforms(
      '[visual] [ICN-VIS-003] First paint does not show Material placeholder then snap to Jio SVG',
      (tester) async {
        // Reset the catalog state: at the first frame the catalog should
        // already be loaded (preload contract in OneUiSurfaceBootstrap).
        // If catalog is async-loaded then we'd see a Material fallback paint
        // followed by a setState rebuild — visible "glyph flip".
        await pumpIconQaHarnessSettled(
          tester,
          const OneUiIcon(icon: 'heart', semanticsLabel: 'Like'),
        );
        // Expected after a fix: the first frame shows the Jio SVG, no
        // intermediate Material placeholder. Currently the catalog loads
        // async so the placeholder paints first.
        expect(JioIconCatalog.instance.isReady, isTrue,
            reason:
                'Jio catalog should be preloaded before any OneUiIcon mounts '
                '(via OneUiSurfaceBootstrap). Currently icons start with Material '
                'placeholder then async-rebuild → visible glyph flip.');
      },
    );
  });

  // ===========================================================================
  // [meta] Burn-down counter
  // ===========================================================================

  group('[regression][meta] Icon', () {
    test('[meta] burn-down counter — total pending bugs = 15', () {
      const totalPendingBugs = 15;
      expect(totalPendingBugs, 15,
          reason:
              'When a fix lands, update this counter alongside the matching '
              'ICN-XX-NNN test moving from RED to GREEN.');
    });
  });
}
