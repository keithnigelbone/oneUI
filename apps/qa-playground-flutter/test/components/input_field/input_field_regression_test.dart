/// InputField regression + parity-attribution suite.
///
/// Findings split by WHERE the defect lives — every claim was probed against the
/// real Flutter widget BEFORE the assertion was written:
///
///   [confirmed]   genuine Flutter bugs — RED until fixed.
///   [debatable]   hardening / parity-leaning gaps — RED, lower confidence.
///   [parity]      GREEN proofs that Flutter matches the web contract.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_field.dart';
import 'package:ui_flutter/widgets/one_ui_input_field_types.dart';

import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';

import '../../support/components/input_field_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  // ===========================================================================
  // CONFIRMED — genuine Flutter bugs vs web contract. RED until fixed.
  // ===========================================================================

  group('[regression][confirmed] InputField', () {
    testWidgetsAllPlatforms(
        '[fn] [IFD-FN-001] valid field must render fieldErrorSlot anchor',
        (tester) async {
      // PROBED: no OneUiInputFeedback with fieldErrorSlot when !error && !feedback.
      // Web InputField.tsx:218-225 renders <InputFeedback fieldErrorSlot /> for
      // native Field.Error validation hooks.
      await pumpInputFieldQaHarness(
        tester,
        const OneUiInputField(
          id: 'email',
          label: 'Email',
          placeholder: 'email@example.com',
        ),
      );
      expect(
        find.byWidgetPredicate(
          (w) => w is OneUiInputFeedback && w.fieldErrorSlot,
        ),
        findsOneWidget,
        reason:
            'InputField must render fieldErrorSlot anchor when no error/feedback '
            '(InputField.tsx parity). CheckboxField already wires this pattern.',
      );
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web may share the gap.
  // ===========================================================================

  group('[regression][debatable] InputField', () {
    testWidgetsAllPlatforms(
        '[fn] [IFD-DEB-001] testId is exposed via Semantics.identifier',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Email',
          testId: 'qa-input-field',
          placeholder: 'email',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputFieldControlSemanticsData(tester);
        // PROBED: identifier == "" — testId only wraps KeyedSubtree (ValueKey).
        expect(data.identifier, 'qa-input-field',
            reason: 'testId must reach AT via Semantics(identifier:). '
                'Currently only ValueKey is wired on the field root.');
      });
    });

    testWidgets('[fn] [IFD-DEB-002] size s meets 44px touch target on Android',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpInputFieldQaHarness(
          tester,
          const OneUiInputField(label: 'Email', size: 's', placeholder: 'x'),
        );
        // PROBED: shell minHeight from synthetic DS pin (32px for f8).
        expect(inputFieldShellHeightPx(tester), greaterThanOrEqualTo(44),
            reason: 'WCAG 2.5.5 recommends ≥44px touch targets on mobile.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web contract.
  // ===========================================================================

  group('[parity] InputField — matches the web contract', () {
    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-008] required is exposed to assistive tech',
        (tester) async {
      // Investigated as IFD-A11Y-002: visual asterisk on label header AND
      // Semantics isRequired on inner control (forwarded by OneUiInput).
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Email', required: true),
      );
      expect(inputFieldHasRequiredAsterisk(tester), isTrue);
      withSemanticsHandle(tester, () {
        final data = inputFieldControlSemanticsData(tester);
        expect(data.hasFlag(SemanticsFlag.isRequired), isTrue);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-001] describedby IDs wire to control controlsNodes',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          id: 'email',
          label: 'Email',
          description: 'Work email only.',
          error: 'Required.',
          dynamicText: '0 / 64',
        ),
      );
      withSemanticsHandle(tester, () {
        final ids = inputFieldDescribedByNodeIds(tester);
        expect(ids, isNotNull);
        expect(ids, contains('email-description'));
        expect(ids, contains('email-feedback'));
        expect(ids, contains('email-dynamic'));
        expect(
          inputFieldSemanticsAnchor('email-description'),
          findsOneWidget,
        );
        expect(inputFieldSemanticsAnchor('email-feedback'), findsOneWidget);
        expect(inputFieldSemanticsAnchor('email-dynamic'), findsOneWidget);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-002] invalid / error drives validationResult on control',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Email', error: 'Invalid', id: 'email'),
      );
      withSemanticsHandle(tester, () {
        final data = inputFieldControlSemanticsData(tester);
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-003] ariaInvalid alone marks control invalid',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Email', ariaInvalid: true, id: 'email'),
      );
      withSemanticsHandle(tester, () {
        final data = inputFieldControlSemanticsData(tester);
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-004] required asterisk gated on label (web labelSuffix)',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'Has label', required: true),
      );
      expect(inputFieldHasRequiredAsterisk(tester), isTrue);

      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(required: true, description: 'no label'),
      );
      expect(inputFieldHasRequiredAsterisk(tester), isFalse);
    });

    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-005] infoIcon gated on label without labelSlot',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(label: 'With label', infoIcon: true),
      );
      expect(inputFieldHasInfoIcon(tester), isTrue);

      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(infoIcon: true, description: 'no label'),
      );
      expect(inputFieldHasInfoIcon(tester), isFalse);
    });

    testWidgetsAllPlatforms(
        '[parity] [IFD-PAR-006] accessibilityLabel wins over visible label',
        (tester) async {
      await pumpInputFieldJioHarnessSettled(
        tester,
        const OneUiInputField(
          label: 'Visible',
          accessibilityLabel: 'Screen reader name',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputFieldControlSemanticsData(tester);
        expect(data.label, 'Screen reader name');
      });
    });

    test(
        '[parity] [IFD-PAR-007] resolveOneUiInputFieldState gating matches widget',
        () {
      final state = resolveOneUiInputFieldState(
        label: 'Email',
        infoIcon: true,
        error: 'bad',
        dynamicText: '0/10',
        id: 'email',
      );
      expect(state.hasInfoIcon, isTrue);
      expect(state.hasFeedback, isTrue);
      expect(state.hasDynamicRow, isTrue);
      expect(state.isInvalid, isTrue);
      expect(state.feedbackSemanticsId, 'email-feedback');
      expect(state.descriptionSemanticsId, isNull);
      expect(state.dynamicTextSemanticsId, 'email-dynamic');
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] InputField', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter):
      //   IFD-FN-001 (fieldErrorSlot anchor missing).
      const confirmedFlutterBugs = 1;
      // Debatable hardening:
      //   IFD-DEB-001 (testId id), IFD-DEB-002 (touch target).
      const debatable = 2;
      const parityProofs = 8;
      expect(confirmedFlutterBugs + debatable + parityProofs, 11);
    });
  });
}
