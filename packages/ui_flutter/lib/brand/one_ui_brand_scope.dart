import 'package:flutter/material.dart';

import '../convex/fetch_brand_overview_data.dart';
import '../convex/fetch_brand_record.dart';
import '../convex/fetch_native_theme_snapshot.dart';
import '../engine/native_theme_snapshot.dart';
import '../tokens/platform_foundation_config.dart';
import 'brand_overview_parse.dart';
import 'brand_scope_mount.dart';
import 'native_snapshot_brand_match.dart';

/// Loads brand foundations from Convex and mounts [OneUiSurfaceBootstrap] + [OneUiScope].
///
/// **Unbranded** (`brandId` empty): no HTTP calls; uses [defaultUnbrandedDesignSystem] and
/// [buildStorybookDemoThemeConfig] for surfaces (same as web Storybook with no brand).
///
/// **Branded**: one `nativeTheme:getNativeThemeSnapshot` call per theme/density/platform change,
/// plus `foundations:getBrandOverviewData` when [brandId] is set (platforms + typography config).
class OneUiBrandScope extends StatefulWidget {
  const OneUiBrandScope({
    required this.child,
    required this.platformId,
    required this.density,
    required this.theme,
    super.key,
    this.convexUrl = '',
    this.brandId = '',
    this.nativeThemePlatform = 'mobile',
    this.brandSlug,
    this.brandName,
    this.primaryHue,
    this.primaryChroma,
    this.stripSolidHighAttentionOutline = false,
    this.applyTiraCapsulePatch = true,
    this.loading,
    this.errorBuilder,
  });

  final Widget child;

  /// V2 platform id (`S`, `L`, …) — passed to [OneUiScope.platformId].
  final String platformId;

  /// `compact` | `default` | `open`
  final String density;

  /// `light` | `dark` — Convex `nativeTheme` theme argument.
  final String theme;

  /// Convex deployment URL (`https://….convex.cloud`). Required when [brandId] is non-empty.
  final String convexUrl;

  /// Convex brand document id. Empty = unbranded manifest + demo surfaces.
  final String brandId;

  /// Convex `nativeTheme` `platform` argument: `mobile` | `tablet` | `desktop`.
  final String nativeThemePlatform;

  final String? brandSlug;
  final String? brandName;
  final double? primaryHue;
  final double? primaryChroma;

  /// Strip outline-style bold button tokens (Flutter gallery parity with solid presets).
  final bool stripSolidHighAttentionOutline;

  /// Coerce Tira retail capsule radii when Convex lacks server-side patch.
  final bool applyTiraCapsulePatch;

  /// Optional overlay while branded foundations load (e.g. [CircularProgressIndicator]).
  final Widget? loading;

  /// Shown when branded load fails and no cached snapshot exists.
  final Widget Function(BuildContext context, Object error)? errorBuilder;

  @override
  State<OneUiBrandScope> createState() => _OneUiBrandScopeState();
}

