/// Logo platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// The `src`-mode raster renderer is chosen at COMPILE time by a conditional
/// import (`one_ui_image_remote.dart`): Flutter-web uses `Image.network`,
/// IO/mobile/desktop use `Image.memory` from HTTP bytes. Widget tests run on the
/// Dart VM (IO path), so the web `Image.network` branch is exercised by the
/// browser E2E / goldens, not here — documented, not faked (asserting
/// `Image.network` in a VM test would be false confidence).
///
/// What IS pinned here, per `debugDefaultTargetPlatformOverride`:
///   - Android / iOS (TalkBack / VoiceOver): static img landmark + label, the
///     interactive button (tap fires), the loaded raster (IO `Image.memory`).
///   - linux / macOS (web/desktop proxy): identical semantics; a static logo is
///     NOT a button/focusable; the SVG content mode renders without a network.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';

import '../../support/components/logo_harness.dart';

const _src = 'https://example.com/logo.png';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      clearLogoNetworkCache();
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
        clearLogoNetworkCache();
      }
    });
  }
}

void main() {
  // ===========================================================================
  // Mobile (Android / iOS).
  // ===========================================================================

  group('[platform][mobile] Logo', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] static logo exposes img landmark + label',
        (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'Mobile brand', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        expect(logoRootSemantics(tester).hasFlag(SemanticsFlag.isImage), isTrue);
        expect(find.bySemanticsLabel('Mobile brand'), findsOneWidget);
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] interactive logo is a button that fires',
        (tester) async {
      var hits = 0;
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onPress: () => hits++, svgContent: kQaLogoMarkSvg),
      );
      withSemanticsHandle(tester, () {
        expect(logoRootSemantics(tester).hasFlag(SemanticsFlag.isButton), isTrue);
      });
      await tester.tap(logoRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] src loaded raster renders (IO Image.memory path)',
        (tester) async {
      seedLogoImageBytes(_src);
      await pumpLogoQaHarnessLoaded(tester, const OneUiLogo(alt: 'x', src: _src));
      expect(logoRasterFinder(), findsOneWidget);
    });
  });

  // ===========================================================================
  // Web / desktop proxy.
  // ===========================================================================

  group('[platform][web] Logo', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] static logo exposes img landmark',
        (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'Web brand', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Web brand'), findsOneWidget);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] static logo is not a button/focusable',
        (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'x', svgContent: kQaLogoMarkSvg));
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(data.hasFlag(SemanticsFlag.isTextField), isFalse);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] inline SVG content mode renders without a network',
        (tester) async {
      await pumpLogoQaHarness(tester, OneUiLogo(alt: 'x', svgContent: kQaLogoMarkSvg));
      expect(logoSvgFinder(), findsOneWidget);
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] interactive logo is a button that fires',
        (tester) async {
      var hits = 0;
      await pumpLogoQaHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onClick: () => hits++, svgContent: kQaLogoMarkSvg),
      );
      await tester.tap(logoRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });
  });
}
