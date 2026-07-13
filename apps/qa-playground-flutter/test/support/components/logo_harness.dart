/// Logo harness for QA playground widget tests.
///
/// Mirrors [image_harness.dart] / [divider_harness.dart]:
///   - [qaLogoTestDesignSystem] — synthetic measurement DS. `--Logo-size-*`
///     resolve to fixed px so size geometry assertions read deterministic values
///     WITHOUT re-parsing the brand network.
///   - [pumpLogoQaHarness] — synthetic-DS pump for fast functional/a11y/figma
///     tests (offline). The host is bounded and the child wrapped in an [Align]
///     so an explicit logo box lays out at its natural size (not stretched).
///   - [pumpLogoJioHarness] — real Jio Convex fixture (production-parity) for
///     goldens + real token resolution, with `darkMode` + `surfaceMode`.
///
/// DETERMINISTIC NETWORK: `OneUiLogo` in `src` mode loads its raster through the
/// shared avatar byte loader, which consults [kOneUiAvatarNetworkImageCache] /
/// [kAvatarImageLoadFailed] BEFORE hitting the network. The harness re-exports
/// [seedImageBytes] / [seedImageFailure] (from the avatar cache) so `src`-mode
/// load / error paths are deterministic with zero network and zero flakiness —
/// never a bare `findsOneWidget`.
library;

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/brand/default_jio_brand_logo.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_network_image_cache.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_logo.dart';
import 'package:ui_flutter/widgets/one_ui_logo_types.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography;

export 'package:ui_flutter/widgets/one_ui_logo_types.dart' show OneUiLogoSize, OneUiLogoVariant;

export '../pump_one_ui_app.dart' show kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Canonical fixed px from the synthetic DS — assertions read these so they
/// never re-parse the token they validate. Values are arbitrary-but-distinct so
/// each size preset is uniquely identifiable.
const double kQaLogoSizeXsPx = 16;
const double kQaLogoSizeSPx = 20;
const double kQaLogoSizeMPx = 24;
const double kQaLogoSizeLPx = 32;
const double kQaLogoSizeXlPx = 40;
const double kQaLogoDisabledOpacity = 0.5;
const double kQaLogoPressedOpacity = 0.85;

/// Expected px for every canonical size preset (synthetic DS).
const Map<OneUiLogoSize, double> kQaLogoSizePx = {
  OneUiLogoSize.xs: kQaLogoSizeXsPx,
  OneUiLogoSize.s: kQaLogoSizeSPx,
  OneUiLogoSize.m: kQaLogoSizeMPx,
  OneUiLogoSize.l: kQaLogoSizeLPx,
  OneUiLogoSize.xl: kQaLogoSizeXlPx,
};

/// A square mark SVG (1:1 viewBox) — `mark` variant geometry.
const String kQaLogoMarkSvg = '''
<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10"/>
</svg>''';

/// A wide wordmark SVG (viewBox 80×24 → aspect 10/3) — `full` variant geometry.
const double kQaLogoWordmarkAspect = 80 / 24;
const String kQaLogoWordmarkSvg = '''
<svg viewBox="0 0 80 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="6" width="80" height="12" rx="6"/>
</svg>''';

/// The REAL bundled Jio brand mark (`#3900AD` disc + white "Jio" wordmark path) —
/// the same multicolor asset the platform ships as `/JioLogo.svg`. Used by the
/// on-device E2E so the device shows the actual brand logo (not the synthetic
/// solid-circle [kQaLogoMarkSvg]). Deterministic: a bundled asset, no network.
/// Falls back to [kQaLogoMarkSvg] if the asset cannot be loaded.
Future<String> loadJioBrandLogoSvg() async {
  await DefaultJioBrandLogo.ensureLoaded();
  return DefaultJioBrandLogo.svg ?? kQaLogoMarkSvg;
}

/// Force [url] to resolve to real bytes (LOADED path) with no network.
void seedLogoImageBytes(String url, [Uint8List? bytes]) {
  kAvatarImageLoadFailed.remove(url);
  kOneUiAvatarNetworkImageCache[url] = bytes ?? _kLogoPngBytes;
}

/// Force [url] to fail to load (ERROR / fallback path) with no network.
void seedLogoImageFailure(String url) {
  kOneUiAvatarNetworkImageCache.remove(url);
  kAvatarImageLoadFailed.add(url);
}

/// Reset the shared network cache between tests (call in setUp/tearDown).
void clearLogoNetworkCache() {
  kOneUiAvatarNetworkImageCache.clear();
  kAvatarImageLoadInFlight.clear();
  kAvatarImageLoadFailed.clear();
}

/// A 1×1 transparent PNG — valid, tiny, decodes everywhere.
final Uint8List _kLogoPngBytes = Uint8List.fromList(<int>[
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
  0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
]);

NativeDesignSystemPayload qaLogoTestDesignSystem() {
  final props = <String, String>{
    '--Logo-size-xs': '${kQaLogoSizeXsPx.toInt()}px',
    '--Logo-size-s': '${kQaLogoSizeSPx.toInt()}px',
    '--Logo-size-m': '${kQaLogoSizeMPx.toInt()}px',
    '--Logo-size-l': '${kQaLogoSizeLPx.toInt()}px',
    '--Logo-size-xl': '${kQaLogoSizeXlPx.toInt()}px',
  };
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

Widget _logoQaApp(
  Widget child, {
  required double width,
  required double height,
  NativeDesignSystemPayload? designSystem,
}) {
  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: buildStorybookDemoThemeConfig(),
      darkMode: false,
      child: OneUiScope(
        platformId: 'L',
        density: 'default',
        nativeTypography: qaInputFieldTestTypography(),
        designSystem: designSystem ?? qaLogoTestDesignSystem(),
        child: Scaffold(
          body: Center(
            // Align passes LOOSE constraints so the logo's explicit size box
            // lays out at its natural side length (not stretched to the host).
            child: SizedBox(
              width: width,
              height: height,
              child: Align(alignment: Alignment.center, child: child),
            ),
          ),
        ),
      ),
    ),
  );
}

