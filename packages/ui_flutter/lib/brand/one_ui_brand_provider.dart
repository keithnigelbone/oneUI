import 'package:flutter/material.dart';

import '../engine/native_theme_snapshot.dart';
import '../icons/jio_icon_catalog.dart';
import '../utils/viewport_to_platform.dart';
import 'brand_scope_mount.dart';
import 'cdn_brand_cache.dart';
import 'default_jio_brand_logo.dart';
import 'default_jiomart_brand_logo.dart';
import 'default_jio_brand_snapshot.dart';
import 'one_ui_brand_data.dart';
import 'one_ui_brand_scope.dart';
import 'oneui_brands_catalog.dart';

/// Production brand provider — **no Convex dependency**.
///
/// Mirrors `@oneui/ui-native` `<OneUIBrandProvider>`:
///
/// ```dart
/// // Default bundled Jio (after DefaultJioBrandSnapshot.ensureLoaded() in main)
/// OneUiBrandProvider(
///   mode: 'light',
///   child: MyApp(),
/// )
///
/// // CDN slug (after `oneui-native-cdn prefetch` + `pnpm flutter:sync-cdn-cache`)
/// OneUiBrandProvider(
///   brand: 'jio',
///   theme: 'jiomart',
///   mode: 'light',
///   child: MyApp(),
/// )
///
/// // Pre-resolved snapshot (advanced)
/// OneUiBrandProvider(
///   snapshot: mySnapshot,
///   brandId: 'custom',
///   mode: 'light',
///   child: MyApp(),
/// )
/// ```
///
/// For One UI Studio live preview, use [OneUiBrandScope] with `convexUrl` + `brandId`.
class OneUiBrandProvider extends StatelessWidget {
  const OneUiBrandProvider({
    required this.child,
    super.key,
    this.brand,
    this.theme,
    this.mode = 'light',
    this.density = 'default',
    this.platformId = 'S',
    this.nativeThemePlatform = 'mobile',
    this.snapshot,
    this.brandId,
    this.brandSlug,
    this.brandName,
    this.loading,
    this.stripSolidHighAttentionOutline = false,
    this.applyTiraCapsulePatch = true,
  });

  final Widget child;

  /// Brand slug (`jio`), [OneUiBrandData], or [NativeThemeSnapshot]. Omit for bundled Jio default.
  final Object? brand;

  /// Sub-brand slug (`jiomart`) when [brand] is a parent slug string.
  final String? theme;

  /// `light` | `dark` | `dim` (`dim` → dark internally).
  final String mode;

  /// `compact` | `default` | `open`
  final String density;

  /// V2 platform id for dimensions (`S`, `L`, …).
  final String platformId;

  /// `mobile` | `tablet` | `desktop` — used for CDN snapshot key resolution.
  final String nativeThemePlatform;

  /// Optional explicit snapshot (bypasses slug / default resolution).
  final NativeThemeSnapshot? snapshot;

  /// Convex-style brand document id when known (defaults to slug).
  final String? brandId;

  final String? brandSlug;
  final String? brandName;

  /// Shown while [DefaultJioBrandSnapshot.ensureLoaded] has not completed.
  final Widget? loading;

  final bool stripSolidHighAttentionOutline;
  final bool applyTiraCapsulePatch;

  String get _effectiveMode => mode == 'dim' ? 'dark' : mode;

  NativeThemeSnapshot? _resolveSnapshot() {
    if (snapshot != null) return snapshot;

    if (brand is NativeThemeSnapshot) {
      return brand as NativeThemeSnapshot;
    }

    final themeMode = _effectiveMode;
    final platform = nativeThemePlatform.isNotEmpty
        ? nativeThemePlatform
        : nativeThemePlatformArgFromV2Id(platformId);

    if (brand is String) {
      final slug = (brand as String).toLowerCase();
      if (theme != null && theme!.isNotEmpty && theme != 'base') {
        final themed = getCdnThemeSnapshot(
          slug,
          theme!,
          themeMode: themeMode,
          platform: platform,
          density: density,
        );
        if (themed != null) return themed;
      }
      final cached = getCdnBrandSnapshot(
        slug,
        themeMode: themeMode,
        platform: platform,
        density: density,
      );
      if (cached != null) return cached;
    }

    return DefaultJioBrandSnapshot.forMode(themeMode);
  }

  String _resolveBrandId(String slug) {
    if (brandId != null && brandId!.isNotEmpty) return brandId!;
    if (snapshot?.brandId != null && snapshot!.brandId!.isNotEmpty) {
      return snapshot!.brandId!;
    }
    if (brand is String && (brand as String).isNotEmpty) {
      return brand as String;
    }
    return slug.isEmpty ? 'default-jio' : slug;
  }

  Map<String, dynamic>? _resolveBrandOverview() {
    if (brand is OneUiBrandData) {
      return brandOverviewFromFoundation((brand as OneUiBrandData).foundation);
    }
    if (brand is Map<String, dynamic>) {
      final m = brand as Map<String, dynamic>;
      if (m.containsKey('foundation')) {
        return brandOverviewFromFoundation(m['foundation']);
      }
    }
    return null;
  }

  String _resolveBrandName(String slug, String? themeProp) {
    if (brandName != null && brandName!.trim().isNotEmpty) {
      return brandName!.trim();
    }
    final variant = themeProp?.trim();
    if (variant != null && variant.isNotEmpty && variant != 'base') {
      return formatOneUiBrandSlugLabel(variant);
    }
    if (slug == 'jio') return 'Jio';
    return formatOneUiBrandSlugLabel(slug);
  }

  String? _resolveLogoSvg(String? themeProp) {
    final variant = themeProp?.trim().toLowerCase();
    if (variant == 'jiomart') {
      return DefaultJioMartBrandLogo.svg ?? DefaultJioBrandLogo.svg;
    }
    return DefaultJioBrandLogo.svg;
  }

  @override
  Widget build(BuildContext context) {
    final slug = brand is String
        ? (brand as String).toLowerCase()
        : (brandSlug ?? 'jio').toLowerCase();
    final resolved = _resolveSnapshot();
    final themeProp = theme?.trim();

    if (resolved == null) {
      return loading ?? const SizedBox.shrink();
    }

    return OneUiBrandLoadState(
      loading: false,
      snapshot: resolved,
      brandOverview: _resolveBrandOverview(),
      logoSvg: _resolveLogoSvg(themeProp),
      brandName: _resolveBrandName(slug, themeProp),
      child: OneUiBrandScopeMount(
        platformId: platformId,
        density: density,
        themeMode: _effectiveMode,
        brandId: _resolveBrandId(slug),
        snapshot: resolved,
        brandOverview: _resolveBrandOverview(),
        brandSlug: brandSlug ?? (brand is String ? brand as String : slug),
        brandName: brandName,
        stripSolidHighAttentionOutline: stripSolidHighAttentionOutline,
        applyTiraCapsulePatch: applyTiraCapsulePatch,
        child: child,
      ),
    );
  }
}

/// Call from `main()` before [runApp] when using [OneUiBrandProvider] without an
/// explicit [snapshot].
Future<void> ensureOneUiBrandDefaultsLoaded(
    {bool loadCdnManifest = false}) async {
  await JioIconCatalog.instance.ensureLoaded();
  await DefaultJioBrandSnapshot.ensureLoaded();
  await DefaultJioBrandLogo.ensureLoaded();
  await DefaultJioMartBrandLogo.ensureLoaded();
  if (loadCdnManifest) {
    await loadBundledCdnBrandSnapshots();
  }
}
