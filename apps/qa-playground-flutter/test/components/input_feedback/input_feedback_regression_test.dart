/// InputFeedback regression + parity-attribution suite.
///
/// Findings split by WHERE the defect lives — probed against the real widget
/// BEFORE the assertion was written:
///
///   [confirmed]  genuine Flutter bugs — RED until fixed.
///   [debatable]  hardening / parity-leaning gaps — RED, lower confidence.
///   [parity]     GREEN proofs that Flutter matches the web contract.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback.dart';
import 'package:ui_flutter/widgets/one_ui_input_feedback_types.dart';

import '../../support/components/input_feedback_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputFeedbackIconsLoaded();
  });

  // ===========================================================================
  // DEBATABLE — hardening. Web may share the gap → design call.
  // ===========================================================================

  group('[regression][debatable] InputFeedback', () {
    testWidgetsAllPlatforms(
        '[fn] [IFB-DEB-001] testId is not exposed via Semantics.identifier',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          feedbackMessage: 'Error',
          testId: 'qa-input-feedback',
        ),
      );
      withSemanticsHandle(tester, () {
        // PROBED: SemanticsData.identifier == "" — testId only wraps ValueKey.
        final data = inputFeedbackSemanticsData(tester, label: 'Error');
        expect(data.identifier, 'qa-input-feedback',
            reason:
                'testId should reach the platform AT tree via Semantics(identifier:). '
                'Currently only ValueKey is wired.');
      });
    });
  });

  // ===========================================================================
  // PARITY — GREEN proofs matching web InputFeedback.tsx contract.
  // ===========================================================================

  group('[regression][parity] InputFeedback', () {
    testWidgetsAllPlatforms(
        '[a11y] [IFB-A11Y-001] negative maps to alert role (assertive parity)',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
            feedbackMessage: 'Password must be at least 8 characters.'),
      );
      withSemanticsHandle(tester, () {
        // PROBED: Flutter maps web aria-live=assertive to SemanticsRole.alert
        // (liveRegion cannot co-exist with alert role on one node).
        expect(
          inputFeedbackSemanticsData(
            tester,
            label: 'Password must be at least 8 characters.',
          ).role,
          SemanticsRole.alert,
        );
        expect(inputFeedbackHasLiveRegion(tester), isFalse);
      });
    });

    for (final variant in [
      OneUiInputFeedbackVariant.positive,
      OneUiInputFeedbackVariant.warning,
      OneUiInputFeedbackVariant.informative,
    ]) {
      testWidgetsAllPlatforms(
          '[a11y] [IFB-A11Y-001] ${variant.wireValue} maps to polite live region',
          (tester) async {
        await pumpInputFeedbackJioHarnessSettled(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: 'Status for ${variant.wireValue}',
          ),
        );
        withSemanticsHandle(tester, () {
          // PROBED: status variants emit liveRegion=true (polite) without alert role.
          final data = inputFeedbackSemanticsData(
            tester,
            label: 'Status for ${variant.wireValue}',
          );
          expect(data.role, isNot(SemanticsRole.alert));
          expect(inputFeedbackHasLiveRegion(tester), isTrue);
          expect(data.hasFlag(SemanticsFlag.isLiveRegion), isTrue);
        });
      });
    }

    test('[parity] resolveOneUiInputFeedbackState default attention is low',
        () {
      expect(
        resolveOneUiInputFeedbackState(feedbackMessage: 'x').resolvedAttention,
        OneUiInputFeedbackAttention.low,
      );
    });

    test('[parity] negative resolver assigns alert + assertive live region',
        () {
      final state = resolveOneUiInputFeedbackState(feedbackMessage: 'Err');
      expect(state.role, OneUiInputFeedbackRole.alert);
      expect(state.liveRegion, OneUiInputFeedbackLiveRegion.assertive);
    });

    test('[parity] positive resolver assigns status + polite live region', () {
      final state = resolveOneUiInputFeedbackState(
        variant: OneUiInputFeedbackVariant.positive,
        feedbackMessage: 'Saved',
      );
      expect(state.role, OneUiInputFeedbackRole.status);
      expect(state.liveRegion, OneUiInputFeedbackLiveRegion.polite);
    });

    testWidgetsAllPlatforms('[parity] empty message renders SizedBox.shrink',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(feedbackMessage: ''),
      );
      expect(inputFeedbackIsRendered(tester), isFalse);
    });

    testWidgetsAllPlatforms(
        '[parity] custom icon alone does not render without message',
        (tester) async {
      await pumpInputFeedbackJioHarnessSettled(
        tester,
        const OneUiInputFeedback(
          customIconName: 'lock',
        ),
      );
      expect(inputFeedbackIsRendered(tester), isFalse);
    });

    testWidgetsAllPlatforms('[parity] each variant renders its default icon',
        (tester) async {
      for (final variant in OneUiInputFeedbackVariant.values) {
        await pumpInputFeedbackJioHarnessSettled(
          tester,
          OneUiInputFeedback(
            variant: variant,
            feedbackMessage: 'Icon ${variant.wireValue}',
          ),
        );
        expect(inputFeedbackIconFinder(), findsOneWidget);
      }
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] InputFeedback', () {
    test('[meta] attribution counts', () {
      // Debatable hardening (RED, design call):
      //   IFB-DEB-001 (testId → Semantics.identifier).
      const debatable = 1;
      // Parity GREEN proofs (Flutter matches web — NOT bugs):
      //   IFB-A11Y-001 (alert vs polite live region) × 4 variants,
      //   resolver defaults, empty message, customIcon gate, default icons.
      const parityProofs = 9;
      expect(debatable + parityProofs, 10);
    });
  });
}
