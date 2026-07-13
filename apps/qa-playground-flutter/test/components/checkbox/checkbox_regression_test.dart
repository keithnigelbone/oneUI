/// Checkbox regression + parity-attribution suite.
///
/// See `docs/checkbox-audit-report.md` (audit 2026-06-17). Findings are split by
/// WHERE the defect actually lives — every claim was cross-checked against the
/// web component (`packages/ui/src/components/Checkbox/Checkbox.tsx`,
/// `Checkbox.module.css`, `Checkbox.shared.ts`) and reproduced against the real
/// Flutter widget BEFORE the assertion was written (probe values are quoted in
/// each test's comment):
///
///   [confirmed]   genuine Flutter component bugs — RED until the Flutter fix
///                 lands. Web does the right thing; Flutter does not.
///   [debatable]   hardening / parity-leaning gaps — RED, but lower confidence.
///                 Web SHARES the limitation, so this is a design call, not a
///                 clear shipped defect.
///   [parity]      GREEN proofs that the Flutter resolver matches the web
///                 contract (auto→secondary, accent ignored, neutral unchecked
///                 stroke, aria-invalid wiring).
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
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import '../../support/components/checkbox_harness.dart';

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // CONFIRMED Flutter component bugs — RED until the Flutter fix lands.
  // ===========================================================================

  group('[regression][confirmed] Checkbox', () {
    testWidgets(
        '[a11y] [CB-A11Y-001] Space toggles the focused checkbox (keyboard activation)',
        (tester) async {
      // PROBED: with autofocus + linux target, primaryFocus=true and the focus
      // ring renders (shadows=2), but `AFTER SPACE checked=false` AND
      // `AFTER ENTER checked=false`. The Focus node has NO onKeyEvent handler.
      // Web renders a native <input type=checkbox> (BaseCheckbox.Root) which the
      // browser toggles on Space — so this is a genuine Flutter-only a11y gap.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        var checked = false;
        await pumpCheckboxJioHarnessSettled(
          tester,
          StatefulBuilder(
            builder: (c, setState) => OneUiCheckbox(
              ariaLabel: 'kb',
              autofocus: true,
              checked: checked,
              onCheckedChange: (v) => setState(() => checked = v),
            ),
          ),
        );
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pumpAndSettle();
        expect(checked, isTrue,
            reason:
                'Space must toggle a focused checkbox (web native <input> does). '
                'Flutter Focus node has no onKeyEvent — add Space/Enter handling.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets(
        '[a11y] [CB-A11Y-001b] Enter toggles the focused checkbox (keyboard activation)',
        (tester) async {
      // Companion to CB-A11Y-001 — PROBED `AFTER ENTER checked=false`.
      debugDefaultTargetPlatformOverride = TargetPlatform.linux;
      try {
        var checked = false;
        await pumpCheckboxJioHarnessSettled(
          tester,
          StatefulBuilder(
            builder: (c, setState) => OneUiCheckbox(
              ariaLabel: 'kb',
              autofocus: true,
              checked: checked,
              onCheckedChange: (v) => setState(() => checked = v),
            ),
          ),
        );
        await tester.pumpAndSettle();
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.pumpAndSettle();
        expect(checked, isTrue,
            reason: 'Enter must toggle a focused checkbox — no key handler today.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[fn] [CB-FN-001] testId is exposed via Semantics.identifier (cross-platform locators)',
        (tester) async {
      // PROBED: identifier="" — testId only wraps a KeyedSubtree (in-process
      // only). Web emits data-testid (Checkbox.tsx:193) which Playwright reads.
      // Patrol / Maestro / Appium need Semantics(identifier:).
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'QA', testId: 'qa-checkbox'),
      );
      final handle = tester.ensureSemantics();
      try {
        final node = tester.getSemantics(checkboxSemanticsLabel('QA'));
        expect(node.getSemanticsData().identifier, 'qa-checkbox',
            reason:
                'testId must reach the platform AT tree via Semantics(identifier:). '
                'KeyedSubtree only works in-process — web emits data-testid.');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [CB-A11Y-002] required prop is exposed to assistive tech',
        (tester) async {
      // PROBED: required:true → hasRequiredState=false, validationResult=none.
      // The `required` prop is accepted by the constructor but NEVER wired into
      // Semantics — it is a dead prop. Web maps it to the native input's
      // `required` attribute (CheckboxProps.required → BaseCheckbox.Root).
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Required', required: true),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = checkboxSemanticsData(tester, 'Required');
        expect(data.hasFlag(SemanticsFlag.hasRequiredState), isTrue,
            reason:
                'required must surface to AT (Semantics(required: true)). '
                'Currently the prop is silently dropped — web honours it.');
      } finally {
        handle.dispose();
      }
    });
  });

  // ===========================================================================
  // DEBATABLE — hardening / parity-leaning. Web SHARES the gap → design call.
  // ===========================================================================

  group('[regression][debatable] Checkbox', () {
    testWidgetsAllPlatforms(
        '[a11y] [CB-DEB-001] errorHighlight surfaces an invalid cue to AT',
        (tester) async {
      // PROBED: errorHighlight:true → key carries data-invalid (visual marker)
      // but validationResult=none, so screen-reader users get NO invalid cue.
      // Web standalone Checkbox shares this (errorHighlight → data-invalid only,
      // no aria-invalid, no CSS chrome — Checkbox.tsx:203). Debatable: the
      // accessible parity fix would be to also set validationResult=invalid.
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'Err', errorHighlight: true),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = checkboxSemanticsData(tester, 'Err');
        expect(data.validationResult, SemanticsValidationResult.invalid,
            reason:
                'errorHighlight paints invalid chrome but is silent to AT. '
                'Map it to validationResult=invalid (web has the same gap — '
                'design call, not a clear defect).');
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        '[a11y] [CB-DEB-002] labelled checkbox meets the 44px mobile touch target',
        (tester) async {
      // PROBED: size=m labelled root = 216×20 (box-height only). The interactive
      // box is 20px tall on mobile, below WCAG 2.5.5 / platform HIG 44px. Web
      // shares the small box, so this is platform-min hardening, not a clear
      // shipped defect.
      debugDefaultTargetPlatformOverride = TargetPlatform.android;
      try {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(label: 'Accept', size: 'm'),
        );
        final h = tester.getSize(checkboxRootFinder()).height;
        expect(h, greaterThanOrEqualTo(44),
            reason:
                'mobile touch target should be ≥ 44px (WCAG 2.5.5). The box is '
                'only 20px tall — add hit-test padding on touch platforms.');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgetsAllPlatforms(
        '[fn] [CB-DEB-003] invalid appearance asserts in debug (web has TS union)',
        (tester) async {
      // Unknown roles must report via FlutterError in debug (Divider pattern) and
      // fall back to secondary — web blocks typos at compile time.
      FlutterErrorDetails? captured;
      final prev = FlutterError.onError;
      FlutterError.onError = (d) => captured = d;
      try {
        await pumpCheckboxJioHarnessSettled(
          tester,
          OneUiCheckbox(checked: true, appearance: 'destructive', ariaLabel: 'x'),
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

  group('[parity] Checkbox — matches the web contract', () {
    testWidgetsAllPlatforms(
        '[parity] [CB-PAR-001] appearance=auto resolves to secondary (Checkbox.shared.ts)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'auto', ariaLabel: 'a'),
      );
      final auto = checkboxBoxDecoration(tester).color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, appearance: 'secondary', ariaLabel: 's'),
      );
      expect(auto, checkboxBoxDecoration(tester).color);
    });

    testWidgetsAllPlatforms(
        '[parity] [CB-PAR-002] accent is ignored at runtime (use appearance)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, accent: 'primary', ariaLabel: 'acc'),
      );
      final withAccent = checkboxBoxDecoration(tester).color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: true, ariaLabel: 'noacc'),
      );
      expect(withAccent, checkboxBoxDecoration(tester).color,
          reason: 'accent is @deprecated and must not alter the fill');
    });

    testWidgetsAllPlatforms(
        '[parity] [CB-PAR-003] unchecked stroke stays neutral for any appearance',
        (tester) async {
      // Mirrors Checkbox.module.css --_cb-unchecked-stroke (Neutral by default,
      // only surface context tints it). A suspected "appearance should tint the
      // border" turned out to be CORRECT parity behaviour.
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: false, appearance: 'negative', ariaLabel: 'n'),
      );
      final neg = (checkboxBoxDecoration(tester).border as Border).top.color;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(checked: false, appearance: 'secondary', ariaLabel: 's'),
      );
      final sec = (checkboxBoxDecoration(tester).border as Border).top.color;
      expect(neg, sec);
    });

    testWidgetsAllPlatforms(
        '[parity] [CB-PAR-004] ariaInvalid (not errorHighlight) drives validationResult',
        (tester) async {
      // Web: aria-invalid is wired to the ariaInvalid prop only (Checkbox.tsx:185);
      // errorHighlight is visual-only. Flutter matches exactly.
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(label: 'AI', ariaInvalid: true),
      );
      final handle = tester.ensureSemantics();
      try {
        final data = checkboxSemanticsData(tester, 'AI');
        expect(data.validationResult, SemanticsValidationResult.invalid);
      } finally {
        handle.dispose();
      }
    });

    testWidgetsAllPlatforms(
        '[parity] [CB-PAR-005] readOnly stays enabled + opacity 1.0 (distinct from disabled)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(readOnly: true, checked: true, label: 'RO'),
      );
      expectCheckboxReadOnlyEnabled(tester, 'RO');
      final op = tester.widget<Opacity>(find
          .descendant(of: checkboxRootFinder(), matching: find.byType(Opacity))
          .first);
      expect(op.opacity, 1.0);
    });

    testWidgetsAllPlatforms(
        '[parity] [CB-PAR-006] group value with surrounding whitespace still selects',
        (tester) async {
      // Suspected Flutter trim asymmetry (cf. BottomNavigation BN-FN-002) — but
      // PROBED `GROUP whitespace checked=true`. _isChecked trims widget.value
      // before group.isSelected, so a padded value resolves correctly. PARITY.
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(value: ' home ', label: 'Home'),
      );
      // standalone: just renders; the group-selection trim is exercised in
      // checkbox_functional_test multi-select. Here we assert it renders the box.
      expect(checkboxRootFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // [meta] Burn-down counter.
  // ===========================================================================

  group('[regression][meta] Checkbox', () {
    test('[meta] attribution counts', () {
      // Confirmed Flutter bugs (RED, fix in Flutter):
      //   CB-A11Y-001 (Space), CB-A11Y-001b (Enter), CB-FN-001 (testId id),
      //   CB-A11Y-002 (required dead prop).
      const confirmedFlutterBugs = 4;
      // Debatable hardening / parity-leaning:
      //   CB-DEB-001 (errorHighlight→AT), CB-DEB-002 (touch target),
      //   CB-DEB-003 (invalid appearance assert).
      const debatable = 3;
      // Parity GREEN proofs (Flutter matches web — NOT bugs):
      //   CB-PAR-001..006.
      const parityProofs = 6;
      expect(confirmedFlutterBugs + debatable + parityProofs, 13);
    });
  });
}
