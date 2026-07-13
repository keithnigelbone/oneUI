/// InputDynamicText regression + parity-attribution suite.
///
/// Findings split by WHERE the defect actually lives — probed against the real
/// widget BEFORE the assertion was written:
///
///   [confirmed]  genuine Flutter bugs — RED until fixed.
///   [debatable]  hardening / parity-leaning gaps — RED, lower confidence.
///   [parity]     GREEN proofs that Flutter matches the web contract.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text_types.dart';

import '../../support/components/input_dynamic_text_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputDynamicTextIconsLoaded();
  });

  // ===========================================================================
  // DEBATABLE — hardening. Web may share the gap → design call.
  // ===========================================================================

  group('[regression][debatable] InputDynamicText', () {
    testWidgetsAllPlatforms(
        '[fn] [IDT-DEB-001] testId is not exposed via Semantics.identifier',
        (tester) async {
      await pumpInputDynamicTextJioHarnessSettled(
        tester,
        const OneUiInputDynamicText(
          testId: 'qa-dynamic-text',
          content: 'Helper',
          end: 'Clear',
          endAriaLabel: 'Clear field',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        // PROBED: identifier == "" — testId only wraps KeyedSubtree.
        expect(data.identifier, 'qa-dynamic-text',
            reason: 'testId must reach AT via Semantics(identifier:). '
                'Currently only ValueKey is wired.');
      });
    });
  });

  // ===========================================================================
  // PARITY — GREEN proofs matching web InputDynamicText.tsx contract.
  // ===========================================================================

  group('[regression][parity] InputDynamicText', () {
    test('[parity] [IDT-PAR-001] body size steps s→XS m→S l→M', () {
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.s), 'XS');
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.m), 'S');
      expect(oneUiInputDynamicTextBodySize(OneUiInputLabelSize.l), 'M');
    });

    test('[parity] [IDT-PAR-002] trailing button f-steps 8/10/12', () {
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.s), 8);
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.m), 10);
      expect(oneUiInputDynamicTextButtonSizeStep(OneUiInputLabelSize.l), 12);
    });

    test('[parity] [IDT-PAR-003] empty content+end is isEmpty', () {
      final s = resolveOneUiInputDynamicTextState();
      expect(s.isEmpty, isTrue);
      expect(s.trailingOnly, isFalse);
    });

    testWidgets('[parity] [IDT-PAR-004] trailingOnly end-only row',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(end: 'Help'),
      );
      expect(
        resolveOneUiInputDynamicTextState(end: 'Help').trailingOnly,
        isTrue,
      );
      expect(inputDynamicTextHelperButtonFinder(), findsOneWidget);
      expect(find.text('Help'), findsOneWidget);
    });

    testWidgets('[parity] [IDT-PAR-005] onEndClick fires on tap',
        (tester) async {
      var hits = 0;
      await pumpInputDynamicTextQaHarness(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          onEndClick: () => hits++,
        ),
      );
      await tester.tap(inputDynamicTextHelperInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    testWidgets('[parity] [IDT-PAR-006] polite aria-live on leading copy',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: '12 / 100 characters',
          ariaLive: OneUiInputDynamicTextAriaLive.polite,
        ),
      );
      withSemanticsHandle(tester, () {
        expect(inputDynamicTextLiveRegionFinder(), findsOneWidget);
      });
    });

    testWidgets('[parity] [IDT-PAR-007] disabled helper button not enabled',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          end: 'Clear',
          endAriaLabel: 'Clear field',
          disabled: true,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.hasEnabledState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isFalse);
      });
    });
  });

  group('[regression][meta] InputDynamicText', () {
    test('[meta] burn-down counter', () {
      const confirmed = 0;
      const debatable = 1;
      const parity = 7;
      expect(confirmed + debatable, 1,
          reason: 'Update burn-down when IDT-* bugs are fixed.');
      expect(parity, greaterThan(0));
    });
  });
}
