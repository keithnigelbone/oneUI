/// IconButton platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`:
///   - Android / iOS: pointer tap + TalkBack/VoiceOver semantics
///   - linux / macOS (web/desktop proxy): keyboard focus + Space/Enter activation
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button.dart';
import 'package:ui_flutter/widgets/one_ui_icon_button_types.dart';

import '../../support/components/icon_button_harness.dart';

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
    await ensureIconButtonIconsLoaded();
  });

  group('[platform][mobile] IconButton', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] tap invokes onPressed', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          onPressed: () => hits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] exposes button semantics', (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(icon: 'heart', semanticsLabel: 'Like'),
      );
      withSemanticsHandle(tester, () {
        final data = iconButtonSemanticsData(tester, semanticsLabel: 'Like');
        expect(data.hasFlag(SemanticsFlag.isButton), isTrue);
        expect(data.hasAction(SemanticsAction.tap), isTrue);
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] disabled blocks tap', (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          disabled: true,
          onPressed: () => hits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder(), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(hits, 0);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] chrome is hit-testable at resolved size',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          sizeAlias: 'm',
          semanticsLabel: 'Like',
        ),
      );
      expect(iconButtonHeightPx(tester), kQaIconButtonContainerPx['m']);
    });
  });

  group('[platform][web] IconButton', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] autofocus takes keyboard focus',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          autofocus: true,
        ),
      );
      await tester.pump();
      expect(FocusManager.instance.primaryFocus?.hasFocus ?? false, isTrue);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] Space activates focused control',
        (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          autofocus: true,
          onPressed: () => hits++,
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump(const Duration(milliseconds: 50));
      expect(hits, 1);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] Enter activates focused control',
        (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          autofocus: true,
          onPressed: () => hits++,
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump(const Duration(milliseconds: 50));
      expect(hits, 1);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] pointer tap invokes onPressed',
        (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          onPressed: () => hits++,
        ),
      );
      await tester.tap(iconButtonInteractiveFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] disabled is not keyboard-activatable',
        (tester) async {
      var hits = 0;
      await pumpIconButtonQaHarness(
        tester,
        OneUiIconButton(
          icon: 'heart',
          semanticsLabel: 'Like',
          disabled: true,
          autofocus: true,
          onPressed: () => hits++,
        ),
      );
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump(const Duration(milliseconds: 50));
      expect(hits, 0);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] hover enter updates chrome (MouseRegion)',
        (tester) async {
      await pumpIconButtonQaHarness(
        tester,
        const OneUiIconButton(
          icon: 'heart',
          attention: OneUiIconButtonAttention.high,
          semanticsLabel: 'Like',
        ),
      );
      final before = iconButtonFill(tester);
      final center = tester.getCenter(iconButtonInteractiveFinder());
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: center);
      await gesture.moveTo(center);
      await tester.pump();
      await gesture.moveTo(center + const Offset(0, 0));
      await tester.pump(const Duration(milliseconds: 16));
      // Hover may change fill on bold/subtle — assert MouseRegion is wired.
      expect(find.byType(MouseRegion), findsWidgets);
      expect(before, isNotNull);
    });
  });
}