/// Synthetic-DS pump (offline). Use this for structural assertions (size box,
/// variant width, semantics role/button, clip, opacity, testId identifier) and
/// for the `src` ERROR / fallback path (`seedLogoImageFailure`).
Future<void> pumpLogoQaHarness(
  WidgetTester tester,
  Widget child, {
  double width = 320,
  double height = 240,
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    _logoQaApp(child, width: width, height: height, designSystem: designSystem),
  );
  await tester.pumpAndSettle();
}

/// LOADED-path pump for `src` mode. Decodes the seeded raster inside
/// [WidgetTester.runAsync] so the real `Image` widget renders AND the decode
/// completes before teardown (no leaked `ImageStream`). Seed bytes with
/// [seedLogoImageBytes] first.
Future<void> pumpLogoQaHarnessLoaded(
  WidgetTester tester,
  Widget child, {
  double width = 320,
  double height = 240,
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.runAsync(() async {
    await tester.pumpWidget(
      _logoQaApp(child, width: width, height: height, designSystem: designSystem),
    );
    for (var i = 0; i < 6; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 20));
      await tester.pump(const Duration(milliseconds: 20));
    }
  });
  await tester.pump();
  tester.takeException();
}

// ===========================================================================
// Jio-fixture golden harness — production token resolution.
// ===========================================================================

const int _kLogoDarkRootStep = 100;

Widget pumpLogoJioApp(
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  double width = 320,
  double height = 240,
  String platformId = 'S',
  String density = 'default',
}) {
  final fx = jioFixture;
  final effectiveDark = darkMode ?? fx.darkMode;
  final effectiveStep = darkMode == null
      ? fx.rootParentStep
      : (effectiveDark ? _kLogoDarkRootStep : 2500);

  Widget inner = SizedBox(width: width, height: height, child: Center(child: child));
  if (surfaceMode != null) {
    inner = OneUiSurface(mode: surfaceMode, appearance: surfaceAppearance, child: inner);
  }

  return MaterialApp(
    home: OneUiSurfaceBootstrap(
      themeConfig: fx.themeConfig,
      darkMode: effectiveDark,
      rootParentStep: effectiveStep,
      rootRoles: darkMode == null ? fx.rootRoles : null,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        nativeTypography: fx.nativeTypography,
        designSystem: fx.designSystem,
        child: Scaffold(
          backgroundColor: effectiveDark ? const Color(0xFF101010) : null,
          body: Center(child: Padding(padding: const EdgeInsets.all(12), child: inner)),
        ),
      ),
    ),
  );
}

Future<void> pumpLogoJioHarness(
  WidgetTester tester,
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  double width = 320,
  double height = 240,
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpLogoJioApp(
    child,
    darkMode: darkMode,
    surfaceMode: surfaceMode,
    surfaceAppearance: surfaceAppearance,
    width: width,
    height: height,
  ));
  await tester.pumpAndSettle();
}

// ---------------------------------------------------------------------------
// Finders + real-value accessors.
// ---------------------------------------------------------------------------

Finder logoRootFinder() => find.byType(OneUiLogo);

/// QA payload [KeyedSubtree] — mirrors web `data-*` on the root element.
Finder logoPayloadSubtreeFinder() => find.byWidgetPredicate(
      (w) =>
          w is KeyedSubtree &&
          w.key is ValueKey<String> &&
          (w.key! as ValueKey<String>).value.startsWith('oneui-logo'),
    );

/// Static (non-interactive) logo landmark — web `role="img"`.
Finder logoImageRoleFinder() => find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.image ?? false),
    );

/// Interactive logo — rendered as an [OneUiFocusInteractive] button.
Finder logoInteractiveFinder() => find.byType(OneUiFocusInteractive);

/// The inline SVG content (svg mode) — `flutter_svg`'s `SvgPicture`, matched by
/// runtime-type name to avoid a direct dependency on `flutter_svg`.
Finder logoSvgFinder() => find.descendant(
      of: logoRootFinder(),
      matching: find.byWidgetPredicate((w) => w.runtimeType.toString() == 'SvgPicture'),
    );

/// The rendered raster (`src` mode, LOADED path only).
Finder logoRasterFinder() => find.descendant(
      of: logoRootFinder(),
      matching: find.byType(Image),
    );

/// The outer shell [SizedBox] that fixes the logo box `(shellWidth × dim)`.
Finder logoShellBoxFinder() => find.descendant(
      of: logoRootFinder(),
      matching: find.byType(SizedBox),
    );

/// Real laid-out size of the logo box (shell SizedBox).
Size logoBoxSize(WidgetTester tester) =>
    tester.getSize(logoShellBoxFinder().first);

/// Real disabled opacity — the outer [Opacity] wrapper (only when disabled).
double? logoDisabledOpacity(WidgetTester tester) {
  final f = find.descendant(of: logoRootFinder(), matching: find.byType(Opacity));
  if (f.evaluate().isEmpty) return null;
  return tester.widget<Opacity>(f.first).opacity;
}

SemanticsData logoRootSemantics(WidgetTester tester) {
  return tester.getSemantics(logoRootFinder()).getSemanticsData();
}

/// A [Semantics] node carrying the given automation identifier.
Finder logoIdentifierFinder(String id) => find.byWidgetPredicate(
      (w) => w is Semantics && w.properties.identifier == id,
    );
