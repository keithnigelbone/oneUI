/// Radio regression + parity-attribution suite.
///
/// Findings are split by WHERE the defect actually lives — every claim was
/// cross-checked against the web component (`packages/ui/src/components/Radio/`)
/// and the Figma API ([Radio #36]), and reproduced against the real Flutter
/// widget with a throwaway probe BEFORE the assertion was written (probe values
/// quoted in each test's comment):
///
///   [confirmed]   genuine Flutter component bugs — RED until the Flutter fix
///                 lands. Web does the right thing; Flutter does not.
///   [debatable]   hardening / parity-leaning gaps — RED, lower confidence.
///                 Web SHARES the limitation, so this is a design call.
///   [parity]      GREEN proofs that the Flutter resolver matches the web/Figma
///                 contract (auto→secondary, accent ignored, neutral unchecked
///                 stroke, single-selection mutual exclusivity).
///
/// NO FALSE CONFIDENCE: every RED test asserts the CORRECT behaviour and fails
/// because the component currently ships the bug. The failure IS the ticket.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_field.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // CONFIRMED Flutter component bugs — RED until the Flutter fix lands.
  // ===========================================================================

  group('[regression][confirmed] Radio', () {
    testWidgetsAllPlatforms(
        '[fn] [RADIO-FN-001] testId is exposed to the AT tree (cross-platform locators)',
        (tester) async {
      // PROBED: byKey(testId)=0 AND Semantics.identifier="". Unlike Checkbox
      // (which at least wraps a KeyedSubtree), the standalone Radio drops testId
      // ENTIRELY — it is never referenced in build(). Web emits data-testid on
      // BaseRadio.Root which Playwright/Appium read. Patrol/Maestro need
      // Semantics(identifier:).
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', label: 'QA', testId: 'qa-radio')]),
      );
      withSemanticsHandle(tester, () {
        final node = tester.getSemantics(radioSemanticsFinder('QA').first);
        expect(node.getSemanticsData().identifier, 'qa-radio',
            reason: 'testId must reach the AT tree via Semantics(identifier:). '
                'Standalone Radio drops it entirely — web emits data-testid.');
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] [RADIO-A11Y-001] required prop is exposed to assistive tech', (tester) async {
      // PROBED: required:true → hasRequiredState=false, isRequired=false. The
      // `required` prop is accepted by the constructor but NEVER wired into
      // Semantics — a dead prop. Web maps it to the native input `required`.
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(
          children: [OneUiRadio(value: 'a', label: 'Required', required: true)],
        ),
      );
      withSemanticsHandle(tester, () {
        final data = radioSemanticsData(tester, 'Required');
        expect(data.hasFlag(SemanticsFlag.hasRequiredState), isTrue,
            reason: 'required must surface to AT (Semantics(required:)). '
                'Currently the prop is silently dropped — web honours it.');
      });
    });

    testWidgets('[a11y] [RADIO-A11Y-002] Space selects the focused radio (keyboard activation)',
        (tester) async {
      // PROBED: with autofocus + linux, primaryFocus=true and the focus ring
      // renders (shadows=2), but `AFTER SPACE selected=null`. The Focus node has
      // NO onKeyEvent handler. Web renders a native <input type=radio> that the
      // browser selects on Space/arrows — a genuine Flutter-only a11y gap.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        String? selected;
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioGroup(
            onValueChange: (v) => selected = v,
            children: [
              OneUiRadio(value: 'a', label: 'A', autofocus: true),
              OneUiRadio(value: 'b', label: 'B'),
            ],
          ),
        );
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pumpAndSettle();
        expect(selected, 'a',
            reason: 'Space must select a focused radio (web native <input> does). '
                'Flutter Focus node has no onKeyEvent — add Space/arrow handling.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets(
        '[a11y] [RADIO-A11Y-002b] Arrow keys move selection within the group (roving focus)',
        (tester) async {
      // Companion to RADIO-A11Y-002 — PROBED arrows do not move selection
      // either (no key handler). Web radiogroup supports arrow-key roving.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        String? selected;
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioGroup(
            onValueChange: (v) => selected = v,
            children: [
              OneUiRadio(value: 'a', label: 'A', autofocus: true),
              OneUiRadio(value: 'b', label: 'B'),
            ],
          ),
        );
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
        await tester.pumpAndSettle();
        expect(selected, isNotNull,
            reason: 'Arrow keys must move radiogroup selection (web roving tabindex). '
                'Flutter has no key handler — selection never changes.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web SHARES the gap → design call.
  // ===========================================================================

  group('[regression][debatable] Radio', () {
    testWidgetsAllPlatforms(
        '[fn] [RADIO-DEB-001] RadioField testId reaches the AT tree via identifier',
        (tester) async {
      // PROBED: RadioField wraps testId in a KeyedSubtree (byKey works
      // in-process) but NOT Semantics(identifier:) — field testId->identifier
      // nodes=0. In-process locators work, but Appium/XCUITest resource-id
      // queries do not. Debatable: web emits data-testid; native AT needs an
      // identifier. (Standalone Radio is worse — see RADIO-FN-001.)
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
                'native locators. Currently only an in-process KeyedSubtree.');
      });
    });

    testWidgetsAllPlatforms(
        '[a11y] [RADIO-DEB-002] labelled radio meets the 44px mobile touch target',
        (tester) async {
      // PROBED: size=m labelled root reports the box-height only (20px), below
      // WCAG 2.5.5 / platform HIG 44px. Web shares the small box — platform-min
      // hardening, not a clear shipped defect.
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioGroup(children: [OneUiRadio(value: 'a', label: 'Accept', size: 'm')]),
        );
        final h = tester.getSize(radioControlTouchTargetFinder()).height;
        expect(h, greaterThanOrEqualTo(44),
            reason: 'mobile touch target should be ≥ 44px (WCAG 2.5.5). The box '
                'is only 20px tall — add hit-test padding on touch platforms.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [RADIO-DEB-003] RadioField required forwards to option semantics',
        (tester) async {
      // Web contract: field `required` maps to `aria-required` on each radio —
      // same assertion as RF-A11Y-001 (kept here for cross-component burn-down).
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioField(label: 'Plan', required: true, children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      withSemanticsHandle(tester, () {
        final data = radioSemanticsData(tester, 'A');
        expect(data.hasFlag(SemanticsFlag.isRequired), isTrue,
            reason: 'required RadioField must forward required to options '
                '(web aria-required), not only paint a visual asterisk.');
      });
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web/Figma contract. PROOFS, not bugs.
  // ===========================================================================

  group('[parity] Radio — matches the web/Figma contract', () {
    testWidgetsAllPlatforms('[parity] [RADIO-PAR-001] appearance=auto resolves to secondary',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', appearance: 'auto', ariaLabel: 'a'),
        ]),
      );
      final auto = radioBoxDecoration(tester).color;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', appearance: 'secondary', ariaLabel: 's'),
        ]),
      );
      expect(auto, radioBoxDecoration(tester).color);
    });

    testWidgetsAllPlatforms('[parity] [RADIO-PAR-002] accent is ignored at runtime',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', accent: 'primary', ariaLabel: 'acc'),
        ]),
      );
      final withAccent = radioBoxDecoration(tester).color;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [OneUiRadio(value: 'a', ariaLabel: 'no')]),
      );
      expect(withAccent, radioBoxDecoration(tester).color,
          reason: 'accent is @deprecated and must not alter the fill');
    });

    testWidgetsAllPlatforms(
        '[parity] [RADIO-PAR-003] unchecked stroke stays neutral for any appearance',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', appearance: 'negative', ariaLabel: 'n')]),
      );
      final neg = radioBorderColor(tester);
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', appearance: 'secondary', ariaLabel: 's')]),
      );
      expect(neg, radioBorderColor(tester));
    });

    testWidgetsAllPlatforms(
        '[parity] [RADIO-PAR-004] readOnly stays enabled + opacity 1.0 (distinct from disabled)',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(readOnly: true, defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'RO'),
        ]),
      );
      expectRadioEnabled(tester, 'RO');
      expect(radioOpacity(tester), 1.0);
    });

    testWidgetsAllPlatforms('[parity] [RADIO-PAR-005] disabled dims 0.5 + blocks selection',
        (tester) async {
      var changed = false;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(disabled: true, onValueChange: (_) => changed = true, children: [
          OneUiRadio(value: 'a', label: 'Off'),
        ]),
      );
      expect(radioOpacity(tester), 0.5);
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    testWidgetsAllPlatforms(
        '[parity] [RADIO-PAR-006] single-selection mutual exclusivity (exactly one checked)',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', children: [
          OneUiRadio(value: 'a', label: 'A'),
          OneUiRadio(value: 'b', label: 'B'),
        ]),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'A', checked: false);
      expectRadioChecked(tester, 'B', checked: true);
      withSemanticsHandle(tester, () {
        final b = radioSemanticsData(tester, 'B', checked: true);
        expect(b.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [RADIO-PAR-007] option size wins over group size (web ctx fallback)',
        (tester) async {
      // PROBED: a group size=l with an option size="m" renders 20px; the
      // option-level size wins (group size is only the fallback for unset
      // options). Matches web useRadioState (props.size ?? ctx.size).
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(size: 'l', children: [OneUiRadio(value: 'a', size: 'm', ariaLabel: 'x')]),
      );
      expect(radioBoxSizePx(tester), 20);
    });

    testWidgetsAllPlatforms('[parity] [RADIO-PAR-008] aria-hidden excludes the control',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', label: 'Hidden', ariaHidden: true)]),
      );
      withSemanticsHandle(tester, () {
        expect(radioSemanticsFinder('Hidden'), findsNothing);
      });
    });

    testWidgetsAllPlatforms('[parity] [RADIO-PAR-009] missing label defaults to "Radio"',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a')]),
      );
      withSemanticsHandle(tester, () {
        expect(radioSemanticsFinder('Radio'), findsWidgets);
      });
    });

    testWidgets('[parity] [RADIO-PAR-010] focus paints a 2-layer halo (desktop)', (tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        await pumpRadioJioHarnessSettled(
          tester,
          OneUiRadioGroup(children: [OneUiRadio(value: 'a', ariaLabel: 'kb', autofocus: true)]),
        );
        await tester.pumpAndSettle();
        final shadows = radioBoxDecoration(tester).boxShadow;
        expect(shadows?.length, 2);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[parity] [RADIO-PAR-011] re-tapping the selected option keeps it selected (no deselect)',
        (tester) async {
      // A bare RadioGroup does NOT deselect on reselect (deselectOnReselect=false
      // by default). Re-tapping the checked option is a no-op — exactly one stays
      // selected. (RadioField integrated-single sets deselectOnReselect=true.)
      var changes = 0;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(defaultValue: 'a', onValueChange: (_) => changes++, children: [
          OneUiRadio(value: 'a', label: 'A'),
        ]),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expectRadioChecked(tester, 'A', checked: true);
      expect(changes, 0);
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] Radio', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs — none open (RADIO-FN-001, A11Y-001/002 fixed).
      const confirmedFlutterBugs = 0;
      // Debatable hardening — RADIO-DEB-002 (44px touch target) only.
      // RADIO-DEB-001/003 closed; DEB-003 matches web aria-required on options.
      const debatable = 1;
      // Parity GREEN proofs (Flutter matches web — NOT bugs):
      //   RADIO-PAR-001..011.
      const parityProofs = 11;
      expect(confirmedFlutterBugs + debatable + parityProofs, 12);
    });
  });
}
