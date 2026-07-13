/// Text platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS: pointer tap on interactive copy
///   - linux / macOS (web/desktop proxy): tap + link/header semantics
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_text.dart';
import 'package:ui_flutter/widgets/one_ui_text_types.dart';

import '../../support/components/text_harness.dart';

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
  group('[platform][mobile] Text', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap invokes onPressed',
        (tester) async {
      var hits = 0;
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Learn more',
          onPressed: () => hits++,
        ),
      );
      await tester.tap(find.text('Learn more'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    _onPlatforms(
        _kMobilePlatforms, '[mobile] headline exposes header semantics',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
          text: 'Section',
          variant: OneUiTextVariant.headline,
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Section');
        expect(data.hasFlag(SemanticsFlag.isHeader), isTrue);
      });
    });

    _onPlatforms(
        _kMobilePlatforms, '[mobile] S platform renders body M at 14px',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
            text: 'Mobile', variant: OneUiTextVariant.body, size: 'M'),
        platformId: 'S',
      );
      expect(textStyleOf(tester).fontSize, 14);
    });
  });

  group('[platform][web] Text', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] tap invokes onPressed',
        (tester) async {
      var hits = 0;
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Learn more',
          onPressed: () => hits++,
        ),
      );
      await tester.tap(find.text('Learn more'));
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    _onPlatforms(
        _kWebDesktopPlatforms, '[web] interactive link exposes link semantics',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        OneUiText(
          text: 'Learn more',
          onPressed: () {},
        ),
      );
      withSemanticsHandle(tester, () {
        final data = textSemanticsData(tester, label: 'Learn more');
        expect(data.hasFlag(SemanticsFlag.isLink), isTrue);
      });
    });

    _onPlatforms(
        _kWebDesktopPlatforms, '[web] plain body uses native Text semantics',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(text: 'Body copy', variant: OneUiTextVariant.body),
      );
      expect(find.text('Body copy'), findsOneWidget);
      expect(
        find.descendant(
          of: textRootFinder(),
          matching: find.byWidgetPredicate((w) => w is Semantics),
        ),
        findsNothing,
      );
    });

    _onPlatforms(
        _kWebDesktopPlatforms, '[web] D-1280 desktop platform renders body M',
        (tester) async {
      await pumpTextQaHarness(
        tester,
        const OneUiText(
            text: 'Desktop', variant: OneUiTextVariant.body, size: 'M'),
        platformId: 'D-1280',
      );
      expect(textStyleOf(tester).fontSize, isNotNull);
    });
  });
}
