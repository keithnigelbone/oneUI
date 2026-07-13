import '../engine/fallback_native_typography_build.dart';
import '../engine/native_design_system_payload.dart';
import '../engine/native_typography_snapshot.dart';
import '../tokens/platform_foundation_config.dart';
import 'default_component_properties_map.dart';
import 'selectable_button_default_component_tokens.dart';
import 'single_text_button_default_component_tokens.dart';

Map<String, String> _mergedDefaultComponentTokenProperties() {
  return {
    ...kDefaultComponentTokenProperties,
    ...kSelectableButtonDefaultComponentTokenProperties,
    ...kSingleTextButtonDefaultComponentTokenProperties,
  };
}

/// Stroke + halo primitives for focus rings when Convex omits them from flat `--*` maps.
NativeDimensionContext storybookFocusDimensionContext(
    String activeDimensionKey) {
  final parts = activeDimensionKey.split(':');
  final platformId = parts.isNotEmpty ? parts[0] : 'S';
  final densityId = parts.length > 1 ? parts[1] : 'default';
  return NativeDimensionContext(
    platformId: platformId,
    densityId: densityId,
    dimensions: const {
      '--Stroke-XL': '2px',
      '--Focus-Outline-Width': '2px',
      '--Surface-Main': '#ffffff',
      '--Surface-Halo-Gap': '#ffffff',
    },
    gridMargin: '16px',
    gridGutter: '12px',
  );
}

/// Ensures stroke / halo primitives exist for [resolveOneUiFocusRingSpec] (Storybook + brands).
NativeDesignSystemPayload ensureFocusDimensionSlice(
    NativeDesignSystemPayload ds) {
  final key = ds.activeDimensionKey;
  if (key.isEmpty) return ds;
  final parts = key.split(':');
  if (parts.length != 2) return ds;
  final plat = parts[0];
  final den = parts[1];
  final hasSlice = ds.dimensionContexts.any(
    (c) => c.platformId == plat && c.densityId == den,
  );
  if (hasSlice) return ds;

  final slice = storybookFocusDimensionContext(key);
  return NativeDesignSystemPayload(
    componentCustomProperties: ds.componentCustomProperties,
    dimensionContexts: [...ds.dimensionContexts, slice],
    activeDimensionKey: ds.activeDimensionKey,
    activeDimensionContext: ds.activeDimensionContext ?? slice,
  );
}

/// Manifest-only component `--*` map when no brand is selected (parity with web Storybook
/// `preview.ts` no-brand + TS `buildAllComponentCustomPropertiesFlat(empty)`).
NativeDesignSystemPayload defaultUnbrandedDesignSystem(
    {required String activeDimensionKey}) {
  final focusCtx = storybookFocusDimensionContext(activeDimensionKey);
  return NativeDesignSystemPayload(
    componentCustomProperties: Map<String, String>.from(
      _mergedDefaultComponentTokenProperties(),
    ),
    dimensionContexts: [focusCtx],
    activeDimensionKey: activeDimensionKey,
    activeDimensionContext: focusCtx,
  );
}

/// Convex `designSystem` wins on overlap; default manifest fills missing `--*` keys
/// (Badge sizing, CounterBadge, IndicatorBadge, etc.) when the snapshot is partial.
NativeDesignSystemPayload mergeComponentTokenManifestFallback(
  NativeDesignSystemPayload convex, {
  required String activeDimensionKey,
}) {
  final manifest =
      defaultUnbrandedDesignSystem(activeDimensionKey: activeDimensionKey);
  final merged = Map<String, String>.from(_mergedDefaultComponentTokenProperties());
  merged.addAll(convex.componentCustomProperties);
  final mergedDs = NativeDesignSystemPayload(
    componentCustomProperties: merged,
    dimensionContexts: convex.dimensionContexts.isNotEmpty
        ? convex.dimensionContexts
        : manifest.dimensionContexts,
    activeDimensionKey: convex.activeDimensionKey.isNotEmpty
        ? convex.activeDimensionKey
        : manifest.activeDimensionKey,
    activeDimensionContext:
        convex.activeDimensionContext ?? manifest.activeDimensionContext,
  );
  return ensureFocusDimensionSlice(mergedDs);
}

NativeTypographySnapshot? defaultUnbrandedNativeTypography({
  required String platformId,
  required String density,
  required NativeDesignSystemPayload designSystem,
  PlatformsFoundationConfig? platformsFoundationConfig,
}) {
  return buildFallbackNativeTypographySnapshot(
    platformId: platformId,
    density: density,
    typographyConfig: null,
    customFonts: null,
    designSystem: designSystem,
    platformsFoundationConfig: platformsFoundationConfig,
  );
}
