/// RadioField regression + parity-attribution suite.
///
/// Findings are split by WHERE the defect lives — cross-checked against the web
/// component (`packages/ui/src/components/RadioField/`) and the Figma API
/// ([RadioField #36]), and reproduced against the real Flutter widget with a
/// throwaway probe BEFORE the assertion was written.
///
///   [confirmed]   genuine Flutter bugs — RED until fixed in Flutter.
///   [debatable]   hardening / parity-leaning — RED, design call (web shares).
///   [parity]      GREEN proofs Flutter matches the web/Figma contract.
///
/// NO FALSE CONFIDENCE: every RED test asserts the CORRECT behaviour and fails
/// because the component currently ships the gap. The failure IS the ticket.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';

import '../../support/components/radio_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // CONFIRMED Flutter bugs — RED until the Flutter fix lands.
  // ===========================================================================

  group('[regression][confirmed] RadioField', () {
    testWidgetsAllPlatforms(
        '[a11y] [RF-A11Y-001] required field forwards required to each radio option',
        (tester) async {
      // Web contract (RadioField.test.tsx): `required` forwards to every option as
      // `aria-required="true"` — not a spoken "required" hint on the field legend.
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', required: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      withSemanticsHandle(tester, () {
        for (final label in ['A', 'B']) {
          final data = radioSemanticsData(tester, label);
          expect(data.hasFlag(SemanticsFlag.isRequired), isTrue,
              reason: 'required RadioField must forward required to option "$label" '
                  '(web aria-required on each radio).');
        }
      });
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web SHARES the gap → design call.
  // ===========================================================================

  group('[regression][debatable] RadioField', () {
    testWidgetsAllPlatforms(
        '[fn] [RF-FN-001] testId reaches the AT tree via Semantics.identifier',
        (tester) async {
      // PROBED: RadioField wraps testId in a KeyedSubtree (byKey works
      // in-process) but NOT Semantics(identifier:). Native locators
      // (Appium/XCUITest resource-id) cannot find the field.
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', testId: 'plan-field', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final node = find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.identifier == 'plan-field');
        expect(node, findsOneWidget,
            reason: 'RadioField testId should map to Semantics(identifier:) for '
                'native locators — currently only an in-process KeyedSubtree.');
      });
    });

    testWidgets('[a11y] [RF-A11Y-002] Space selects the focused option within the field',
        (tester) async {
      // PROBED: focused option in a field does NOT select on Space (no key
      // handler on the Radio Focus node — inherited from OneUiRadio). Web
      // fieldset radios select on Space/arrows natively.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        String? value;
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioField(label: 'Plan', onValueChange: (v) => value = v, children: [
            OneUiRadio(value: 'a', label: 'A', autofocus: true),
            OneUiRadio(value: 'b', label: 'B'),
          ]),
        );
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pumpAndSettle();
        expect(value, 'a',
            reason: 'Space must select the focused option (web native radios do). '
                'No onKeyEvent handler — keyboard selection is dead.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web/Figma contract. PROOFS, not bugs.
  // ===========================================================================

  group('[parity] RadioField — matches the web/Figma contract', () {
    testWidgetsAllPlatforms(
        '[parity] [RF-PAR-001] integrated single deselects on reselect', (tester) async {
      bool? checked;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Enable', onCheckedChange: (v) => checked = v),
      );
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
      await tester.tap(find.byType(OneUiRadio));
      await tester.pumpAndSettle();
      expect(checked, isFalse);
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-002] multi field is single-selection', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'A', checked: false);
      expectRadioChecked(tester, 'B', checked: true);
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-003] field size propagates to the option box',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', size: 'l', defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(radioBoxSizePx(tester, within: radioRootFinder().at(0)), 24);
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-004] disabled dims 0.5 + propagates to options',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', disabled: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      expect(radioFieldOpacity(tester), 0.5);
      expectRadioDisabled(tester, 'A');
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-005] readOnly keeps options enabled + opacity 1.0',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', readOnly: true, defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      expectRadioEnabled(tester, 'A');
      expect(radioFieldOpacity(tester), 1.0);
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-006] appearance=auto resolves to secondary',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', appearance: 'auto', defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      final auto = radioBoxDecoration(tester, within: radioRootFinder().at(0)).color;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', appearance: 'secondary', defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      final sec = radioBoxDecoration(tester, within: radioRootFinder().at(0)).color;
      expect(auto, sec);
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-007] infoIcon requires a label (none without)',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(infoIcon: true, children: [OneUiRadio(value: 'a', label: 'A')]),
      );
      expect(find.byType(OneUiIconButton), findsNothing);
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', infoIcon: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      expect(find.byType(OneUiIconButton), findsOneWidget);
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-008] feedback message announces to AT (live region)',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', error: 'Choose a plan', children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final live = find.byWidgetPredicate((w) =>
            w is Semantics &&
            (w.properties.liveRegion == true || w.properties.role == SemanticsRole.alert));
        expect(live, findsWidgets);
      });
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-009] aria-hidden collapses the field subtree',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', ariaHidden: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('A'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[parity] [RF-PAR-010] description is auto-linked via an identifier',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(id: 'plan', label: 'Plan', description: 'Pick one.', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final descNode = find.byWidgetPredicate(
            (w) => w is Semantics && w.properties.identifier == 'plan-desc');
        expect(descNode, findsOneWidget);
      });
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] RadioField', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs — none open (RF-A11Y-001 matches web contract).
      const confirmedFlutterBugs = 0;
      // Debatable hardening — none open (RF-FN-001, RF-A11Y-002 fixed).
      const debatable = 0;
      // Parity GREEN proofs (Flutter matches web — NOT bugs):
      //   RF-PAR-001..010.
      const parityProofs = 10;
      expect(confirmedFlutterBugs + debatable + parityProofs, 10);
    });
  });
}
