/// Divider regression + parity-attribution suite.
///
/// Findings are split by WHERE the defect lives — every claim was cross-checked
/// against the web component (`packages/ui/src/components/Divider/`) and
/// reproduced against the real Flutter widget BEFORE the assertion was written
/// (probe values quoted per test):
///
///   [confirmed]  genuine Flutter component bugs — RED until the Flutter fix
///                lands. (None found — Divider is well-built; testId, auto→
///                neutral, attention tiers, alignment, and a11y exclusion all
///                match web.)
///   [debatable]  hardening / parity-leaning gaps — RED, lower confidence. Web
///                differs or the gap is a framework limitation → design call.
///   [parity]     GREEN proofs that Flutter matches the web contract.
///
/// NOTE ON THE SEPARATOR ROLE: web emits `role="separator"` + `aria-orientation`.
/// Flutter 3.44's `SemanticsRole` enum has NO `divider`/`separator` member
/// (verified against the engine enum), so the component falls back to a
/// container landmark + `explicitChildNodes`. This is a FRAMEWORK limitation,
/// not a fixable component bug, so it is documented (README) rather than asserted
/// RED — a test demanding an impossible role would never go green.
///
/// NO FALSE CONFIDENCE: every RED test asserts the CORRECT/parity behaviour and
/// fails because the component currently ships the gap. Offline (synthetic
/// harness) so the burn-down is reproducible without the Jio network.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import '../../support/components/divider_harness.dart';

Finder _identifierFinder(String id) => find.byWidgetPredicate(
      (w) => w is Semantics && w.properties.identifier == id,
    );

