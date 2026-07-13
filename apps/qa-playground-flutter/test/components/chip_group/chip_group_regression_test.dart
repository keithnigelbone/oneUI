/// ChipGroup regression + parity-attribution suite.
///
/// See `docs/chip-group-audit-report.md` and `docs/chip-group-flutter-bugs.md`.
///
///   [regression][confirmed] — genuine Flutter bugs; tests assert the CORRECT
///     contract and fail until the component fix lands.
///   [regression][debatable] — hardening gaps.
///   [parity] — GREEN proofs Flutter matches the web contract.
///
/// Repro a single bug:
///   flutter test test/components/chip_group/chip_group_regression_test.dart --name "[CHG-FN-001]"
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group_types.dart';

import '../../support/components/chip_group_harness.dart';

void main() {
  // ===========================================================================
  // CONFIRMED Flutter component bugs — fail until fixed.
  // ===========================================================================

  group('[regression][confirmed] ChipGroup', () {
    testWidgetsAllPlatforms(
        '[fn] [CHG-FN-001] testId is exposed via Semantics.identifier',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          testId: 'qa-group',
          ariaLabel: 'Filters',
          children: [OneUiChip(child: 'A', value: 'a')],
        ),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = chipGroupSemanticsData(tester, 'Filters');
        expect(data.identifier, 'qa-group',
            reason:
                'group testId must reach the AT tree via Semantics(identifier:). '
                'Web emits data-testid on the root.');
        expect(find.byKey(const ValueKey('qa-group')), findsOneWidget,
            reason: 'testId should also be locatable via ValueKey for in-process tests.');
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning.
  // ===========================================================================

  group('[regression][debatable] ChipGroup', () {
    testWidgetsAllPlatforms(
        '[fn] [CHG-DEB-001] invalid appearance asserts in debug (web has TS union)',
        (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpChipQaHarness(
          tester,
          OneUiChipGroup(
            appearance: 'destructive',
            defaultValue: const ['a'],
            children: [OneUiChip(child: 'A', value: 'a')],
          ),
        );
        expect(captured, isNotNull,
            reason:
                'unknown group appearance must assert in debug to recover the type '
                'safety web gets from TypeScript.');
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web contract.
  // ===========================================================================

  group('[parity] ChipGroup — matches the web contract', () {
    test('[parity] [CHG-PAR-001] selection engine: single / multi / required / max', () {
      expect(computeNextChipGroupValues(['a'], 'b', const OneUiChipGroupToggleOptions()), ['b']);
      expect(computeNextChipGroupValues(['a'], 'a', const OneUiChipGroupToggleOptions()), isEmpty);
      expect(
        computeNextChipGroupValues(['a'], 'a', const OneUiChipGroupToggleOptions(required: true)),
        isNull,
      );
      expect(
        computeNextChipGroupValues(['a'], 'b', const OneUiChipGroupToggleOptions(multiple: true)),
        ['a', 'b'],
      );
      expect(
        computeNextChipGroupValues(['a', 'b'], 'c',
            const OneUiChipGroupToggleOptions(multiple: true, maxSelections: 2)),
        isNull,
      );
    });

    testWidgets('[parity] [CHG-PAR-002] arrow keys rove focus between chips (linux)',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        await pumpChipQaHarness(
          tester,
          OneUiChipGroup(children: [
            OneUiChip(child: 'A', value: 'a', autofocus: true),
            OneUiChip(child: 'B', value: 'b'),
          ]),
        );
        await tester.pump();
        expect(FocusManager.instance.primaryFocus?.debugLabel, 'A');
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
        await tester.pump(const Duration(milliseconds: 50));
        expect(FocusManager.instance.primaryFocus?.debugLabel, 'B');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms('[parity] [CHG-PAR-003] disabled group blocks all children',
        (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [OneUiChip(child: 'A', value: 'a'), OneUiChip(child: 'B', value: 'b')],
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[parity] [CHG-PAR-004] group size propagates to child chips',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(size: 'l', children: [OneUiChip(child: 'A', value: 'a', selected: true)]),
      );
      expect(chipHeightPx(tester), 32);
    });

    testWidgetsAllPlatforms(
        '[parity] [CHG-PAR-005] containerType wrap→Wrap, inline→horizontal scroll',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(containerType: 'wrap', children: [OneUiChip(child: 'A', value: 'a')]),
      );
      expect(chipGroupWrapFinder(), findsOneWidget);
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(containerType: 'inline', children: [OneUiChip(child: 'A', value: 'a')]),
      );
      expect(chipGroupInlineScrollFinder(), findsOneWidget);
    });
  });
}
