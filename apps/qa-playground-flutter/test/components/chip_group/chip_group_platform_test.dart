/// ChipGroup platform-specific QA tests — web/desktop vs Android/iOS.
///
///   - Android / iOS: pointer tap selects a child chip.
///   - linux / macOS: roving focus — arrow keys move focus between chips
///     (OneUiChipGroupFocusKeyboardScope — PROBED working: A → ArrowRight → B),
///     and Space/Enter activates the focused chip.
///
/// Synthetic measurement harness (offline).
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_chip.dart';
import 'package:ui_flutter/widgets/one_ui_chip_group.dart';

import '../../support/components/chip_group_harness.dart';

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
  group('[platform][mobile] ChipGroup', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] pointer tap selects a child chip',
        (tester) async {
      List<String> values = const [];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          onValueChange: (v) => values = v,
          children: [
            OneUiChip(child: 'A', value: 'a'),
            OneUiChip(child: 'B', value: 'b'),
          ],
        ),
      );
      await tester.tap(find.text('B'));
      await tester.pumpAndSettle();
      expect(values, ['b']);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled group ignores taps', (tester) async {
      var changed = false;
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          disabled: true,
          onValueChange: (_) => changed = true,
          children: [OneUiChip(child: 'A', value: 'a')],
        ),
      );
      await tester.tap(find.text('A'));
      await tester.pumpAndSettle();
      expect(changed, isFalse);
    });
  });

  group('[platform][web] ChipGroup', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] arrow keys rove focus between chips',
        (tester) async {
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(children: [
          OneUiChip(child: 'A', value: 'a', autofocus: true),
          OneUiChip(child: 'B', value: 'b'),
        ]),
      );
      await tester.pump();
      expect(FocusManager.instance.primaryFocus?.debugLabel, 'A',
          reason: 'first chip is focused via autofocus');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump(const Duration(milliseconds: 50));
      expect(FocusManager.instance.primaryFocus?.debugLabel, 'B',
          reason: 'ArrowRight moves roving focus to the next chip');
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] Space activates the focused chip',
        (tester) async {
      List<String> values = const [];
      await pumpChipQaHarness(
        tester,
        OneUiChipGroup(
          onValueChange: (v) => values = v,
          children: [
            OneUiChip(child: 'A', value: 'a', autofocus: true),
            OneUiChip(child: 'B', value: 'b'),
          ],
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump(const Duration(milliseconds: 50));
      expect(values, ['a'], reason: 'Space selects the focused chip');
    });
  });
}
