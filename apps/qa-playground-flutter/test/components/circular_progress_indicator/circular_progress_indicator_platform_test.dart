/// CircularProgressIndicator platform-specific QA tests — Flutter web/desktop vs
/// Android/iOS.
///
/// CPI is a NON-interactive status indicator (no focus, no keyboard, no tap), so
/// the platform contract is about how progress is ANNOUNCED and ANIMATED:
///   - Android / iOS (TalkBack / VoiceOver): determinate exposes a "N percent"
///     value; indeterminate is busy (no value); the ring lays out at its
///     resolved diameter; the indeterminate ticker keeps running.
///   - linux / macOS (web/desktop proxy): same AT value contract; aria-live
///     polite drives a live region; the control does NOT steal keyboard focus
///     (it is a status role, not a widget).
///
/// Per-platform behaviour pinned via `debugDefaultTargetPlatformOverride`. Runs
/// offline on the synthetic measurement harness.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_circular_progress_indicator.dart';

import '../../support/components/circular_progress_indicator_harness.dart';

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
  // Mobile (Android / iOS) — TalkBack / VoiceOver progress announcement.
  // ===========================================================================

  group('[platform][mobile] CircularProgressIndicator', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] determinate announces "N percent"',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 42, semanticsLabel: 'Upload'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Upload').value, '42');
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] indeterminate is busy (no value)',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(variant: 'indeterminate', semanticsLabel: 'Loading'),
        settle: false,
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Loading').value, anyOf(isNull, isEmpty));
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] ring lays out at its resolved diameter',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, size: 'XL', semanticsLabel: 'Sz'),
      );
      expect(cpiDiameterPx(tester), kQaCpiDiameterPx['XL']);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] indeterminate keeps animating across frames',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(variant: 'indeterminate', semanticsLabel: 'Spin'),
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pump(const Duration(milliseconds: 100));
      expect(cpiPainter(tester).isIndeterminate, isTrue);
      expect(cpiRootFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // Web / desktop — same AT value + live region; status role, not focusable.
  // ===========================================================================

  group('[platform][web] CircularProgressIndicator', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] determinate exposes the value string',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 73, semanticsLabel: 'Range'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsData(tester, 'Range').value, '73');
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] aria-live polite drives a live region',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 10, semanticsLabel: 'Live', ariaLive: 'polite'),
      );
      withSemanticsHandle(tester, () {
        expect(cpiSemanticsWithLiveRegionFinder(), findsWidgets);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] status indicator does not steal keyboard focus',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, semanticsLabel: 'Status'),
      );
      await tester.pump();
      final node = tester.getSemantics(cpiSemanticsFinder('Status'));
      // A progress indicator is a status role — it must not be a focusable
      // widget that intercepts keyboard traversal.
      expect(node.getSemanticsData().hasFlag(SemanticsFlag.isButton), isFalse);
      expect(node.getSemanticsData().hasFlag(SemanticsFlag.isTextField), isFalse);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] ring lays out at its resolved diameter',
        (tester) async {
      await pumpCpiQaHarness(
        tester,
        const OneUiCircularProgressIndicator(value: 50, size: '2XL', semanticsLabel: 'Sz'),
      );
      expect(cpiDiameterPx(tester), kQaCpiDiameterPx['2XL']);
    });
  });
}
