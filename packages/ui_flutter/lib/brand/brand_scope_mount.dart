import 'package:flutter/material.dart';

import '../engine/native_theme_snapshot.dart';
import '../foundations/surface_palettes.dart';
import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../utils/brand_dimension_bar_color.dart';
import 'brand_overview_parse.dart';
import 'resolve_brand_canvas.dart';

/// Mounts [OneUiSurfaceBootstrap] + [OneUiScope] from a resolved [NativeThemeSnapshot].
///
/// Shared by [OneUiBrandProvider] (offline / CDN) and [OneUiBrandScope] (Convex Studio).
class OneUiBrandScopeMount extends StatelessWidget {
  const OneUiBrandScopeMount({
    required this.child,
    required this.platformId,
    required this.density,
    required this.themeMode,
    required this.brandId,
    super.key,
    this.snapshot,
    this.brandOverview,
    this.brandSlug,
    this.brandName,
    this.primaryHue,
    this.primaryChroma,
    this.stripSolidHighAttentionOutline = false,
    this.applyTiraCapsulePatch = true,
  });

  final Widget child;
  final String platformId;
  final String density;
  final String themeMode;
  final String brandId;
  final NativeThemeSnapshot? snapshot;
  final Map<String, dynamic>? brandOverview;
  final String? brandSlug;
  final String? brandName;
  final double? primaryHue;
  final double? primaryChroma;
  final bool stripSolidHighAttentionOutline;
  final bool applyTiraCapsulePatch;

  @override
  Widget build(BuildContext context) {
    final activeDimKey = '$platformId:$density';
    final snap = snapshot;
    final designSystem = resolveDesignSystemForBrand(
      brandId: brandId,
      activeDimensionKey: activeDimKey,
      snapshot: snap,
      brandSlug: brandSlug,
      brandName: brandName,
      stripSolidHighAttentionOutline: stripSolidHighAttentionOutline,
      applyTiraCapsulePatch: applyTiraCapsulePatch,
    );
    final platformsConfig = platformsConfigFromBrandOverview(brandOverview) ??
        (brandOverview != null
            ? PlatformsFoundationConfig.tryParse(
                (brandOverview!['platforms'] is Map
                    ? (brandOverview!['platforms'] as Map)['config']
                    : null) as Map<String, dynamic>?,
              )
            : null);
    final typographyConfig = typographyConfigFromBrandOverview(brandOverview);
    final customFonts = customFontsFromBrandOverview(brandOverview);

    final nativeTypography = resolveNativeTypographyForBrand(
      brandId: brandId,
      platformId: platformId,
      density: density,
      designSystem: designSystem,
      snapshot: snap,
      typographyConfig: typographyConfig,
      customFonts: customFonts,
      platformsFoundationConfig: platformsConfig,
    );

    final darkMode =
        snap?.darkMode ?? (themeMode == 'dark' || themeMode == 'dim');

    return OneUiSurfaceBootstrap(
      key: ValueKey<String>(
        'oneui-brand-$brandId-${snap?.schemaVersion ?? 0}-'
        '${snap?.themeConfig.hashCode ?? 0}-$darkMode',
      ),
      themeConfig: snap?.themeConfig ?? buildStorybookDemoThemeConfig(),
      darkMode: darkMode,
      rootParentStep: snap?.rootParentStep,
      rootRoles: snap?.rootRoles,
      child: OneUiScope(
        platformId: platformId,
        density: density,
        platformsFoundationConfig: platformsConfig,
        foundationAccentColor: resolveDimensionBarAccentColor(
          rootRoles: snap?.rootRoles,
          brandOverview: brandOverview,
          primaryHue: primaryHue,
          primaryChroma: primaryChroma,
        ),
        typographyConfig: typographyConfig,
        customFonts: customFonts,
        designSystem: designSystem,
        nativeTypography: nativeTypography,
        buttonOrnament: snap?.buttonOrnament,
        child: Material(
          type: MaterialType.transparency,
          child: child,
        ),
      ),
    );
  }
}

/// Extract brand overview map from [OneUiBrandData.foundation] envelope.
Map<String, dynamic>? brandOverviewFromFoundation(Object? foundation) {
  if (foundation is! Map) return null;
  final m = Map<String, dynamic>.from(foundation);
  if (m.containsKey('color') || m.containsKey('typography')) {
    return m;
  }
  return null;
}
