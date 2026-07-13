import '../engine/fallback_native_typography_build.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/native_theme_snapshot.dart';
import '../engine/native_typography_snapshot.dart';
import '../engine/role_root_surface_fill.dart';
import '../tokens/platform_foundation_config.dart';
import 'brand_overview_parse.dart';
import 'default_design_system.dart';
import 'design_system_normalize.dart';

/// Resolves [OneUiScope.designSystem] for branded or unbranded canvas.
NativeDesignSystemPayload? resolveDesignSystemForBrand({
  required String brandId,
  required String activeDimensionKey,
  required NativeThemeSnapshot? snapshot,
  String? brandSlug,
  String? brandName,
  bool stripSolidHighAttentionOutline = false,
  bool applyTiraCapsulePatch = true,
}) {
  if (brandId.isEmpty) {
    return defaultUnbrandedDesignSystem(activeDimensionKey: activeDimensionKey);
  }

  final manifest =
      defaultUnbrandedDesignSystem(activeDimensionKey: activeDimensionKey);
  final raw = snapshot?.designSystem;
  final NativeDesignSystemPayload base;
  if (raw == null) {
    base = manifest;
  } else if (raw.componentCustomProperties.isNotEmpty) {
    base = mergeComponentTokenManifestFallback(
      raw,
      activeDimensionKey: activeDimensionKey,
    );
  } else {
    base = NativeDesignSystemPayload(
      componentCustomProperties: manifest.componentCustomProperties,
      dimensionContexts: raw.dimensionContexts,
      activeDimensionKey: raw.activeDimensionKey.isNotEmpty
          ? raw.activeDimensionKey
          : manifest.activeDimensionKey,
      activeDimensionContext:
          raw.activeDimensionContext ?? manifest.activeDimensionContext,
    );
  }

  var out = base;
  final fillProps = rootRoleFillPropertiesFromSnapshot(snapshot?.rootRoles);
  if (fillProps.isNotEmpty) {
    final merged = Map<String, String>.from(out.componentCustomProperties);
    for (final entry in fillProps.entries) {
      merged.putIfAbsent(entry.key, () => entry.value);
    }
    out = NativeDesignSystemPayload(
      componentCustomProperties: merged,
      dimensionContexts: out.dimensionContexts,
      activeDimensionKey: out.activeDimensionKey,
      activeDimensionContext: out.activeDimensionContext,
    );
  }
  if (stripSolidHighAttentionOutline) {
    out = normalizeSolidHighAttention(out);
  }
  if (applyTiraCapsulePatch) {
    out = normalizeTiraRetailCapsuleButtons(
      out,
      slug: brandSlug,
      name: brandName,
    );
  }
  return ensureFocusDimensionSlice(out);
}

/// Resolves [OneUiScope.nativeTypography] for branded or unbranded canvas.
NativeTypographySnapshot? resolveNativeTypographyForBrand({
  required String brandId,
  required String platformId,
  required String density,
  required NativeDesignSystemPayload? designSystem,
  required NativeThemeSnapshot? snapshot,
  Map<String, dynamic>? typographyConfig,
  List<Map<String, dynamic>>? customFonts,
  PlatformsFoundationConfig? platformsFoundationConfig,
}) {
  if (brandId.isEmpty && designSystem != null) {
    return defaultUnbrandedNativeTypography(
      platformId: platformId,
      density: density,
      designSystem: designSystem,
      platformsFoundationConfig: platformsFoundationConfig,
    );
  }

  final fromSnap = NativeTypographySnapshot.tryParse(snapshot?.typography);
  if (fromSnap != null) {
    final merged = buildFallbackNativeTypographySnapshot(
      platformId: platformId,
      density: density,
      typographyConfig: typographyConfig,
      customFonts: customFonts,
      designSystem: designSystem,
      platformsFoundationConfig: platformsFoundationConfig,
    );
    if (merged != null && fromSnap.emphasisStyle('body', 'M') == null) {
      return merged;
    }
    return fromSnap;
  }

  if (brandId.isNotEmpty && designSystem != null) {
    return defaultUnbrandedNativeTypography(
      platformId: platformId,
      density: density,
      designSystem: designSystem,
      platformsFoundationConfig: platformsFoundationConfig,
    );
  }
  return null;
}

bool designSystemFromConvexSnapshot({
  required String brandId,
  required NativeThemeSnapshot? snapshot,
}) {
  return brandId.isNotEmpty &&
      snapshot?.designSystem?.componentCustomProperties.isNotEmpty == true;
}
