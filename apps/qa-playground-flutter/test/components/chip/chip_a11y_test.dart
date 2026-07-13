/// Chip accessibility QA tests — resolver units + real widget SemanticsData.
///
/// Probed contract: Chip exposes a button with a *selected* toggle state
/// (Semantics(button:true, selected:…)), enabled flips with `disabled`,
/// `semanticsHint` surfaces, and the label fallback is
/// semanticsLabel → ariaLabel → child.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_a11y.dart';

import '../../support/components/chip_harness.dart';

void main() {
  group('[a11y] resolveChipAccessibilityLabel — label fallback chain', () {
    test('[a11y] prefers semanticsLabel over ariaLabel and child', () {
      expect(
        resolveChipAccessibilityLabel(
          semanticsLabel: 'Screen reader',
          ariaLabel: 'Aria',
          child: 'Visible',
        ),
        'Screen reader',
      );
    });

    test('[a11y] prefers ariaLabel over child', () {
      expect(
        resolveChipAccessibilityLabel(ariaLabel: 'Aria only', child: 'Visible'),
        'Aria only',
      );
    });

    test('[a11y] falls back to the string child', () {
      expect(resolveChipAccessibilityLabel(child: 'Filter'), 'Filter');
    });

    test('[a11y] numeric child becomes its string form', () {
      expect(resolveChipAccessibilityLabel(child: 5), '5');
    });

    test('[a11y] blank explicit label falls through to child', () {
      expect(
        resolveChipAccessibilityLabel(semanticsLabel: '   ', child: 'Real'),
        'Real',
      );
    });
  });

  group('[a11y] resolveOneUiChipSemantics — toggle contract', () {
    test('[a11y] selected + enabled when not disabled', () {
      final a = resolveOneUiChipSemantics(
        child: 'A',
        selected: true,
        disabled: false,
      );
      expect(a.label, 'A');
      expect(a.selected, isTrue);
      expect(a.enabled, isTrue);
    });

    test('[a11y] disabled reports enabled=false', () {
      final a = resolveOneUiChipSemantics(
        child: 'A',
        selected: false,
        disabled: true,
      );
      expect(a.enabled, isFalse);
    });

    test('[a11y] empty label resolves to "Chip" fallback', () {
      final a = resolveOneUiChipSemantics(selected: false, disabled: false);
      expect(a.label, 'Chip');
    });

    test('[a11y] getChipAccessibilityProps maps accessibilityHint → hint', () {
      final a = getChipAccessibilityProps(
        child: 'A',
        accessibilityHint: 'toggles filter',
        selected: false,
        disabled: false,
      );
      expect(a.hint, 'toggles filter');
    });
  });

  group('[a11y] Chip widget — real semantics', () {
    testWidgetsAllPlatforms('[a11y] exposes a button with selected state', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Filter', selected: true));
      withSemanticsHandle(tester, () {
        final d = chipSemanticsData(tester, label: 'Filter');
        expect(d.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(d.hasFlag(SemanticsFlag.hasSelectedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isSelected), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaLabel becomes the accessible name', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'Visible', ariaLabel: 'From aria'));
      withSemanticsHandle(tester, () {
        expect(chipSemanticsLabel('From aria'), findsOneWidget);
        expect(chipSemanticsLabel('Visible'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] semanticsHint surfaces in semantics', (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(child: 'H', semanticsHint: 'Toggles the filter'),
      );
      withSemanticsHandle(tester, () {
        expect(chipSemanticsData(tester, label: 'H').hint, 'Toggles the filter');
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled marks not-enabled and blocks tap', (tester) async {
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

    testWidgetsAllPlatforms('[a11y] enabled chip reports isEnabled=true', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'On'));
      expectChipEnabled(tester, label: 'On');
    });

    testWidgetsAllPlatforms('[a11y] selected flips on tap (real semantics)', (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'T'));
      expectChipSelected(tester, selected: false, label: 'T');
      await tester.tap(find.text('T'));
      await tester.pumpAndSettle();
      expectChipSelected(tester, selected: true, label: 'T');
    });
  });
}
