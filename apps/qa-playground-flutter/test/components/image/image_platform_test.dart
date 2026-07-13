/// Image platform-specific QA tests — Flutter web/desktop vs Android/iOS.
///
/// The renderer is chosen at COMPILE time by a conditional import
/// (`one_ui_image_remote.dart`): Flutter-web uses `Image.network`, IO/mobile/
/// desktop use `Image.memory` from HTTP bytes. Widget tests run on the Dart VM
/// (IO path) so the web `Image.network` branch is exercised by the browser E2E /
/// goldens, not here — that is documented, not faked (asserting `Image.network`
/// in a VM test would be false confidence).
///
/// What IS pinned here, per `debugDefaultTargetPlatformOverride`:
///   - Android / iOS (TalkBack / VoiceOver): static img landmark + label, the
///     interactive button, the loaded raster, and objectPosition alignment.
///   - linux / macOS (web/desktop proxy): identical semantics; a static image is
///     NOT focusable/interactive; all loading strategies render.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../../support/components/image_harness.dart';

const _src = 'https://example.com/photo.jpg';

const _kMobilePlatforms = [TargetPlatform.android, TargetPlatform.iOS];
const _kWebDesktopPlatforms = [TargetPlatform.linux, TargetPlatform.macOS];

void _onPlatforms(
  List<TargetPlatform> platforms,
  String description,
  Future<void> Function(WidgetTester tester) body,
) {
  for (final platform in platforms) {
    testWidgets('$description (${platform.name})', (tester) async {
      clearImageNetworkCache();
      debugDefaultTargetPlatformOverride = platform;
      try {
        await body(tester);
      } finally {
        debugDefaultTargetPlatformOverride = null;
        clearImageNetworkCache();
      }
    });
  }
}

void main() {
  // ===========================================================================
  // Mobile (Android / iOS).
  // ===========================================================================

  group('[platform][mobile] Image', () {
    _onPlatforms(_kMobilePlatforms, '[mobile] static image exposes img landmark + label',
        (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'Mobile photo'));
      withSemanticsHandle(tester, () {
        expect(imageSemanticsRoleFinder(), findsWidgets);
        expect(find.bySemanticsLabel('Mobile photo'), findsOneWidget);
      });
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] interactive image is a button that fires',
        (tester) async {
      var hits = 0;
      seedImageFailure(_src);
      await pumpImageQaHarness(
        tester,
        OneUiImage(src: _src, alt: 'Tap', interactive: true, onPress: () => hits++),
      );
      withSemanticsHandle(tester, () {
        expect(imageRootSemantics(tester).hasFlag(SemanticsFlag.isButton), isTrue);
      });
      await tester.tap(imageRootFinder());
      await tester.pumpAndSettle();
      expect(hits, 1);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] loaded raster renders (IO Image.memory path)',
        (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageRasterFinder(), findsOneWidget);
    });

    _onPlatforms(_kMobilePlatforms, '[mobile] objectPosition maps to the raster alignment',
        (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(
        tester,
        const OneUiImage(src: _src, alt: 'x', objectPosition: 'top left'),
      );
      expect(imageRasterAlignment(tester), Alignment.topLeft);
    });
  });

  // ===========================================================================
  // Web / desktop proxy.
  // ===========================================================================

  group('[platform][web] Image', () {
    _onPlatforms(_kWebDesktopPlatforms, '[web] static image exposes img landmark',
        (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'Web photo'));
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Web photo'), findsOneWidget);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] static image is not focusable/interactive',
        (tester) async {
      seedImageFailure(_src);
      await pumpImageQaHarness(tester, const OneUiImage(src: _src, alt: 'x'));
      withSemanticsHandle(tester, () {
        final data = imageRootSemantics(tester);
        expect(data.hasFlag(SemanticsFlag.isButton), isFalse);
        expect(data.hasFlag(SemanticsFlag.isTextField), isFalse);
      });
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] every loading strategy renders',
        (tester) async {
      for (final l in OneUiImageLoadingStrategy.values) {
        seedImageFailure(_src);
        await pumpImageQaHarness(tester, OneUiImage(src: _src, alt: 'x', loading: l));
        expect(imageRootFinder(), findsOneWidget);
      }
    });

    _onPlatforms(_kWebDesktopPlatforms, '[web] centre objectPosition aligns the raster',
        (tester) async {
      seedImageBytes(_src);
      await pumpImageQaHarnessLoaded(tester, const OneUiImage(src: _src, alt: 'x'));
      expect(imageRasterAlignment(tester), Alignment.center);
    });
  });
}