void main() {
  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web differs or the guard is missing
  // → design call.
  // ===========================================================================

  group('[regression][debatable] Divider', () {
    testWidgetsAllPlatforms(
        '[fn] [DIV-DEB-001] invalid appearance asserts in debug (web has TS union)',
        (tester) async {
      // PROBED: appearance:'destructive' → captured=false. The role falls through
      // resolveOneUiDividerState (auto→neutral, else passthrough) and the surface
      // resolver silently uses a fallback. Web blocks this at compile time
      // (TypeScript union). Flutter has no compile-time OR runtime guard.
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpDividerQaHarness(tester, const OneUiDivider(appearance: 'destructive'));
        expect(captured, isNotNull,
            reason:
                'unknown appearance must assert in debug to recover the type '
                'safety web gets from TypeScript. Currently silent.');
      } finally {
        FlutterError.onError = prev;
      }
    });

    // NOTE: DIV-DEB-002 (roundCaps default) was RECLASSIFIED. The Figma API table
    // marks `roundCaps: true` as the default (the highlighted chip), so Flutter's
    // default=true is CORRECT. Web's default=false is the divergence → that is a
    // WEB ticket, not a Flutter bug. The Flutter side is now proven GREEN by
    // DIV-PAR-009 below.
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web contract. PROOFS, not bugs.
  // ===========================================================================

  group('[parity] Divider — matches the web contract', () {
    testWidgetsAllPlatforms(
        '[fn] [DIV-PAR-001] testId reaches the AT tree via Semantics.identifier', (tester) async {
      // PROBED: testId:'div-x' → a Semantics node with identifier='div-x'.
      // Unlike Chip/CircularProgressIndicator (where testId is a dead/key-only
      // prop), Divider wires testId → Semantics(identifier:) — a PROOF it is
      // correct (one_ui_divider.dart:190-193).
      await pumpDividerQaHarness(tester, const OneUiDivider(testId: 'div-x'));
      withSemanticsHandle(tester, () {
        expect(_identifierFinder('div-x'), findsOneWidget);
        expect(tester.getSemantics(_identifierFinder('div-x')).identifier, 'div-x');
      });
    });

    test('[fn] [DIV-PAR-002] appearance=auto resolves to neutral (Divider.shared.ts)', () {
      expect(resolveOneUiDividerState(appearance: 'auto').resolvedAppearance, 'neutral');
      expect(resolveOneUiDividerState().resolvedAppearance, 'neutral');
    });

    testWidgetsAllPlatforms('[fn] [DIV-PAR-003] stroke px is s < m < l (0.5/1/1.5)', (tester) async {
      final px = <String, double>{};
      for (final s in ['s', 'm', 'l']) {
        await pumpDividerQaHarness(tester, OneUiDivider(size: s));
        px[s] = dividerStrokePx(tester, horizontal: true);
      }
      expect(px['s'], kQaDividerStrokePx['s']);
      expect(px['m'], kQaDividerStrokePx['m']);
      expect(px['l'], kQaDividerStrokePx['l']);
      expect(px['s']!, lessThan(px['m']!));
      expect(px['m']!, lessThan(px['l']!));
    });

    testWidgetsAllPlatforms(
        '[fn] [DIV-PAR-004] contentAlign center→2 lines, start/end→1 (web parity)', (tester) async {
      const expected = {'center': 2, 'start': 1, 'end': 1};
      for (final entry in expected.entries) {
        await pumpDividerQaHarness(
          tester,
          OneUiDivider(content: 'label', contentAlign: entry.key, child: 'OR'),
        );
        expect(dividerHiddenLineSegmentCount(tester), entry.value, reason: entry.key);
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [DIV-PAR-005] decorative line segments are excluded from semantics', (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'OR'),
      );
      withSemanticsHandle(tester, () {
        expect(dividerHiddenLineSegmentCount(tester), 2);
      });
    });

    test('[fn] [DIV-PAR-006] content normalisation (text→label, unknown→none)', () {
      expect(normalizeOneUiDividerContent('text'), 'label');
      expect(normalizeOneUiDividerContent('label'), 'label');
      expect(normalizeOneUiDividerContent('icon'), 'icon');
      expect(normalizeOneUiDividerContent('bogus'), 'none');
    });

    testWidgetsAllPlatforms(
        '[fn] [DIV-PAR-007] attention tiers paint distinct stroke colours', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(attention: 'low'));
      final low = dividerLineColor(tester);
      await pumpDividerQaHarness(tester, const OneUiDivider(attention: 'high'));
      final high = dividerLineColor(tester);
      expect(high, isNot(low));
    });

    testWidgetsAllPlatforms(
        '[a11y] [DIV-PAR-008] semanticsHint surfaces on the separator landmark', (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(semanticsHint: 'End of section'));
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'End of section');
      });
    });

    testWidgetsAllPlatforms(
        '[fn] [DIV-PAR-009] default roundCaps matches the Figma default (true)', (tester) async {
      // Figma API table marks `roundCaps: true` as the DEFAULT (highlighted chip).
      // PROBED: `const OneUiDivider()` → rounded=true → Flutter matches Figma.
      // (Web defaults to false — that is the cross-platform outlier and is filed
      // as a WEB ticket, not a Flutter bug. Source of truth = Figma, not web.)
      await pumpDividerQaHarness(tester, const OneUiDivider());
      expect(dividerLineIsRounded(tester), isTrue,
          reason: 'Figma default roundCaps=true; Flutter honours it.');
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] Divider', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter): none — Divider is solid.
      const confirmedFlutterBugs = 0;
      // Debatable hardening (RED, design call): DIV-DEB-001 (invalid appearance
      // assert). DIV-DEB-002 was reclassified — Figma default roundCaps=true, so
      // Flutter is correct and the divergence is a WEB ticket (see DIV-PAR-009).
      const debatable = 1;
      // Parity GREEN proofs (Flutter matches the Figma/web contract — NOT bugs):
      //   DIV-PAR-001..009 (009 = roundCaps default matches Figma).
      const parityProofs = 9;
      expect(confirmedFlutterBugs + debatable + parityProofs, 10);
    });
  });
}