class _OneUiBrandScopeState extends State<OneUiBrandScope> {
  bool _loading = false;
  Object? _loadError;
  NativeThemeSnapshot? _snapshot;
  Map<String, dynamic>? _brandOverview;
  String? _logoSvg;
  PlatformsFoundationConfig? _platformsConfig;
  Map<String, dynamic>? _typographyConfig;
  List<Map<String, dynamic>>? _customFonts;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  @override
  void didUpdateWidget(OneUiBrandScope oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.brandId != oldWidget.brandId ||
        widget.convexUrl != oldWidget.convexUrl ||
        widget.theme != oldWidget.theme ||
        widget.density != oldWidget.density ||
        widget.nativeThemePlatform != oldWidget.nativeThemePlatform) {
      _reload();
    }
  }

  void _reload() {
    final id = widget.brandId;
    if (id.isEmpty || widget.convexUrl.isEmpty) {
      setState(() {
        _loading = false;
        _loadError = null;
        _snapshot = null;
        _brandOverview = null;
        _logoSvg = null;
        _platformsConfig = null;
        _typographyConfig = null;
        _customFonts = null;
      });
      return;
    }

    setState(() {
      _loading = true;
      _loadError = null;
      _snapshot = null;
      _brandOverview = null;
      _logoSvg = null;
      _platformsConfig = null;
      _typographyConfig = null;
      _customFonts = null;
    });

    final themeStr = widget.theme == 'dark' ? 'dark' : 'light';
    Future.wait<Object?>([
      fetchBrandOverviewData(widget.convexUrl, id),
      fetchNativeThemeSnapshot(
        widget.convexUrl,
        id,
        themeStr,
        density: widget.density,
        platform: widget.nativeThemePlatform,
      ),
      fetchBrandRecord(widget.convexUrl, id),
    ]).then((results) {
      if (!mounted || widget.brandId != id) return;

      final overview = results[0] as Map<String, dynamic>?;
      var snap = results[1] as NativeThemeSnapshot?;
      if (snap != null && !nativeSnapshotBrandMatchesSelection(snap, id)) {
        snap = null;
      }
      final brandRecord = results[2] as Map<String, dynamic>?;
      final logoRaw = brandRecord?['logoSvg'];
      final logoSvg =
          logoRaw is String && logoRaw.trim().isNotEmpty ? logoRaw : null;

      setState(() {
        _loading = false;
        _brandOverview = overview;
        _logoSvg = logoSvg;
        _platformsConfig = platformsConfigFromBrandOverview(overview);
        _typographyConfig = typographyConfigFromBrandOverview(overview);
        _customFonts = customFontsFromBrandOverview(overview);
        _snapshot = snap;
      });
    }).catchError((Object e, StackTrace _) {
      if (!mounted || widget.brandId != id) return;
      setState(() {
        _loading = false;
        _loadError = e;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loadError != null && widget.brandId.isNotEmpty && _snapshot == null) {
      final err = widget.errorBuilder;
      if (err != null) {
        return err(context, _loadError!);
      }
    }

    final snap = _snapshot;
    final themeMode = widget.theme == 'dark' ? 'dark' : 'light';

    final tree = OneUiBrandScopeMount(
      platformId: widget.platformId,
      density: widget.density,
      themeMode: themeMode,
      brandId: widget.brandId,
      snapshot: snap,
      brandOverview: _brandOverview,
      brandSlug: widget.brandSlug,
      brandName: widget.brandName,
      primaryHue: widget.primaryHue,
      primaryChroma: widget.primaryChroma,
      stripSolidHighAttentionOutline: widget.stripSolidHighAttentionOutline,
      applyTiraCapsulePatch: widget.applyTiraCapsulePatch,
      child: widget.child,
    );

    final scoped = OneUiBrandLoadState(
      loading: _loading,
      snapshot: _snapshot,
      brandOverview: _brandOverview,
      logoSvg: _logoSvg,
      brandName: widget.brandName,
      child: tree,
    );

    if (_loading && widget.loading != null) {
      // Stack defaults to AlignmentDirectional.topStart — requires Directionality
      // even when this scope sits above MaterialApp (QA playground, Storybook shell).
      return Directionality(
        textDirection: TextDirection.ltr,
        child: Stack(
          fit: StackFit.passthrough,
          children: [
            scoped,
            Positioned.fill(child: widget.loading!),
          ],
        ),
      );
    }
    return scoped;
  }
}

/// Inherited access to the latest branded load state (optional diagnostics).
class OneUiBrandLoadState extends InheritedWidget {
  const OneUiBrandLoadState({
    required this.loading,
    required this.snapshot,
    required this.brandOverview,
    required super.child,
    super.key,
    this.logoSvg,
    this.brandName,
  });

  final bool loading;
  final NativeThemeSnapshot? snapshot;
  final Map<String, dynamic>? brandOverview;

  /// Raw SVG from Convex `brands.logoSvg` — web `BrandLogoContext` parity.
  final String? logoSvg;
  final String? brandName;

  static OneUiBrandLoadState? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<OneUiBrandLoadState>();
  }

  @override
  bool updateShouldNotify(OneUiBrandLoadState oldWidget) {
    return loading != oldWidget.loading ||
        snapshot != oldWidget.snapshot ||
        brandOverview != oldWidget.brandOverview ||
        logoSvg != oldWidget.logoSvg ||
        brandName != oldWidget.brandName;
  }
}
