/// Loads Jio brand fixtures (snapshot + brand overview) and runs them through
/// the *exact same* production resolution pipeline used by [OneUiBrandScope]
/// at runtime (`resolveDesignSystemForBrand`, `resolveNativeTypographyForBrand`).
///
/// Tests render byte-identical to the qa-playground:flutter web app: no
/// synthetic palettes, no algorithmic divergence, no false confidence. The
/// only thing that doesn't happen here is the Convex HTTP fetch — those JSON
/// payloads are bundled as assets and refreshed via
/// `pnpm sync:jio-theme-snapshot`.
///
/// Usage:
///
///   await ensureJioFixtureReady();        // once per test process
///   final fx = jioFixture;                // throws if not preloaded
///   OneUiSurfaceBootstrap(
///     themeConfig: fx.themeConfig,
///     darkMode: fx.darkMode,
///     rootParentStep: fx.rootParentStep,
///     rootRoles: fx.rootRoles,
///     child: OneUiScope(
///       designSystem: fx.designSystem,
///       nativeTypography: fx.nativeTypography,
///       ...
///     ),
///   );
library;

import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:ui_flutter/brand/brand_overview_parse.dart';
import 'package:ui_flutter/brand/resolve_brand_canvas.dart';
import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_theme_snapshot.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/surface_engine.dart';

/// Resolved Jio brand fixture, derived from the Convex snapshot + brand
/// overview via the production resolution functions.
class JioFixture {
  const JioFixture({
    required this.brandId,
    required this.brandSlug,
    required this.brandName,
    required this.themeConfig,
    required this.darkMode,
    required this.rootParentStep,
    required this.rootRoles,
    required this.designSystem,
    required this.nativeTypography,
    required this.rawSnapshot,
    required this.rawBrandOverview,
  });

  final String brandId;
  final String brandSlug;
  final String brandName;
  final ThemeConfig themeConfig;
  final bool darkMode;
  final int rootParentStep;
  final Map<String, dynamic>? rootRoles;
  final NativeDesignSystemPayload designSystem;
  final NativeTypographySnapshot? nativeTypography;

  /// Raw parsed JSON for advanced harness use (e.g. building partial fixtures
  /// for diagnostic bisection).
  final NativeThemeSnapshot rawSnapshot;
  final Map<String, dynamic> rawBrandOverview;
}

JioFixture? _cached;
Future<JioFixture>? _inflight;

/// Preloads the Jio fixtures off the asset bundle and runs them through the
/// production resolution functions. Idempotent — safe to call from many tests.
/// Subsequent calls return the cached instance immediately.
Future<JioFixture> ensureJioFixtureReady({
  String platformId = 'S',
  String density = 'default',
}) async {
  if (_cached != null) return _cached!;
  _inflight ??= _load(platformId: platformId, density: density);
  return _inflight!;
}

/// Synchronous accessor for the resolved fixture. Throws when called before
/// [ensureJioFixtureReady] has completed — test harnesses MUST await the
/// async initializer first.
JioFixture get jioFixture {
  final c = _cached;
  if (c == null) {
    throw StateError(
      'jioFixture accessed before ensureJioFixtureReady() completed. '
      'Call `await ensureJioFixtureReady();` in your test setup.',
    );
  }
  return c;
}

const _kJioBrandSlug = 'jio';
const _kJioBrandName = 'Jio';

Future<JioFixture> _load({
  required String platformId,
  required String density,
}) async {
  final snapshotJson = await rootBundle.loadString(
    'assets/qa-fixtures/jio/theme-snapshot.json',
  );
  final overviewJson = await rootBundle.loadString(
    'assets/qa-fixtures/jio/brand-overview.json',
  );
  final manifestJson = await rootBundle.loadString(
    'assets/qa-fixtures/jio/manifest.json',
  );

  final snapshot = NativeThemeSnapshot.tryParse(
    jsonDecode(snapshotJson) as Map<String, dynamic>,
  );
  if (snapshot == null) {
    throw StateError(
      'Jio theme snapshot fixture failed to parse. Re-run `pnpm sync:jio-theme-snapshot`.',
    );
  }
  final overview = jsonDecode(overviewJson) as Map<String, dynamic>;
  final manifest = jsonDecode(manifestJson) as Map<String, dynamic>;
  final brandId = manifest['brandId'] as String? ?? 'jio';

  final platformsConfig = platformsConfigFromBrandOverview(overview);
  final typographyConfig = typographyConfigFromBrandOverview(overview);
  // Convex brand overview lists `customFonts` with HTTPS `fileUrl`s served
  // from Convex storage (e.g. `JioType Var`). The Flutter font loader would
  // try to fetch those over the network and `pumpAndSettle` would never
  // return inside headless `flutter test` (which has `--disable-asset-fonts`
  // and no proxy). Drop them here — tests still render Jio's real palette /
  // surface / sizing tokens; only the font outlines fall back to the test
  // engine's default. That's the correct trade-off for headless QA.
  //
  // Integration tests on a real device DO have network, so this same loader
  // is fine there — but the harness is shared, and the more conservative
  // behaviour (no font fetch) is the right default.

  final activeDimKey = '$platformId:$density';
  final designSystem = resolveDesignSystemForBrand(
    brandId: brandId,
    activeDimensionKey: activeDimKey,
    snapshot: snapshot,
    brandSlug: _kJioBrandSlug,
    brandName: _kJioBrandName,
  );
  if (designSystem == null) {
    throw StateError(
      'resolveDesignSystemForBrand returned null for Jio fixture — '
      'snapshot may be malformed.',
    );
  }
  final nativeTypography = resolveNativeTypographyForBrand(
    brandId: brandId,
    platformId: platformId,
    density: density,
    designSystem: designSystem,
    snapshot: snapshot,
    typographyConfig: typographyConfig,
    customFonts: null, // see note above
    platformsFoundationConfig: platformsConfig,
  );

  final fx = JioFixture(
    brandId: brandId,
    brandSlug: _kJioBrandSlug,
    brandName: _kJioBrandName,
    themeConfig: snapshot.themeConfig,
    darkMode: snapshot.darkMode,
    rootParentStep: snapshot.rootParentStep,
    rootRoles: snapshot.rootRoles,
    designSystem: designSystem,
    nativeTypography: nativeTypography,
    rawSnapshot: snapshot,
    rawBrandOverview: overview,
  );
  _cached = fx;
  return fx;
}
