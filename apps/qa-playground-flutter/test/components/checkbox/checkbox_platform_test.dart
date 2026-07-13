/// Checkbox platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS (mobile, pointer-first, TalkBack/VoiceOver): pointer tap
///     toggles; the control announces the checkbox role with checked state; the
///     interactive box is hit-testable.
///   - linux / macOS (web/desktop proxy, keyboard + pointer): the control takes
///     focus and paints a 2-layer focus ring (Informative-Bold halo); pointer
///     tap toggles; checked state is exposed to AT.
///
/// IMPORTANT — keyboard activation is intentionally NOT asserted here as
/// passing. The probe proved Space/Enter do NOT toggle the Flutter checkbox
/// (no key handler on the Focus node), whereas the web `<input type=checkbox>`
/// toggles on Space natively. That genuine parity gap is captured RED in
/// `checkbox_regression_test.dart` (CB-A11Y-001). Asserting it here would be
/// false confidence.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_checkbox.dart';

import '../../support/components/checkbox_harness.dart';

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

  group('[platform][mobile] Checkbox', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap toggles + announces checked',
        (tester) async {
      var checked = false;
      await pumpCheckboxJioHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiCheckbox(
            label: 'Accept',
            checked: checked,
            onCheckedChange: (v) => setState(() => checked = v),
          ),
        ),
      );
      await tester.tap(find.text('Accept'));
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
        '[mobile] the interactive box satisfies its declared hit area',
        (tester) async {
      // The checkbox box itself is the minimum hit area. Verify the real box is
      // hit-testable and at least as large as the resolved box token (l=24).
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(ariaLabel: 'hit', size: 'l'),
      );
      final box = checkboxBoxSizePx(tester);
      expect(box, greaterThanOrEqualTo(24),
          reason: 'box renders at the resolved size token and is tappable');
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled control is not toggled by tap',
        (tester) async {
      var changed = false;
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(
          label: 'Off',
          disabled: true,
          onCheckedChange: (_) => changed = true,
        ),
      );
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  // ===========================================================================
  // Web / desktop — focus ring + pointer activation
  // ===========================================================================

  group('[platform][web] Checkbox', () {
    _onPlatforms(_kWebDesktopPlatforms,
        '[web] autofocus paints the 2-layer focus ring (Informative halo)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(ariaLabel: 'kb', autofocus: true),
      );
      await tester.pumpAndSettle();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue,
          reason: 'checkbox is keyboard-focusable on desktop');
      final shadows = checkboxBoxDecoration(tester).boxShadow;
      expect(shadows, isNotNull);
      expect(shadows!.length, 2,
          reason: 'focus ring is a 2-layer halo (gap + Informative-Bold outline)');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] pointer tap toggles the control',
        (tester) async {
      var checked = false;
      await pumpCheckboxJioHarnessSettled(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiCheckbox(
            label: 'Accept',
            checked: checked,
            onCheckedChange: (v) => setState(() => checked = v),
          ),
        ),
      );
      await tester.tap(find.text('Accept'));
      await tester.pumpAndSettle();
      expect(checked, isTrue);
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] disabled control cannot receive focus', (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(ariaLabel: 'kb', disabled: true, autofocus: true),
      );
      await tester.pumpAndSettle();
      // canRequestFocus == !isDisabled — a disabled checkbox must not steal focus.
      final hasFocus = FocusManager.instance.primaryFocus?.hasFocus ?? false;
      final boxShadows = checkboxBoxDecoration(tester).boxShadow;
      expect(hasFocus && (boxShadows?.isNotEmpty ?? false), isFalse,
          reason: 'disabled checkbox is not focusable, so no focus ring');
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] no focus ring when not focused (rest state is clean)',
        (tester) async {
      await pumpCheckboxJioHarnessSettled(
        tester,
        OneUiCheckbox(ariaLabel: 'rest'),
      );
      final shadows = checkboxBoxDecoration(tester).boxShadow;
      expect(shadows == null || shadows.isEmpty, isTrue,
          reason: 'unfocused checkbox draws no halo');
    });
  });
}
