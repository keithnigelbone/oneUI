/// Input regression + parity-attribution suite.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';
import 'package:ui_flutter/widgets/one_ui_input_types.dart';

import '../../support/components/input_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
    await ensureInputIconsLoaded();
  });

  // ===========================================================================
  // CONFIRMED — genuine Flutter bugs vs web contract. RED until fixed.
  // ===========================================================================

  group('[regression][confirmed] Input', () {
    testWidgetsAllPlatforms(
        '[a11y] [INP-A11Y-001] readOnly must not mark Semantics enabled=false',
        (tester) async {
      // PROBED: readOnly:true → Semantics isEnabled=false AND readOnly=true.
      // Web HTML readonly inputs remain focusable/enabled; only editing is blocked.
      // one_ui_input_a11y.dart:287 sets enabled: !isDisabled && !isReadOnly (RN parity).
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Read only', readOnly: true, ariaLabel: 'Name'),
      );
      withSemanticsHandle(tester, () {
        final data = inputControlSemanticsData(tester);
        expect(data.hasFlag(SemanticsFlag.isEnabled), isTrue,
            reason:
                'readOnly controls must stay enabled in AT (web readonly attribute). '
                'Use Semantics(readOnly: true) without disabling the node.');
        expect(data.hasFlag(SemanticsFlag.isReadOnly), isTrue);
      });
    });

    testWidgetsAllPlatforms(
        '[fn] [INP-FN-001] readOnly shell tap must focus the control',
        (tester) async {
      // PROBED: tap on shell → focusNode.hasFocus stays false.
      // Web readonly inputs focus on click (Input.module.css readOnly cursor).
      // one_ui_input.dart:405-407 disables shell onTap when readOnly.
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Read', readOnly: true),
      );
      await tester.tap(inputShellFinder());
      await tester.pumpAndSettle();
      expect(
        inputTextField(tester).focusNode?.hasFocus ?? false,
        isTrue,
        reason: 'readOnly inputs must focus on shell tap (web parity).',
      );
    });

    testWidgetsAllPlatforms(
        '[fn] [INP-FN-002] name prop must reach the native control',
        (tester) async {
      // PROBED: OneUiInput accepts `name` but TextField subtree has no form identity.
      // Web Input.tsx passes name to the <input> for native form submission.
      await pumpInputQaHarness(
        tester,
        const OneUiInput(
          name: 'email',
          ariaLabel: 'Email',
          placeholder: 'email',
        ),
      );
      final input = tester.widget<OneUiInput>(inputRootFinder());
      expect(input.name, 'email');
      // Flutter TextField has no `name` — must wire via Semantics or platform channel.
      expect(
        inputTextField(tester).restorationId,
        'email',
        reason:
            'name must map to a platform form identity (restorationId / semantics). '
            'Currently ignored after one_ui_input.dart:61 declaration.',
      );
    });

    testWidgetsAllPlatforms(
        '[vis] [INP-VIS-001] readOnly must suppress hover background tint',
        (tester) async {
      // PROBED: hover changes shell fill on readOnly (web .readOnly:hover transparent).
      // input_color_resolve.dart:162-176 applies hover when !isDisabled only.
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Read', readOnly: true),
      );
      final idleFill = inputShellDecoration(tester).color;
      final center = tester.getCenter(inputShellFinder());
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: center);
      await gesture.moveTo(center);
      await tester.pump();
      expect(
        inputShellDecoration(tester).color,
        idleFill,
        reason: 'readOnly shell must not apply hover fill (web Input.module.css).',
      );
    });
  });

  group('[regression][debatable] Input', () {
    testWidgetsAllPlatforms(
        '[fn] [INP-DEB-001] testId is not exposed via Semantics.identifier',
        (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          testId: 'qa-input',
          ariaLabel: 'Email',
          placeholder: 'email',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputControlSemanticsData(tester);
        // PROBED: identifier == "" — testId only wraps KeyedSubtree.
        expect(data.identifier, 'qa-input',
            reason:
                'testId must reach AT via Semantics(identifier:). '
                'Currently only ValueKey is wired.');
      });
    });

    testWidgets('[fn] [INP-DEB-002] size xs meets 44px touch target on Android',
        (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpInputQaHarness(
          tester,
          const OneUiInput(size: OneUiInputSize.xs, placeholder: 'xs'),
        );
        // PROBED: shell minHeight from synthetic DS (28px for f6).
        expect(inputShellHeightPx(tester), greaterThanOrEqualTo(44),
            reason: 'WCAG 2.5.5 recommends ≥44px touch targets on mobile.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  group('[regression][parity] Input', () {
    test('[parity] [INP-PAR-001] native xs resolves to f6 not coerced to f8', () {
      expect(resolveOneUiInputNumericSize(OneUiInputSize.xs), 6);
    });

    test('[parity] [INP-PAR-002] brand-bg parent appearance falls back to secondary', () {
      expect(
        resolveOneUiInputAppearance(
          OneUiInputAppearance.auto,
          parentAppearance: 'brand-bg',
        ),
        'secondary',
      );
    });

    testWidgets('[parity] [INP-PAR-003] readOnly stays enabled distinct from disabled',
        (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(value: 'Read', readOnly: true),
      );
      final field = inputTextField(tester);
      expect(field.enabled, isTrue);
      expect(field.readOnly, isTrue);
    });

    testWidgets('[parity] [INP-PAR-004] aria-invalid surfaces on errorHighlight',
        (tester) async {
      await pumpInputJioHarnessSettled(
        tester,
        const OneUiInput(
          ariaLabel: 'Email',
          errorHighlight: true,
          value: 'bad',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputControlSemanticsData(tester);
        expect(data.validationResult, SemanticsValidationResult.invalid);
      });
    });
  });

  group('[regression][meta] Input', () {
    test('[meta] burn-down counter', () {
      const confirmed = 4;
      const debatable = 2;
      const parity = 4;
      expect(confirmed + debatable, 6,
          reason: 'Update burn-down when INP-* bugs are fixed.');
      expect(parity, greaterThan(0));
    });
  });
}
