/// Chip regression + parity-attribution suite.
///
/// See `docs/chip-audit-report.md` and `docs/chip-flutter-bugs.md`.
///
///   [regression][confirmed] — genuine Flutter bugs; tests assert the CORRECT
///     contract and fail until the component fix lands.
///   [regression][debatable] — hardening gaps (web shares some limitations).
///   [parity] — GREEN proofs Flutter matches the web contract.
///
/// Repro a single bug:
///   flutter test test/components/chip/chip_regression_test.dart --name "[CHP-FN-001]"
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';

import '../../support/components/chip_harness.dart';

void main() {
  // ===========================================================================
  // CONFIRMED Flutter component bugs — fail until fixed.
  // ===========================================================================

  group('[regression][confirmed] Chip', () {
    testWidgetsAllPlatforms(
        '[fn] [CHP-FN-001] testId is exposed via Semantics.identifier (cross-platform locators)',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(child: 'QA', testId: 'qa-chip'),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = chipSemanticsData(tester, label: 'QA');
        expect(data.identifier, 'qa-chip',
            reason:
                'testId must reach the platform AT tree via Semantics(identifier:). '
                'Web emits data-testid on the root button (Chip.tsx).');
        expect(find.byKey(const ValueKey('qa-chip')), findsOneWidget,
            reason: 'testId should also be locatable via ValueKey for in-process tests.');
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web SHARES some gaps → design call.
  // ===========================================================================

  group('[regression][debatable] Chip', () {
    testWidgetsAllPlatforms(
        '[a11y] [CHP-DEB-001] chip meets the 44px mobile touch target',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: 'Accept', size: 'm'),
        );
        final chrome = chipHeightPx(tester);
        final hitTarget = chipHitTargetHeightPx(tester);
        expect(hitTarget, greaterThanOrEqualTo(44),
            reason: 'mobile touch target should be ≥ 44px (WCAG 2.5.5). Expand '
                'hit-test padding on touch platforms without resizing chrome.');
        expect(chrome, lessThan(44),
            reason:
                'mobile touch target should be ≥ 44px (WCAG 2.5.5). Add hit-test '
                'padding on touch platforms while keeping compact chrome.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[fn] [CHP-DEB-002] invalid appearance asserts in debug (web has TS union)',
        (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpChipQaHarness(
          tester,
          OneUiChip(child: 'X', appearance: 'destructive', selected: true),
        );
        expect(captured, isNotNull,
            reason:
                'unknown appearance must assert in debug to recover the type '
                'safety web gets from TypeScript.');
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web contract.
  // ===========================================================================

  group('[parity] Chip — matches the web contract', () {
    testWidgets(
        '[parity] [CHP-PAR-001] Space activates the focused chip (keyboard a11y)',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        var selected = false;
        await pumpChipQaHarness(
          tester,
          StatefulBuilder(
            builder: (c, setState) => OneUiChip(
              ariaLabel: 'kb',
              autofocus: true,
              selected: selected,
              onSelectedChange: (v, [d]) => setState(() => selected = v),
            ),
          ),
        );
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pump(const Duration(milliseconds: 50));
        expect(selected, isTrue);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets(
        '[parity] [CHP-PAR-001b] Enter activates the focused chip (keyboard a11y)',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        var selected = false;
        await pumpChipQaHarness(
          tester,
          StatefulBuilder(
            builder: (c, setState) => OneUiChip(
              ariaLabel: 'kb',
              autofocus: true,
              selected: selected,
              onSelectedChange: (v, [d]) => setState(() => selected = v),
            ),
          ),
        );
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pump(const Duration(milliseconds: 50));
        expect(selected, isTrue);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    test(
        '[parity] [CHP-PAR-002] appearance=auto resolves to secondary (Chip.shared.ts)',
        () {
      final auto = resolveOneUiChipState(appearance: 'auto', isSelected: true);
      expect(auto.resolvedAppearance, 'secondary');
    });

    test(
        '[parity] [CHP-PAR-003] attention high/medium/low → bold/subtle/ghost variant',
        () {
      expect(
        resolveOneUiChipState(attention: 'high', isSelected: true)
            .resolvedVariant,
        'bold',
      );
      expect(
        resolveOneUiChipState(attention: 'medium', isSelected: true)
            .resolvedVariant,
        'subtle',
      );
      expect(
        resolveOneUiChipState(attention: 'low', isSelected: true)
            .resolvedVariant,
        'ghost',
      );
    });

    testWidgetsAllPlatforms(
        '[parity] [CHP-PAR-004] disabled blocks toggle and reports not-enabled',
        (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Off',
          disabled: true,
          onSelectedChange: (v, [d]) => changed = true,
        ),
      );
      expectChipDisabled(tester, label: 'Off');
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });
}
