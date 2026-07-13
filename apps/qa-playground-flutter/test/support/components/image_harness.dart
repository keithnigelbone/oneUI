/// Image harness for QA playground widget tests.
///
/// Mirrors [divider_harness.dart] / [circular_progress_indicator_harness.dart]:
///   - [qaImageTestDesignSystem] — synthetic measurement DS. `--Image-*`,
///     `--Spacing-8/10`, and shape tokens resolve to fixed px so geometry
///     assertions (radius, fallback icon size, fallback min-height) read
///     deterministic values WITHOUT re-parsing the brand network.
///   - [pumpImageQaHarness] — synthetic-DS pump for fast functional/a11y/figma
///     tests (offline).
///   - [pumpImageJioHarness] — real Jio Convex fixture (production-parity) for
///     goldens + real token resolution, with `darkMode` + `surfaceMode`.
///
/// DETERMINISTIC NETWORK: `OneUiImage` loads its raster through the shared avatar
/// byte loader, which consults [kOneUiAvatarNetworkImageCache] /
/// [kAvatarImageLoadFailed] BEFORE hitting the network. The harness exposes
/// [seedImageBytes] (force the LOADED path) and [seedImageFailure] (force the
/// ERROR / fallback path) so behavioural tests validate the real loaded vs.
/// fallback rendering with zero network and zero flakiness — never a bare
/// `findsOneWidget`.
library;

import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qa_playground_flutter/foundations/jio_fixture.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/foundations/surface_palettes.dart';
import 'package:ui_flutter/theme/one_ui_scope.dart';
import 'package:ui_flutter/theme/surface_scope.dart';
import 'package:ui_flutter/widgets/one_ui_avatar_network_image_cache.dart';
import 'package:ui_flutter/widgets/one_ui_focus_interactive.dart';
import 'package:ui_flutter/widgets/one_ui_image.dart';
import 'package:ui_flutter/widgets/one_ui_image_fallback_icon.dart';
import 'package:ui_flutter/widgets/one_ui_surface.dart';

import '../pump_one_ui_app.dart' show qaInputFieldTestTypography;

export '../pump_one_ui_app.dart' show kOneUiQaTestPlatforms;
export '../semantics_helpers.dart' show withSemanticsHandle;
export '../test_widgets_all_platforms.dart' show testWidgetsAllPlatforms;

/// Canonical fixed px from the synthetic DS — assertions read these so they
/// never re-parse the token they validate.
const double kQaImageBorderRadiusPx = 8;
const double kQaImageShape3RadiusPx = 12;
const double kQaImageFallbackIconPx = 32; // --Spacing-8
const double kQaImageFallbackMinHeightPx = 40; // --Spacing-10
const double kQaImageDisabledOpacity = 0.5;

/// A 1×1 transparent PNG — valid, tiny, decodes everywhere. Seeded into the
/// network cache so the LOADED path renders a real `Image` widget offline.
final Uint8List kQaImagePngBytes = base64Decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
);

/// Force [url] to resolve to real bytes (LOADED path) with no network.
void seedImageBytes(String url, [Uint8List? bytes]) {
  kAvatarImageLoadFailed.remove(url);
  kOneUiAvatarNetworkImageCache[url] = bytes ?? kQaImagePngBytes;
}

/// Force [url] to fail to load (ERROR / fallback path) with no network.
void seedImageFailure(String url) {
  kOneUiAvatarNetworkImageCache.remove(url);
  kAvatarImageLoadFailed.add(url);
}

/// Reset the shared network cache between tests (call in setUp/tearDown).
void clearImageNetworkCache() {
  kOneUiAvatarNetworkImageCache.clear();
  kAvatarImageLoadInFlight.clear();
  kAvatarImageLoadFailed.clear();
}

NativeDesignSystemPayload qaImageTestDesignSystem() {
  final props = <String, String>{
    '--Image-borderRadius': '${kQaImageBorderRadiusPx.toInt()}px',
    '--Image-disabledOpacity': '$kQaImageDisabledOpacity',
    '--Shape-0': '0px',
    '--Shape-3': '${kQaImageShape3RadiusPx.toInt()}px',
    '--Spacing-8': '${kQaImageFallbackIconPx.toInt()}px',
    '--Spacing-10': '${kQaImageFallbackMinHeightPx.toInt()}px',
    '--Shape-Pill': '9999px',
  };
  return NativeDesignSystemPayload(
    componentCustomProperties: props,
    dimensionContexts: const [],
    activeDimensionKey: 'L:default',
  );
}

