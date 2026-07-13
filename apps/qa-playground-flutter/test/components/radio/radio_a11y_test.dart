/// Radio accessibility QA tests — resolver units + real widget semantics.
///
/// Asserts the merged [SemanticsData] the platform AT actually receives (role
/// via hasCheckedState + isInMutuallyExclusiveGroup, label, hint, enabled),
/// never a bare findsOneWidget for an a11y claim.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_a11y.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

void main() {
  group('[a11y] resolveRadioAccessibilityLabel — RN label fallback chain', () {
    test('[a11y] prefers semanticsLabel over ariaLabel and visible label', () {
      expect(
        resolveRadioAccessibilityLabel(
          semanticsLabel: 'Screen reader',
          ariaLabel: 'Aria',
          label: 'Visible',
        ),
        'Screen reader',
      );
    });

    test('[a11y] prefers ariaLabel over visible label', () {
      expect(
        resolveRadioAccessibilityLabel(ariaLabel: 'Aria only', label: 'Visible'),
        'Aria only',
      );
    });

    test('[a11y] falls back to string child', () {
      expect(resolveRadioAccessibilityLabel(child: 'From child'), 'From child');
    });

    test('[a11y] returns null when nothing supplied', () {
      expect(resolveRadioAccessibilityLabel(), isNull);
    });
  });

  group('[a11y] getRadioAccessibilityProps — RN getRadioAccessibilityProps', () {
    test('[a11y] checked radio exposes selected + tappable', () {
      final a11y = getRadioAccessibilityProps(
        ariaLabel: 'Option',
        isDisabled: false,
        isReadOnly: false,
        isChecked: true,
      );
      expect(a11y.label, 'Option');
      expect(a11y.selected, isTrue);
      expect(a11y.canTap, isTrue);
      expect(a11y.exposeControl, isTrue);
    });

    test('[a11y] disabled blocks tap', () {
      final a11y = getRadioAccessibilityProps(
        ariaLabel: 'x',
        isDisabled: true,
        isReadOnly: false,
        isChecked: false,
      );
      expect(a11y.canTap, isFalse);
    });

    test('[a11y] readOnly exposes control but blocks tap', () {
      final a11y = getRadioAccessibilityProps(
        label: 'Locked',
        isDisabled: false,
        isReadOnly: true,
        isChecked: true,
      );
      expect(a11y.exposeControl, isTrue);
      expect(a11y.canTap, isFalse);
    });

    test('[a11y] aria-hidden collapses exposure', () {
      final a11y = getRadioAccessibilityProps(
        ariaLabel: 'Hidden',
        ariaHidden: true,
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
      );
      expect(a11y.hidden, isTrue);
      expect(a11y.exposeControl, isFalse);
    });

    test('[a11y] missing label defaults to "Radio"', () {
      final a11y = getRadioAccessibilityProps(
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
      );
      expect(a11y.label, 'Radio');
    });

    test('[a11y] forwards aria-describedby + hint', () {
      final a11y = getRadioAccessibilityProps(
        ariaLabel: 'x',
        ariaDescribedby: 'help-1',
        accessibilityHint: 'Select to choose',
        isDisabled: false,
        isReadOnly: false,
        isChecked: false,
      );
      expect(a11y.describedBy, 'help-1');
      expect(a11y.hint, 'Select to choose');
    });
  });

  group('[a11y] resolveOneUiRadioState — defaults + group inheritance', () {
    test('[a11y] defaults size=m, appearance=secondary, enabled', () {
      final s = resolveOneUiRadioState(isChecked: false);
      expect(s.resolvedSize, 'm');
      expect(s.resolvedAppearance, 'secondary');
      expect(s.isDisabled, isFalse);
      expect(s.isReadOnly, isFalse);
    });

    test('[a11y] auto resolves to secondary; explicit role wins', () {
      expect(resolveOneUiRadioState(appearance: 'auto', isChecked: false).resolvedAppearance,
          'secondary');
      expect(resolveOneUiRadioState(appearance: 'primary', isChecked: false).resolvedAppearance,
          'primary');
    });

    test('[a11y] group disabled/readOnly OR with option flags', () {
      final s = resolveOneUiRadioState(isChecked: false, groupDisabled: true);
      expect(s.isDisabled, isTrue);
      final r = resolveOneUiRadioState(isChecked: false, groupReadOnly: true);
      expect(r.isReadOnly, isTrue);
    });
  });

  group('[a11y] Radio widget — role + name + state', () {
    testWidgetsAllPlatforms('[a11y] checked option exposes the radio role (mutually exclusive)',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Accept')], defaultValue: 'a'),
      );
      withSemanticsHandle(tester, () {
        final d = radioSemanticsData(tester, 'Accept', checked: true);
        expect(d.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
        expect(d.hasFlag(SemanticsFlag.isChecked), isTrue);
        expect(d.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });

    testWidgetsAllPlatforms('[a11y] label becomes the accessible name', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Accept')]),
      );
      withSemanticsHandle(tester, () {
        expect(radioSemanticsFinder('Accept'), findsWidgets);
      });
    });

    testWidgetsAllPlatforms('[a11y] ariaLabel overrides the visible label', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Visible', ariaLabel: 'From aria')]),
      );
      withSemanticsHandle(tester, () {
        expect(radioSemanticsFinder('From aria'), findsWidgets);
        expect(radioSemanticsFinder('Visible'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] disabled marks semantics not enabled', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Off')], disabled: true),
      );
      expectRadioDisabled(tester, 'Off');
    });

    testWidgetsAllPlatforms('[a11y] readOnly stays enabled in semantics', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Locked')], readOnly: true),
      );
      expectRadioEnabled(tester, 'Locked');
    });

    testWidgetsAllPlatforms('[a11y] accessibilityHint surfaces in semantics', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'Hinted', accessibilityHint: 'Selects the plan'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final d = radioSemanticsData(tester, 'Hinted');
        expect(d.hint, 'Selects the plan');
      });
    });

    testWidgetsAllPlatforms('[a11y] aria-hidden excludes the control from the tree',
        (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([OneUiRadio(value: 'a', label: 'Hidden', ariaHidden: true)]),
      );
      withSemanticsHandle(tester, () {
        expect(radioSemanticsFinder('Hidden'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[a11y] checked semantics flip on selection', (tester) async {
      await pumpRadioQaHarness(
        tester,
        radioInGroup([
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ], defaultValue: 'a'),
      );
      expectRadioChecked(tester, 'B', checked: false);
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'B', checked: true);
    });
  });

  group('[a11y] RadioGroup — radiogroup container role', () {
    testWidgetsAllPlatforms('[a11y] group exposes the radiogroup role', (tester) async {
      await pumpRadioQaHarness(
        tester,
        OneUiRadioGroup(
          semanticsLabel: 'Choose a plan',
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      withSemanticsHandle(tester, () {
        final grp = find.descendant(
          of: radioGroupFinder(),
          matching: find.byWidgetPredicate(
              (w) => w is Semantics && w.properties.role == SemanticsRole.radioGroup),
        );
        expect(grp, findsOneWidget);
      });
    });
  });
}
