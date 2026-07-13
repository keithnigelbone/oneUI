/// RadioField functional QA tests — mirrors web `RadioField.test.tsx`.
///
/// Validates ACTUAL runtime behaviour across the three composition modes:
///   - integrated single (no children + label): lone control, deselect-on-reselect
///   - plain (one child)
///   - multi (two+ children): fieldset legend + RadioGroup
/// Real state transitions (inner-dot presence + SemanticsData), real callbacks.
library;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

void main() {
  group('[smoke] RadioField — composition modes', () {
    testWidgetsAllPlatforms('[smoke] integrated single renders a lone control beside the label',
        (tester) async {
      await pumpRadioQaHarness(tester, OneUiRadioField(label: 'Enable feature'));
      expect(radioFieldRootFinder(), findsOneWidget);
      expect(radioRootFinder(), findsOneWidget);
      expect(find.text('Enable feature'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[smoke] multi renders the label header + every option',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', children: [
          OneUiRadio(value: 'basic', label: 'Basic'),
          OneUiRadio(value: 'pro', label: 'Pro'),
        ]),
      );
      expect(find.text('Plan'), findsOneWidget);
      expect(find.text('Basic'), findsOneWidget);
      expect(find.text('Pro'), findsOneWidget);
      expect(radioRootFinder(), findsNWidgets(2));
    });

    testWidgetsAllPlatforms('[smoke] plain single child renders the option', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(children: [OneUiRadio(value: 'a', label: 'Only')]),
      );
      expect(find.text('Only'), findsOneWidget);
      expect(radioRootFinder(), findsOneWidget);
    });
  });

  group('[functional] RadioField — integrated single', () {
    testWidgetsAllPlatforms('[fn] tap fires onCheckedChange(true) + onValueChange(singleValue)',
        (tester) async {
      bool? checked;
      String? value;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          label: 'Enable',
          onCheckedChange: (v) => checked = v,
          onValueChange: (v) => value = v,
        ),
      );
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
      expect(value, 'on', reason: 'default singleOptionValue is "on"');
    });

    testWidgetsAllPlatforms('[fn] re-tap deselects (integrated single deselectOnReselect)',
        (tester) async {
      bool? checked;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Enable', onCheckedChange: (v) => checked = v),
      );
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(checked, isFalse, reason: 'integrated single toggles back off on reselect');
    });

    testWidgetsAllPlatforms('[fn] custom singleOptionValue is reported', (tester) async {
      String? value;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          label: 'Enable',
          singleOptionValue: 'yes',
          onValueChange: (v) => value = v,
        ),
      );
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(value, 'yes');
    });

    testWidgetsAllPlatforms('[fn] defaultChecked starts selected', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Enable', defaultChecked: true),
      );
      expect(radioHasInnerDot(tester), isTrue);
    });
  });

  group('[functional] RadioField — multi single-selection', () {
    testWidgetsAllPlatforms('[fn] onValueChange fires with the selected option', (tester) async {
      String? value;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          label: 'Plan',
          defaultValue: 'basic',
          onValueChange: (v) => value = v,
          children: [
            OneUiRadio(value: 'basic', label: 'Basic'),
            OneUiRadio(value: 'pro', label: 'Pro'),
          ],
        ),
      );
      await tester.tap(find.text('Pro'));
      await tester.pumpAndSettle();
      expect(value, 'pro');
    });

    testWidgetsAllPlatforms('[fn] exactly one option is selected after a tap', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', defaultValue: 'basic', children: [
          OneUiRadio(value: 'basic', label: 'Basic'),
          OneUiRadio(value: 'pro', label: 'Pro'),
        ]),
      );
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(0)), isTrue);
      await tester.tap(find.text('Pro'));
      await tester.pumpAndSettle();
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(0)), isFalse);
      expect(radioHasInnerDot(tester, within: radioRootFinder().at(1)), isTrue);
    });

    testWidgetsAllPlatforms('[fn] selection persists across an unrelated rebuild', (tester) async {
      await pumpRadioQaHarness(
        tester,
        StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              OneUiRadioField(label: 'Plan', children: [
                OneUiRadio(value: 'a', label: 'A'),
                OneUiRadio(value: 'b', label: 'B'),
              ]),
              TextButton(onPressed: () => setState(() {}), child: const Text('noop')),
            ],
          ),
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'B', checked: true);
      await tester.tap(find.text('noop'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'B', checked: true);
    });
  });

  group('[functional] RadioField — disabled / readOnly', () {
    testWidgetsAllPlatforms('[fn] disabled field blocks changes + dims', (tester) async {
      var changed = false;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          label: 'Plan',
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [OneUiRadio(value: 'a', label: 'Basic')],
        ),
      );
      await tester.tap(find.text('Basic'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      expect(radioFieldOpacity(tester), lessThan(1.0));
    });

    testWidgetsAllPlatforms('[fn] readOnly field blocks changes', (tester) async {
      var changed = false;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          label: 'Plan',
          readOnly: true,
          onValueChange: (_) => changed = true,
          children: [OneUiRadio(value: 'a', label: 'Basic')],
        ),
      );
      await tester.tap(find.text('Basic'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms('[fn] disabled propagates to every option', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', disabled: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expectRadioDisabled(tester, 'A');
      expectRadioDisabled(tester, 'B');
    });
  });

  group('[functional] RadioField — content slots', () {
    testWidgetsAllPlatforms('[fn] description renders', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', description: 'Pick exactly one.', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(find.text('Pick exactly one.'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] required renders the asterisk on the label', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', required: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(find.textContaining('*'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] infoIcon renders an info button beside the label',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', infoIcon: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] infoIcon without a label renders no icon (needs a label)',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(infoIcon: true, children: [OneUiRadio(value: 'a', label: 'A')]),
      );
      expect(find.byType(OneUiIconButton), findsNothing);
    });

    testWidgetsAllPlatforms('[fn] error string renders an InputFeedback message', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', error: 'Choose a plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      expect(find.text('Choose a plan'), findsOneWidget);
    });

    testWidgetsAllPlatforms('[fn] dynamicText + helperButton render the dynamic row',
        (tester) async {
      var helped = false;
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(
          label: 'Plan',
          dynamicText: '2 of 3 selected',
          helperButton: 'Reset',
          onHelperPressed: () => helped = true,
          children: [OneUiRadio(value: 'a', label: 'A')],
        ),
      );
      expect(find.text('2 of 3 selected'), findsOneWidget);
      expect(find.text('Reset'), findsOneWidget);
      await tester.tap(find.text('Reset'));
      await tester.pumpAndSettle();
      expect(helped, isTrue);
    });
  });

  group('[functional] RadioField — orientation + testId', () {
    testWidgetsAllPlatforms('[fn] horizontal lays options on one row', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(orientation: 'horizontal', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      final aY = tester.getTopLeft(find.text('A')).dy;
      final bY = tester.getTopLeft(find.text('B')).dy;
      expect((aY - bY).abs(), lessThan(2));
    });

    testWidgetsAllPlatforms('[fn] testId is locatable in-process via the keyed subtree',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioField(label: 'Plan', testId: 'plan-field', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(find.byKey(const ValueKey('plan-field')), findsOneWidget);
    });
  });
}
