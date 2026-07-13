/// CheckboxField regression + parity-attribution suite.
///
/// See `docs/checkbox-field-audit-report.md` (audit 2026-06-17). Findings are
/// split by WHERE the defect actually lives — every claim was cross-checked
/// against the web component (`packages/ui/src/components/CheckboxField/
/// CheckboxField.tsx`, `CheckboxField.shared.ts`, `CheckboxField.module.css`,
/// and the composed `Checkbox`) and reproduced against the real Flutter widget
/// BEFORE the assertion was written (probe values are quoted in each test):
///
///   [confirmed]   genuine Flutter component bugs — RED until the Flutter fix
///                 lands. Web does the right thing; Flutter does not. The
///                 CheckboxField composes the inner Checkbox, so these are
///                 inherited from / shared with the Checkbox control but are
///                 reproduced here through the CheckboxField public API.
///   [debatable]   hardening / parity-leaning gaps — RED, but lower confidence.
///                 Web SHARES the limitation, so this is a design call.
///   [parity]      GREEN proofs that the Flutter field matches the web contract
///                 (auto→secondary, invalid→validationResult, asterisk gated on
///                 label, infoIcon gated on label, alert feedback, readOnly).
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
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../../support/components/checkbox_field_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // CONFIRMED Flutter component bugs — RED until the Flutter fix lands.
  // ===========================================================================

  group('[regression][confirmed] CheckboxField', () {
    testWidgets(
        '[a11y] [CBF-A11Y-001] Space toggles the focused field control (keyboard activation)',
        (tester) async {
      // PROBED via CheckboxField: linux target, Tab focuses the inner control,
      // ring renders, yet `AFTER SPACE checked=false` AND `AFTER ENTER
      // checked=false`. The inner Checkbox `Focus` node has no onKeyEvent. Web
      // renders a native <input type=checkbox> (BaseCheckbox.Root) toggled on
      // Space — a genuine Flutter-only a11y gap the field inherits.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        var checked = false;
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          StatefulBuilder(
            builder: (c, setState) => OneUiCheckboxField(
              label: 'kb',
              checked: checked,
              onCheckedChange: (v) => setState(() => checked = v),
            ),
          ),
        );
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pumpAndSettle();
        expect(checked, isTrue,
            reason:
                'Space must toggle a focused field control (web native <input> '
                'does). Inner Checkbox Focus node has no onKeyEvent.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets(
        '[a11y] [CBF-A11Y-001b] Enter toggles the focused field control (keyboard activation)',
        (tester) async {
      // Companion to CBF-A11Y-001 — PROBED `AFTER ENTER checked=false`.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        var checked = false;
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          StatefulBuilder(
            builder: (c, setState) => OneUiCheckboxField(
              label: 'kb',
              checked: checked,
              onCheckedChange: (v) => setState(() => checked = v),
            ),
          ),
        );
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();
        expect(checked, isTrue,
            reason: 'Enter must toggle a focused field control — no key handler today.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[fn] [CBF-FN-001] testId is exposed via Semantics.identifier (cross-platform locators)',
        (tester) async {
      // PROBED: SemanticsData.identifier == "" — the field testId only wraps a
      // KeyedSubtree (in-process find.byKey only). Web emits data-testid on the
      // control which Playwright reads; Patrol / Maestro / Appium need
      // Semantics(identifier:).
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'QA', testId: 'qa-field'),
      );
      final handle = tester.ensureSemantics();
      try {
        final node = tester.getSemantics(checkboxSemanticsLabel('QA').first);
        expect(node.getSemanticsData().identifier, 'qa-field',
            reason:
                'testId must reach the platform AT tree via Semantics(identifier:). '
                'KeyedSubtree only works in-process — web emits data-testid.');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [CBF-A11Y-002] required is exposed to assistive tech (not just a visual asterisk)',
        (tester) async {
      // PROBED: required:true → a visible ` *` asterisk renders on the label,
      // BUT `hasRequiredState=false` and `validationResult=none` on the control.
      // Web's asterisk span is aria-hidden; the ACCESSIBLE required cue comes
      // from mapping `required` to the native input's `required` attribute. The
      // Flutter field renders the asterisk but never forwards `required` to the
      // inner Checkbox / Semantics — so screen-reader users are never told the
      // field is required. Genuine Flutter-only gap (same class as CB-A11Y-002).
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Required', required: true),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = checkboxSemanticsData(tester, 'Required');
        expect(data.hasFlag(SemanticsFlag.hasRequiredState), isTrue,
            reason:
                'required must surface to AT (Semantics(required: true)), not '
                'only as an aria-hidden asterisk. Web honours it via the native '
                'input required attribute.');
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web SHARES the gap → design call.
  // ===========================================================================

  group('[regression][debatable] CheckboxField', () {
    testWidgetsAllPlatforms(
        '[a11y] [CBF-DEB-001] labelled field control meets the 44px mobile touch target',
        (tester) async {
      // Touch layout expands to 44px on S-360 (resolveControlTouchTargetSizePx).
      // The painted box stays 20px — measure the inner OneUiCheckbox root layout.
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          const OneUiCheckboxField(label: 'Accept', size: 'm'),
        );
        final h = tester.getSize(checkboxRootFinder().first).height;
        expect(h, greaterThanOrEqualTo(44),
            reason:
                'mobile touch target should be ≥ 44px (WCAG 2.5.5). The painted '
                'box stays token-sized; hit-test padding expands the tappable area.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[fn] [CBF-DEB-002] invalid appearance asserts in debug (web has TS union)',
        (tester) async {
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpCheckboxFieldJioHarnessSettled(
          tester,
          const OneUiCheckboxField(
            label: 'x',
            checked: true,
            appearance: 'destructive',
          ),
        );
        expect(captured, isNotNull,
            reason:
                'unknown appearance must assert in debug to recover the type '
                'safety web gets from TypeScript.');
      } finally {
        FlutterError.onError = prev;
      }
    });
  });

  // ===========================================================================
  // PARITY (GREEN) — Flutter matches the web contract. These are PROOFS, not
  // bugs. They also document where a suspected bug turned out parity-aligned.
  // ===========================================================================

  group('[parity] CheckboxField — matches the web contract', () {
    testWidgetsAllPlatforms(
        '[parity] [CBF-PAR-001] appearance=auto resolves to secondary (CheckboxField.shared.ts)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'a', appearance: 'auto', checked: true),
      );
      final auto = checkboxBoxDecoration(tester).color;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 's', appearance: 'secondary', checked: true),
      );
      expect(auto, checkboxBoxDecoration(tester).color);
    });

    testWidgetsAllPlatforms(
        '[parity] [CBF-PAR-002] invalid / error drives validationResult on the control',
        (tester) async {
      // Web: Field.Root invalid + errorHighlight on the checkbox wrapper. Flutter
      // forwards isInvalid → inner Checkbox errorHighlight + aria-invalid, which
      // surfaces validationResult=invalid. (Standalone Checkbox needs ariaInvalid;
      // the FIELD wires it for you — this is the field's value-add, and it matches
      // web.)
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'V', invalid: true),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = checkboxSemanticsData(tester, 'V');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        '[parity] [CBF-PAR-003] required asterisk is gated on a label (web labelSuffixInside)',
        (tester) async {
      // Web: `labelSuffixInside = required && hasLabelHeader ? <span aria-hidden>*`.
      // A suspected "asterisk should always show when required" is WRONG — it is
      // correctly suppressed without a label. PARITY.
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Has label', required: true),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isTrue);

      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(required: true, description: 'no label'),
      );
      expect(checkboxFieldHasRequiredAsterisk(tester), isFalse,
          reason: 'asterisk only renders with a label (labelSuffixInside gate)');
    });

    testWidgetsAllPlatforms(
        '[parity] [CBF-PAR-004] error feedback exposes the alert role (RN InputFeedback)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Opt', error: 'Validation failed'),
      );
      expect(find.text('Validation failed'), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate((w) =>
              w is Semantics && w.properties.role == SemanticsRole.alert),
          findsWidgets,
        );
      });
    });

    testWidgetsAllPlatforms(
        '[parity] [CBF-PAR-005] readOnly stays enabled + opacity 1.0 (distinct from disabled)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'RO', readOnly: true, checked: true),
      );
      expectCheckboxReadOnlyEnabled(tester, 'RO');
      final op = tester.widget<Opacity>(find
          .descendant(of: checkboxRootFinder(), matching: find.byType(Opacity))
          .first);
      expect(op.opacity, 1.0);
    });

    testWidgetsAllPlatforms(
        '[parity] [CBF-PAR-006] infoIcon is gated on a label (web hasInfoIcon = infoIcon && hasLabel)',
        (tester) async {
      // Suspected "infoIcon should show whenever requested" — but the resolver
      // (and web) require a label. Disproven; PARITY.
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'With label', infoIcon: true),
      );
      expect(checkboxFieldHasInfoIcon(tester), isTrue);

      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(infoIcon: true, description: 'no label'),
      );
      expect(checkboxFieldHasInfoIcon(tester), isFalse,
          reason: 'no label → no info icon (hasInfoIcon resolver parity)');
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] CheckboxField', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter):
      //   CBF-A11Y-001 (Space), CBF-A11Y-001b (Enter), CBF-FN-001 (testId id),
      //   CBF-A11Y-002 (required not exposed to AT).
      const confirmedFlutterBugs = 4;
      // Debatable hardening / parity-leaning:
      //   CBF-DEB-001 (touch target), CBF-DEB-002 (invalid appearance assert).
      const debatable = 2;
      // Parity GREEN proofs (Flutter matches web — NOT bugs):
      //   CBF-PAR-001..006.
      const parityProofs = 6;
      expect(confirmedFlutterBugs + debatable + parityProofs, 12);
    });
  });
}
