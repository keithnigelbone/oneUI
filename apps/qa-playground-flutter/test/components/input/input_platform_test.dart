/// Input platform-specific QA tests.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_input.dart';

import '../../support/components/input_harness.dart';

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
    await ensureInputIconsLoaded();
  });

  group('[platform][mobile] Input', () {
    _onPlatforms(_kMobilePlatforms, '[platform] enterText updates value', (tester) async {
      String? last;
      await pumpInputQaHarness(
        tester,
        OneUiInput(placeholder: 'Name', onChanged: (v) => last = v),
      );
      await tester.enterText(inputTextFieldFinder(), 'Ada');
      await tester.pumpAndSettle();
      expect(last, 'Ada');
    });

    _onPlatforms(_kMobilePlatforms, '[platform] tap shell focuses field', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(placeholder: 'Tap'),
      );
      await tester.tap(inputShellFinder());
      await tester.pumpAndSettle();
      expect(inputTextField(tester).focusNode?.hasFocus ?? false, isTrue);
    });
  });

  group('[platform][desktop] Input', () {
    _onPlatforms(_kDesktopPlatforms, '[platform] tap shell focuses text field', (tester) async {
      await pumpInputQaHarness(
        tester,
        const OneUiInput(placeholder: 'Email'),
      );
      await tester.tap(inputShellFinder());
      await tester.pumpAndSettle();
      expect(inputTextField(tester).focusNode?.hasFocus ?? false, isTrue);
    });
  });
}
