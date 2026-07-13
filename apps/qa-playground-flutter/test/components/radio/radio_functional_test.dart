/// Radio functional QA tests — mirrors web `Radio.test.tsx` / RN QA playground.
///
/// Validates ACTUAL runtime behaviour: real single-selection state transitions
/// (inner-dot presence + merged SemanticsData), real callbacks, real box
/// geometry. Selection is owned by [OneUiRadioGroup]; a bare [OneUiRadio]'s
/// `size` wins over the group default (probed), so size tests set it on the
/// option directly.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

void main() {
  group('[smoke] Radio', () {
    testWidgetsAllPlatforms('[smoke] renders option label inside a group', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Option A')]),
      );
      expect(radioRootFinder(), findsOneWidget);
      expect(find.text('Option A'), findsOneWidget);
    });

    for (final size in ['s', 'm', 'l']) {
      testWidgetsAllPlatforms('[smoke] size=$size renders the resolved box', (tester) async {
        await pumpRadioQaHarness(
          tester,
          radioInGroup([OneUiRadio(value: 'a', size: size, label: 'A')]),
        );
        expect(radioBoxSizePx(tester), kQaRadioBoxPx[size]);
      });
    }

    testWidgetsAllPlatforms('[smoke] description renders below the label', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'Pro', description: 'Best for teams.'),
        ]),
      );
      expect(find.text('Pro'), findsOneWidget);
      expect(find.text('Best for teams.'), findsOneWidget);
      final labelY = tester.getTopLeft(find.text('Pro')).dy;
      final descY = tester.getTopLeft(find.text('Best for teams.')).dy;
      expect(descY, greaterThan(labelY));
    });
  });

  group('[functional] Radio — single selection (mutual exclusivity)', () {
    testWidgetsAllPlatforms('[fn] tapping an option selects exactly one (dot moves)',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], defaultValue: 'a'),
      );
      // Initially A is checked, B is not — verified by real inner-dot presence.
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(0)), isTrue);
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(1)), isFalse);

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();

      // Selection MOVED to B; A is now empty (exactly one selected).
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(0)), isFalse);
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(1)), isTrue);
    });

    testWidgetsAllPlatforms('[fn] semantics reflect mutual-exclusivity after selection',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], defaultValue: 'a'),
      );
      expectRadioChecked(tester, 'A', checked: true);
      expectRadioChecked(tester, 'B', checked: false);

      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'A', checked: false);
      expectRadioChecked(tester, 'B', checked: true);
    });

    testWidgetsAllPlatforms('[fn] onValueChange fires with the selected value', (tester) async {
      String? selected;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], defaultValue: 'a', onValueChange: (v) => selected = v),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(selected, 'b');
    });

    testWidgetsAllPlatforms('[fn] controlled group does not move selection without parent update',
        (tester) async {
      var calls = 0;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], value: 'a', onValueChange: (_) => calls++),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      // callback fires once, but the controlled value pins A as the selection.
      expect(calls, 1);
      expectRadioChecked(tester, 'A', checked: true);
      expectRadioChecked(tester, 'B', checked: false);
    });

    testWidgetsAllPlatforms('[fn] re-tapping the selected option is a no-op (stays selected)',
        (tester) async {
      var changes = 0;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], defaultValue: 'a', onValueChange: (_) => changes++),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      // Already selected — radio (unlike a deselectable group) stays checked and
      // does NOT fire onChange again.
      expectRadioChecked(tester, 'A', checked: true);
      expect(changes, 0);
    });
  });

  group('[functional] Radio — disabled / readOnly', () {
    testWidgetsAllPlatforms('[fn] group disabled blocks selection + dims', (tester) async {
      var changed = false;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
        ], disabled: true, onValueChange: (_) => changed = true),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      expect(radioOpacity(tester), lessThan(1.0));
    });

    testWidgetsAllPlatforms('[fn] readOnly blocks selection but keeps opacity 1.0', (tester) async {
      var changed = false;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'Locked'),
        ], readOnly: true, onValueChange: (_) => changed = true),
      );
      await tester.tap(find.text('Locked'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      expect(radioOpacity(tester), 1.0);
    });

    testWidgetsAllPlatforms('[fn] readOnly checked still renders the inner dot', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
        ], readOnly: true, defaultValue: 'a'),
      );
      expect(radioHasInnerDot(tester), isTrue);
    });

    testWidgetsAllPlatforms('[fn] per-option disabled blocks just that option', (tester) async {
      String? selected;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A', disabled: true),
          OneUiRadio(value: 'b', label: 'B'),
        ], onValueChange: (v) => selected = v),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(selected, isNull, reason: 'disabled option ignores taps');
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(selected, 'b');
    });
  });

  group('[functional] Radio — state persistence + rebuild sync', () {
    testWidgetsAllPlatforms('[fn] uncontrolled selection survives an unrelated rebuild',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              radioInGroup([
                OneUiRadio(value: 'a', label: 'A'),
                OneUiRadio(value: 'b', label: 'B'),
              ], defaultValue: 'a'),
              TextButton(onPressed: () => setState(() {}), child: const Text('noop')),
            ],
          ),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'B', checked: true);
      // Force an unrelated rebuild — selection must persist.
      await tester.tap(find.text('noop'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'B', checked: true);
      expectRadioChecked(tester, 'A', checked: false);
    });

    testWidgetsAllPlatforms('[fn] standalone radio (no group) toggles via defaultChecked',
        (tester) async {
      // Outside a group, _isChecked falls back to widget.checked ?? uncontrolled.
      bool? last;
      await pumpRadioQaHarness(
        tester,
        OneUiRadio(value: 'solo', label: 'Solo', onChange: (v) => last = v),
      );
      expectRadioChecked(tester, 'Solo', checked: false);
      await tester.tap(find.text('Solo'));
      await tester.pumpAndSettle();
      expect(last, isTrue);
      expectRadioChecked(tester, 'Solo', checked: true);
    });
  });

  group('[functional] Radio — orientation', () {
    testWidgetsAllPlatforms('[fn] horizontal group lays options on one row', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], orientation: 'horizontal'),
      );
      final aY = tester.getTopLeft(find.text('A')).dy;
      final bY = tester.getTopLeft(find.text('B')).dy;
      expect((aY - bY).abs(), lessThan(2), reason: 'horizontal Wrap keeps one row');
    });

    testWidgetsAllPlatforms('[fn] vertical group stacks options', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      final aY = tester.getTopLeft(find.text('A')).dy;
      final bY = tester.getTopLeft(find.text('B')).dy;
      expect(bY, greaterThan(aY));
    });
  });

  group('[functional] Radio — onPress passthrough', () {
    testWidgetsAllPlatforms('[fn] onPress fires alongside selection', (tester) async {
      var pressed = 0;
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A', onPress: () => pressed++),
        ]),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(pressed, 1);
    });
  });
}
