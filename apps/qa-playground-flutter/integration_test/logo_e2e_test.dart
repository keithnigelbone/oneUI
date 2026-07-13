/// Logo — on-device integration tests.
///
/// Renders [OneUiLogo] on the connected emulator / simulator using the same
/// Jio-fixture harness the widget tests use, exercising real engine behaviour:
///   - real size-preset box geometry + mark/full variant layout
///   - real inline-SVG mark render (deterministic, no network)
///   - real loaded raster (`src`, deterministically seeded bytes) + onLoad
///   - real broken-`src` fallback + onError
///   - real interactive button (tap fires) vs. static img landmark
///   - real disabled opacity
///   - real surface-context recolor + dark mode
///   - alt → accessible label; empty alt → decorative; testId → identifier
///
/// `src` rasters are forced via the shared byte-cache ([seedLogoImageBytes] /
/// [seedLogoImageFailure]) so the device run is deterministic and offline.
///
/// Two modes via `--dart-define=DEMO_MODE`:
///   `false` (default, CI-friendly): framework-speed
///   `true` (interactive / debugging): holds each variant ~1.5s
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';

import '../test/support/components/logo_harness.dart';

const bool _demoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);
const _src = 'https://example.com/e2e-logo.png';

/// The real multicolor Jio brand mark (purple disc + white "Jio"), loaded from
/// the bundled asset in [setUpAll]. Mark cases render this so the device shows
/// the actual brand logo; geometry cases that need a non-square aspect keep the
/// synthetic [kQaLogoWordmarkSvg] (the Jio mark is 1:1).
late String _jioLogo;

Future<void> _hold(WidgetTester tester, [int ms = 1500]) async {
  if (!_demoMode) return;
  await tester.pump(Duration(milliseconds: ms));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await ensureJioFixtureReady();
    _jioLogo = await loadJioBrandLogoSvg();
  });
  setUp(clearLogoNetworkCache);
  tearDown(clearLogoNetworkCache);

  group('Logo — on-device', () {
    testWidgets('[e2e] static mark renders with the img landmark + label', (tester) async {
      await pumpLogoJioHarness(tester, OneUiLogo(alt: 'Acme', svgContent: _jioLogo));
      await _hold(tester, 2000);
      expect(logoRootFinder(), findsOneWidget);
      withSemanticsHandle(tester, () {
        expect(find.bySemanticsLabel('Acme'), findsOneWidget);
      });
    });

    testWidgets('[e2e] size presets lay out ascending', (tester) async {
      double? prev;
      for (final size in [OneUiLogoSize.xs, OneUiLogoSize.m, OneUiLogoSize.xl]) {
        await pumpLogoJioHarness(
          tester,
          OneUiLogo(alt: 'x', size: size, svgContent: _jioLogo),
        );
        await _hold(tester);
        final h = logoBoxSize(tester).height;
        if (prev != null) expect(h, greaterThan(prev));
        prev = h;
      }
    });

    testWidgets('[e2e] full variant widens to the wordmark aspect', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', variant: OneUiLogoVariant.full, size: OneUiLogoSize.xl, svgContent: kQaLogoWordmarkSvg),
        width: 240,
      );
      await _hold(tester, 2000);
      final box = logoBoxSize(tester);
      expect(box.width, greaterThan(box.height));
    });

    testWidgets('[e2e] loaded src raster renders + onLoad fires', (tester) async {
      var loads = 0;
      seedLogoImageBytes(_src);
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', src: _src, onLoad: () => loads++),
      );
      await _hold(tester, 2000);
      expect(logoRasterFinder(), findsOneWidget);
      expect(loads, greaterThanOrEqualTo(1));
    });

    testWidgets('[e2e] broken src shows the fallback + fires onError', (tester) async {
      var errors = 0;
      seedLogoImageFailure(_src);
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', src: _src, fallback: const Text('FB'), onError: () => errors++),
      );
      await _hold(tester, 2000);
      expect(find.text('FB'), findsOneWidget);
      expect(errors, 1);
    });

    testWidgets('[e2e] interactive logo is a button that fires', (tester) async {
      var taps = 0;
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'Home', interactive: true, onPress: () => taps++, svgContent: _jioLogo),
      );
      await _hold(tester, 2000);
      expect(logoInteractiveFinder(), findsOneWidget);
      await tester.tap(logoRootFinder());
      await tester.pumpAndSettle();
      expect(taps, 1);
    });

    testWidgets('[e2e] disabled logo dims', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', disabled: true, svgContent: _jioLogo),
      );
      await _hold(tester, 2000);
      expect(logoDisabledOpacity(tester), lessThan(1.0));
    });

    testWidgets('[e2e] decorative (empty alt) is excluded from the AT tree', (tester) async {
      await pumpLogoJioHarness(tester, OneUiLogo(alt: '', svgContent: _jioLogo));
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        final data = logoRootSemantics(tester);
        expect(data.label, isEmpty);
        expect(data.hasFlag(SemanticsFlag.isImage), isFalse);
      });
    });

    testWidgets('[e2e] testId reaches the AT tree via Semantics.identifier', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', testId: 'brand-logo', svgContent: _jioLogo),
      );
      await _hold(tester, 2000);
      withSemanticsHandle(tester, () {
        expect(logoIdentifierFinder('brand-logo'), findsOneWidget);
      });
    });

    testWidgets('[e2e] mark inside a Surface auto-adapts', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.xl, svgContent: _jioLogo),
        surfaceMode: 'bold',
        surfaceAppearance: 'primary',
      );
      await _hold(tester, 2000);
      expect(logoRootFinder(), findsOneWidget);
    });

    testWidgets('[e2e] dark-mode mark renders', (tester) async {
      await pumpLogoJioHarness(
        tester,
        OneUiLogo(alt: 'x', size: OneUiLogoSize.xl, svgContent: _jioLogo),
        darkMode: true,
      );
      await _hold(tester, 2000);
      expect(logoSvgFinder(), findsOneWidget);
    });
  });
}
