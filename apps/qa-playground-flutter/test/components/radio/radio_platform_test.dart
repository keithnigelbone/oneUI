/// Radio platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS (pointer-first, TalkBack/VoiceOver): pointer tap selects;
///     the control announces the radio role with checked state; the box is
///     hit-testable.
///   - linux / macOS (web/desktop proxy, keyboard + pointer): the control takes
///     focus and paints a 2-layer focus ring (Informative-Bold halo); pointer
///     tap selects.
///
/// IMPORTANT — keyboard activation is intentionally NOT asserted here as
/// passing. The probe proved Space/Enter do NOT select the Flutter radio (no key
/// handler on the Focus node), whereas a web `<input type=radio>` selects on
/// arrow/space natively. That genuine parity gap is captured RED in
/// `radio_regression_test.dart` (RADIO-A11Y-002). Asserting it here would be
/// false confidence.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_radio.dart';
import 'package:ui_flutter/widgets/one_ui_radio_group.dart';

import '../../support/components/radio_harness.dart';

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

  group('[platform][mobile] Radio', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap selects + announces checked', (tester) async {
      String? selected;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(
          onValueChange: (v) => selected = v,
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(selected, 'a', reason: 'pointer tap selects on mobile');

      withSemanticsHandle(tester, () {
        final data = radioSemanticsData(tester, 'A', checked: true);
        expect(data.hasFlag(SemanticsFlag.hasCheckedState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isChecked), isTrue);
        expect(data.hasFlag(SemanticsFlag.isInMutuallyExclusiveGroup), isTrue);
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] the box renders at the resolved size + is tappable',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', size: 'l', ariaLabel: 'hit')]),
      );
      expect(radioBoxSizePx(tester), greaterThanOrEqualTo(24));
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled control is not selected by tap',
        (tester) async {
      var changed = false;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [OneUiRadio(value: 'a', label: 'Off')],
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

  group('[platform][web] Radio', () {
    _onPlatforms(_kWebDesktopPlatforms,
        '[web] autofocus paints the 2-layer focus ring (Informative halo)', (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', ariaLabel: 'kb', autofocus: true)]),
      );
      await tester.pumpAndSettle();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue,
          reason: 'radio is keyboard-focusable on desktop');
      final shadows = radioBoxDecoration(tester).boxShadow;
      expect(shadows, isNotNull);
      expect(shadows!.length, 2,
          reason: 'focus ring is a 2-layer halo (gap + Informative-Bold outline)');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] pointer tap selects the control', (tester) async {
      String? selected;
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(
          onValueChange: (v) => selected = v,
          children: [
            OneUiRadio(value: 'a', label: 'A'),
            OneUiRadio(value: 'b', label: 'B'),
          ],
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(selected, 'b');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] disabled control cannot receive focus',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(
          disabled: true,
          children: [OneUiRadio(value: 'a', ariaLabel: 'kb', autofocus: true)],
        ),
      );
      await tester.pumpAndSettle();
      final hasFocus = FocusManager.instance.primaryFocus?.hasFocus ?? false;
      final shadows = radioBoxDecoration(tester).boxShadow;
      expect(hasFocus && (shadows?.isNotEmpty ?? false), isFalse,
          reason: 'disabled radio is not focusable, so no focus ring');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] no focus ring when not focused (clean rest state)',
        (tester) async {
      await pumpRadioJioHarnessSettled(
        tester,
        OneUiRadioGroup(children: [OneUiRadio(value: 'a', ariaLabel: 'rest')]),
      );
      final shadows = radioBoxDecoration(tester).boxShadow;
      expect(shadows == null || shadows.isEmpty, isTrue,
          reason: 'unfocused radio draws no halo');
    });
  });
}