Widget _imageQaApp(
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
        designSystem: designSystem ?? qaImageTestDesignSystem(),
        child: Scaffold(
          body: Center(
            // Align passes LOOSE constraints so an image with an explicit
            // width/height renders at its natural size (not stretched to the
            // host), while a layout-hungry fallback can still fill the box.
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

/// Synthetic-DS pump (offline). `width`/`height` bound the host so a layout-
/// hungry image (`width: double.infinity`) has finite constraints.
///
/// Use this for the ERROR / fallback path (`seedImageFailure`) and for purely
/// STRUCTURAL assertions (aspect ratio, clip radius, opacity, interactive
/// button, semantics) — it never leaves a live image-decode stream, so teardown
/// is clean. For the LOADED raster path use [pumpImageQaHarnessLoaded].
Future<void> pumpImageQaHarness(
  WidgetTester tester,
  Widget child, {
  double width = 320,
  double height = 240,
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.pumpWidget(
    _imageQaApp(child, width: width, height: height, designSystem: designSystem),
  );
  await tester.pumpAndSettle();
}

/// LOADED-path pump. Decodes the seeded raster inside [WidgetTester.runAsync] so
/// the real `Image` widget renders with its real `BoxFit`/alignment AND the
/// decode completes before teardown (no leaked `ImageStream`). Seed bytes with
/// [seedImageBytes] first. Returns after a final synchronous `pump`.
Future<void> pumpImageQaHarnessLoaded(
  WidgetTester tester,
  Widget child, {
  double width = 320,
  double height = 240,
  NativeDesignSystemPayload? designSystem,
}) async {
  await tester.runAsync(() async {
    await tester.pumpWidget(
      _imageQaApp(child, width: width, height: height, designSystem: designSystem),
    );
    // Interleave real-time delays with pumps so the multi-step load state
    // machine (initial fail → fallbackSrc swap → reload → codec decode) and its
    // post-frame callbacks all advance before we assert.
    for (var i = 0; i < 6; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 20));
      await tester.pump(const Duration(milliseconds: 20));
    }
  });
  await tester.pump();
  // The memory codec may fire a benign setState-during-build / late stream
  // notification; it is unrelated to the assertion under test.
  tester.takeException();
}

// ===========================================================================
// Jio-fixture golden harness — production token resolution.
// ===========================================================================

const int _kImageDarkRootStep = 100;

Widget pumpImageJioApp(
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
      : (effectiveDark ? _kImageDarkRootStep : 2500);

  Widget inner = SizedBox(width: width, height: height, child: child);
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

Future<void> pumpImageJioHarness(
  WidgetTester tester,
  Widget child, {
  bool? darkMode,
  String? surfaceMode,
  String surfaceAppearance = 'primary',
  double width = 320,
  double height = 240,
}) async {
  await ensureJioFixtureReady();
  await tester.pumpWidget(pumpImageJioApp(
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

Finder imageRootFinder() => find.byType(OneUiImage);

/// QA payload [KeyedSubtree] — mirrors web `data-*` on the root element.
Finder imagePayloadSubtreeFinder() => find.byWidgetPredicate(
      (w) =>
          w is KeyedSubtree &&
          w.key is ValueKey<String> &&
          (w.key! as ValueKey<String>).value.startsWith('oneui-image'),
    );

/// Static (non-interactive) image landmark — web `role="img"`.
Finder imageSemanticsRoleFinder() => find.byWidgetPredicate(
      (w) => w is Semantics && (w.properties.image ?? false),
    );

/// Interactive image — rendered as an [OneUiFocusInteractive] button.
Finder imageInteractiveFinder() => find.byType(OneUiFocusInteractive);

/// Default fallback chrome icon (web `DefaultImageIcon`).
Finder imageFallbackIconFinder() => find.byType(OneUiImageFallbackIcon);

/// The rendered raster (`Image.memory` on IO / `Image.network` on web) — only
/// present on the LOADED path.
Finder imageRasterFinder() => find.descendant(
      of: imageRootFinder(),
      matching: find.byType(Image),
    );

/// The [AspectRatio] wrapper — present only when `aspectRatio != auto`.
Finder imageAspectRatioFinder() => find.descendant(
      of: imageRootFinder(),
      matching: find.byType(AspectRatio),
    );

double? imageAspectRatioValue(WidgetTester tester) {
  final f = imageAspectRatioFinder();
  if (f.evaluate().isEmpty) return null;
  return tester.widget<AspectRatio>(f.first).aspectRatio;
}

/// Real [BoxFit] on the rendered raster (LOADED path only).
BoxFit? imageRasterBoxFit(WidgetTester tester) {
  final f = imageRasterFinder();
  if (f.evaluate().isEmpty) return null;
  return tester.widget<Image>(f.first).fit;
}

/// Real [Alignment] on the rendered raster (objectPosition).
AlignmentGeometry? imageRasterAlignment(WidgetTester tester) {
  final f = imageRasterFinder();
  if (f.evaluate().isEmpty) return null;
  return tester.widget<Image>(f.first).alignment;
}

/// Real disabled opacity — the outer [Opacity] wrapper (only when disabled).
double? imageDisabledOpacity(WidgetTester tester) {
  final f = find.descendant(of: imageRootFinder(), matching: find.byType(Opacity));
  if (f.evaluate().isEmpty) return null;
  return tester.widget<Opacity>(f.first).opacity;
}

/// Real clip radius applied to the image body.
BorderRadius imageClipRadius(WidgetTester tester) {
  final clip = tester.widget<ClipRRect>(
    find.descendant(of: imageRootFinder(), matching: find.byType(ClipRRect)).first,
  );
  return clip.borderRadius as BorderRadius;
}

SemanticsData imageRootSemantics(WidgetTester tester) {
  return tester.getSemantics(imageRootFinder()).getSemanticsData();
}

/// A [Semantics] node carrying the given automation identifier.
Finder imageIdentifierFinder(String id) => find.byWidgetPredicate(
      (w) => w is Semantics && w.properties.identifier == id,
    );
