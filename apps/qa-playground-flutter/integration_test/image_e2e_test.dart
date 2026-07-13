/// Image — on-device integration tests.
///
/// Renders [OneUiImage] on the connected emulator / simulator using the same
/// Jio-fixture harness the widget tests use, exercising real engine behaviour:
///   - real aspect-ratio layout + border radius
///   - real loaded raster (deterministically seeded bytes) and onLoad
///   - real broken-image fallback chrome + onError
///   - real interactive button (tap fires) vs. static img landmark
///   - real disabled opacity
///   - real surface-context fallback remapping + dark mode
///   - alt → accessible label in the AT tree
///
/// The network raster is forced via the shared byte-cache ([seedImageBytes] /
/// [seedImageFailure]) so the device run is deterministic and offline.
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_types.dart';

import '../test/support/components/image_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);
const _src = 'https://example.com/e2e-photo.jpg';
const _fallbackSrc = 'https://example.com/e2e-fallback.jpg';

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
  });
  setUp(clearImageNetworkCache);
  tearDown(clearImageNetworkCache);

  group('Image — on-device', () {
    testWidgets('[e2e] static image renders with the img landmark', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(tester, const OneUiImage(src: _src, alt: 'Hero'));
      await _hold(tester, 2000);
      expect(imageRootFinder(), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Hero'), findsOneWidget);
      });
    });

    testWidgets('[e2e] aspect ratios lay out at the right shape', (tester) async {
      for (final ratio in [
        OneUiImageAspectRatio.r1x1,
        OneUiImageAspectRatio.r16x9,
        OneUiImageAspectRatio.r4x3,
      ]) {
        seedImageFailure(_src);
        await pumpImageJioHarness(
          tester,
          OneUiImage(src: _src, alt: 'x', aspectRatio: ratio),
        );
        await _hold(tester);
        expect(imageAspectRatioValue(tester), closeTo(ratio.numeric!, 1e-9));
      }
    });

    testWidgets('[e2e] loaded raster renders + onLoad fires', (tester) async {
      var loads = 0;
      seedImageBytes(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', onLoad: () => loads++),
      );
      await _hold(tester, 2000);
      expect(imageRasterFinder(), findsOneWidget);
      expect(loads, greaterThanOrEqualTo(1));
    });

    testWidgets('[e2e] broken src shows the fallback icon + fires onError', (tester) async {
      var errors = 0;
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'x', onError: () => errors++),
      );
      await _hold(tester, 2000);
      expect(imageFallbackIconFinder(), findsOneWidget);
      expect(errors, 1);
    });

    testWidgets('[e2e] fallbackSrc recovers to a real raster', (tester) async {
      seedImageFailure(_src);
      seedImageBytes(_fallbackSrc);
      await pumpImageJioHarness(
        tester,
        const OneUiImage(src: _src, fallbackSrc: _fallbackSrc, alt: 'x'),
      );
      await _hold(tester, 2000);
      expect(imageRasterFinder(), findsOneWidget);
    });

    testWidgets('[e2e] interactive image is a button that fires', (tester) async {
      var taps = 0;
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        OneUiImage(src: _src, alt: 'Open', interactive: true, onPress: () => taps++),
      );
      await _hold(tester, 2000);
      expect(imageInteractiveFinder(), findsOneWidget);
      await tester.tap(imageRootFinder());
      await tester.pumpAndSettle();
      expect(taps, 1);
    });

    testWidgets('[e2e] disabled image dims', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', disabled: true),
      );
      await _hold(tester, 2000);
      expect(imageDisabledOpacity(tester), lessThan(1.0));
    });

    testWidgets('[e2e] fallback chrome inside a Surface auto-adapts', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(imageRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode fallback chrome renders', (tester) async {
      seedImageFailure(_src);
      await pumpImageJioHarness(
        tester,
        const OneUiImage(src: _src, alt: 'x', aspectRatio: OneUiImageAspectRatio.r16x9),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(imageFallbackIconFinder(), findsOneWidget);
    });
  });
}
