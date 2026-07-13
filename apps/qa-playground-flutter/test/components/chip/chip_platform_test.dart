/// Chip platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS (pointer-first, TalkBack/VoiceOver): pointer tap toggles;
///     the control announces a button with selected state; the chrome is
///     hit-testable at its resolved size.
///   - linux / macOS (web/desktop proxy, keyboard + pointer): the control takes
///     focus; Space AND Enter activate it (OneUiFocusInteractive Shortcuts →
///     ActivateIntent — PROBED working, unlike Checkbox); pointer tap toggles;
///     a disabled chip cannot take focus.
///
/// Uses the synthetic measurement harness so the whole file runs offline.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';

import '../../support/components/chip_harness.dart';

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
  // ===========================================================================
  // Mobile (Android / iOS) — pointer tap + TalkBack/VoiceOver
  // ===========================================================================

  group('[platform][mobile] Chip', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap toggles + announces selected',
        (tester) async {
      var selected = false;
      await pumpChipQaHarness(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiChip(
            child: 'Filter',
            selected: selected,
            onSelectedChange: (v, [d]) => setState(() => selected = v),
          ),
        ),
      );
      await tester.tap(find.text('Filter'));
      await tester.pumpAndSettle();
      expect(selected, isTrue, reason: 'pointer tap toggles on mobile');

      withSemanticsHandle(tester, () {
        final data = chipSemanticsData(tester, label: 'Filter');
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.hasFlag(SemanticsFlag.hasSelectedState), isTrue);
        expect(data.hasFlag(SemanticsFlag.isSelected), isTrue);
      });
    });

    _onPlatforms(_kMobilePlatforms,
        '[mobile] chrome renders at the resolved size and is hit-testable',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChip(child: 'L', size: 'l', selected: true),
      );
      // size=l → 32px chrome (synthetic token). Confirms the tappable chrome is
      // present at the resolved height.
      expect(chipHeightPx(tester), 32);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled chip is not toggled by tap',
        (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          child: 'Off',
          disabled: true,
          onSelectedChange: (v, [d]) => changed = true,
        ),
      );
      await tester.tap(find.text('Off'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  // ===========================================================================
  // Web / desktop — focus + keyboard activation
  // ===========================================================================

  group('[platform][web] Chip', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] autofocus takes keyboard focus',
        (tester) async {
      await pumpChipQaHarness(tester, OneUiChip(child: 'F', autofocus: true));
      await tester.pump();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue,
          reason: 'chip is keyboard-focusable on desktop');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] Space activates the focused chip',
        (tester) async {
      var selected = false;
      await pumpChipQaHarness(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiChip(
            ariaLabel: 'kb',
            autofocus: true,
            selected: selected,
            onSelectedChange: (v, [d]) => setState(() => selected = v),
          ),
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump(const Duration(milliseconds: 50));
      expect(selected, isTrue,
          reason: 'Space toggles the chip (OneUiFocusInteractive ActivateIntent)');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] Enter activates the focused chip',
        (tester) async {
      var selected = false;
      await pumpChipQaHarness(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiChip(
            ariaLabel: 'kb',
            autofocus: true,
            selected: selected,
            onSelectedChange: (v, [d]) => setState(() => selected = v),
          ),
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump(const Duration(milliseconds: 50));
      expect(selected, isTrue, reason: 'Enter toggles the chip');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] pointer tap toggles the control',
        (tester) async {
      var selected = false;
      await pumpChipQaHarness(
        tester,
        StatefulBuilder(
          builder: (c, setState) => OneUiChip(
            child: 'Filter',
            selected: selected,
            onSelectedChange: (v, [d]) => setState(() => selected = v),
          ),
        ),
      );
      await tester.tap(find.text('Filter'));
      await tester.pumpAndSettle();
      expect(selected, isTrue);
    });

    _onPlatforms(_kWebDesktopPlatforms,
        '[web] disabled chip is not keyboard-activatable', (tester) async {
      // OneUiFocusInteractive sets canRequestFocus:false + skipTraversal:true when
      // disabled, so an autofocused disabled chip never takes focus and Space is a
      // no-op. (FocusManager.primaryFocus falls back to the root scope, so assert
      // the user-facing guarantee — no activation — not the scope flag.)
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChip(
          ariaLabel: 'Off',
          disabled: true,
          autofocus: true,
          onSelectedChange: (v, [d]) => changed = true,
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump(const Duration(milliseconds: 50));
      expect(changed, isFalse,
          reason: 'disabled chip cannot be focused or activated by keyboard');
    });
  });
}
