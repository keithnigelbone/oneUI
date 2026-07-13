/// InputDynamicText platform-specific QA tests.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS: pointer tap on trailing helper button
///   - linux / macOS: keyboard focus + activation on helper button
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input_dynamic_text.dart';

import '../../support/components/input_dynamic_text_harness.dart';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

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
    await ensureInputDynamicTextIconsLoaded();
  });

  group('[platform][mobile] InputDynamicText', () {
    _onPlatforms(
        _kMobilePlatforms, '[platform] tap helper button fires onEndClick',
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

    _onPlatforms(
        _kMobilePlatforms, '[platform] helper button exposes button semantics',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          end: 'Help',
          endAriaLabel: 'Open help',
        ),
      );
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.label, contains('Open help'));
      });
    });

    _onPlatforms(_kMobilePlatforms, '[platform] disabled blocks mobile tap',
        (tester) async {
      var hits = 0;
      await pumpInputDynamicTextQaHarness(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          disabled: true,
          onEndClick: () => hits++,
        ),
      );
      await tester.tap(inputDynamicTextHelperInteractiveFinder(),
          warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });
  });

  group('[platform][desktop] InputDynamicText', () {
    _onPlatforms(_kDesktopPlatforms, '[platform] Tab focuses helper button',
        (tester) async {
      await pumpInputDynamicTextQaHarness(
        tester,
        const OneUiInputDynamicText(
          content: '0 / 100',
          end: 'Help',
          endAriaLabel: 'Help action',
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      withSemanticsHandle(tester, () {
        final data = inputDynamicTextHelperButtonSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
      });
    });

    _onPlatforms(_kDesktopPlatforms, '[platform] Enter activates helper button',
        (tester) async {
      var hits = 0;
      await pumpInputDynamicTextQaHarness(
        tester,
        OneUiInputDynamicText(
          end: 'Clear',
          endAriaLabel: 'Clear field',
          onEndClick: () => hits++,
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(hits, 1);
    });
  });
}
