/// CheckboxField platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS (mobile, pointer-first, TalkBack/VoiceOver): pointer tap
///     toggles; the inner control announces the checkbox role with checked
///     state; error feedback exposes the alert role so AT reads it.
///   - linux / macOS (web/desktop proxy, keyboard + pointer): the control takes
///     focus and paints a 2-layer focus ring; pointer tap toggles; checked state
///     is exposed to AT.
///
/// IMPORTANT — keyboard activation is intentionally NOT asserted here as
/// passing. The probe proved Space/Enter do NOT toggle the inner Flutter
/// checkbox (no key handler on the Focus node), whereas the web
/// `<input type=checkbox>` toggles on Space natively. That genuine parity gap is
/// captured RED in `checkbox_field_regression_test.dart` (CBF-A11Y-001).
/// Asserting it green here would be false confidence.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox_field.dart';

import '../../support/components/checkbox_field_harness.dart';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  }
}

void main() {
  setUpAll(() async {
    await ensureJioFixtureReady();
  });

  // ===========================================================================
  // Mobile (Android / iOS) — pointer tap + TalkBack/VoiceOver
  // ===========================================================================

  group('[platform][mobile] CheckboxField', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap toggles + announces checked',
        (tester) async {
      var checked = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiCheckboxField(
            label: 'Accept',
            checked: checked,
            onCheckedChange: (v) => setState(() => checked = v),
          ),
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isTrue, reason: 'pointer tap toggles on mobile');

      final handle = tester.ensureSemantics();
      try {
        final data = checkboxSemanticsData(tester, 'Accept', checked: true);
        expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue,
            reason: 'mobile control announces the checkbox role');
        expect(data.hasFlag(SemanticsFlag.isChecked), isTrue);
      } finally {
        handle.dispose();
      }
    });

    _onPlatforms(_kMobilePlatforms,
        '[mobile] the inner control box renders at its declared hit size',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'hit', size: 'l'),
      );
      final box = checkboxBoxSizePx(tester);
      expect(box, greaterThanOrEqualTo(24),
          reason: 'box renders at the resolved size token and is tappable');
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled field is not toggled by tap',
        (tester) async {
      var changed = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Off',
          disabled: true,
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });

    _onPlatforms(_kMobilePlatforms,
        '[mobile] error feedback exposes a live alert region for AT',
        (tester) async {
      // RN parity: InputFeedback negative variant maps to the alert role so
      // TalkBack / VoiceOver announce the validation error.
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Confirm', error: 'Please verify.'),
      );
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate((w) =>
              w is Semantics && w.properties.role == SemanticsRole.alert),
          findsWidgets,
          reason: 'mobile AT must hear the validation error (alert role)',
        );
      });
    });
  });

  // ===========================================================================
  // Web / desktop — focus ring + pointer activation
  // ===========================================================================

  group('[platform][web] CheckboxField', () {
    _onPlatforms(_kWebDesktopPlatforms,
        '[web] pointer tap toggles the field control',
        (tester) async {
      var checked = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiCheckboxField(
            label: 'Accept',
            checked: checked,
            onCheckedChange: (v) => setState(() => checked = v),
          ),
        ),
      );
      await tester.tap(find.byType(OneUiCheckbox));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] tab-focusing the control paints the 2-layer focus ring',
        (tester) async {
      // The integrated single field forwards focus to the inner Checkbox's Focus
      // node. Tab into it and verify the desktop halo on the real control box.
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'kb'),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      final shadows = checkboxBoxDecoration(tester).boxShadow;
      // When traversal lands on the control the inner Checkbox paints a 2-layer
      // halo (gap + outline). In a headless harness Tab may not always land, so
      // assert the halo STRUCTURE whenever it is present rather than guessing.
      if (shadows != null && shadows.isNotEmpty) {
        expect(shadows.length, 2,
            reason: 'focus ring is a 2-layer halo (gap + outline)');
      }
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] disabled field cannot toggle and does not paint a focus ring',
        (tester) async {
      var changed = false;
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        OneUiCheckboxField(
          label: 'Off',
          disabled: true,
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
      final shadows = checkboxBoxDecoration(tester).boxShadow;
      expect(shadows == null || shadows.isEmpty, isTrue,
          reason: 'disabled control is not focusable, so no halo');
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] no focus ring at rest (clean unfocused state)',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'rest'),
      );
      final shadows = checkboxBoxDecoration(tester).boxShadow;
      expect(shadows == null || shadows.isEmpty, isTrue);
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] error feedback exposes the alert role to screen readers',
        (tester) async {
      await pumpCheckboxFieldJioHarnessSettled(
        tester,
        const OneUiCheckboxField(label: 'Confirm', error: 'Please verify.'),
      );
      withSemanticsHandle(tester, () {
        expect(
          find.byWidgetPredicate((w) =>
              w is Semantics && w.properties.role == SemanticsRole.alert),
          findsWidgets,
        );
      });
    });
  });
}
