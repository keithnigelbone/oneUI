/// Divider platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// Divider is a NON-interactive visual separator (no focus, no keyboard, no
/// tap), so the platform contract is about LAYOUT and AT exposure:
///   - Android / iOS (TalkBack / VoiceOver): a separator landmark with the
///     optional hint; decorative line segments are hidden; the stroke lays out
///     at its resolved px.
///   - linux / macOS (web/desktop proxy): same separator landmark + hint; the
///     separator is NOT a focusable/interactive node (no button/textfield role).
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`. Runs
/// offline on the synthetic measurement harness.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_divider.dart';

import '../../support/components/divider_harness.dart';

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
  // Mobile (Android / iOS) — TalkBack / VoiceOver separator landmark + layout.
  // ===========================================================================

  group('[platform][mobile] Divider', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] exposes a separator landmark with hint',
        (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(semanticsHint: 'Section break'));
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorSemantics(tester).hint, 'Section break');
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] stroke lays out at its resolved px',
        (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(size: 'l'));
      expect(dividerStrokePx(tester, horizontal: true), kQaDividerStrokePx['l']);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] decorative lines are hidden from AT',
        (tester) async {
      await pumpDividerQaHarness(
        tester,
        const OneUiDivider(content: 'label', child: 'OR'),
      );
      withSemanticsHandle(tester, () {
        expect(dividerHiddenLineSegmentCount(tester), 2);
      });
    });
  });

  // ===========================================================================
  // Web / desktop — separator landmark; NOT focusable/interactive.
  // ===========================================================================

  group('[platform][web] Divider', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] exposes a separator landmark',
        (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider());
      withSemanticsHandle(tester, () {
        expect(dividerSeparatorFinder(), findsWidgets);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] separator is not interactive/focusable',
        (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(semanticsHint: 'Sep'));
      withSemanticsHandle(tester, () {
        final data = dividerSeparatorSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(data.hasFlag(SemanticsFlag.isTextField), isFalse);
        expect(data.hasFlag(SemanticsFlag.isFocusable), isFalse);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] vertical stroke lays out at its resolved width',
        (tester) async {
      await pumpDividerQaHarness(tester, const OneUiDivider(orientation: 'vertical', size: 's'));
      expect(dividerStrokePx(tester, horizontal: false), kQaDividerStrokePx['s']);
    });
  });
}
