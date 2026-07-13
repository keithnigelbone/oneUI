import 'package:flutter/widgets.dart';

import '../theme/one_ui_scope.dart';
import 'native_design_system_payload.dart';

/// Visible metallic presets — mirrors `VISIBLE_METALLIC_PRESETS` in shared engine.
const Set<String> kOneUiLogoVisibleMetallicPresets = {
  'gold',
  'silver',
  'bronze',
  'custom',
  'platinum',
  'roseGold',
};

const Map<String, String> _kMetallicTokenLabels = {
  'gold': 'Gold',
  'silver': 'Silver',
  'bronze': 'Bronze',
  'custom': 'Custom',
  'platinum': 'Platinum',
  'roseGold': 'RoseGold',
};

/// Gradient stop keys emitted by `applyLogoSvgMaterial` / `materialCSS.ts`.
const List<String> kMetallicGradientStops = [
  'Shadow',
  'Base',
  'BaseLight',
  'Highlight',
];

class LogoMetallicGradientColors {
  const LogoMetallicGradientColors({
    required this.shadow,
    required this.base,
    required this.baseLight,
    required this.highlight,
  });

  final String shadow;
  final String base;
  final String baseLight;
  final String highlight;
}

String? _resolveMaterialTokenHex(
  BuildContext context,
  NativeDesignSystemPayload ds,
  String tokenName,
) {
  final scope = OneUiScope.of(context);
  final resolved = ds.resolveCSSValue(
    'var($tokenName)',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
  if (resolved == null) return null;
  final t = resolved.trim();
  if (t.startsWith('#')) return t;
  final peeled = NativeDesignSystemPayload.peelLeadingVar(t);
  if (peeled != null && peeled.startsWith('#')) return peeled;
  return null;
}

/// Resolves metallic gradient stop hex values from injected brand CSS tokens.
LogoMetallicGradientColors? resolveLogoMetallicGradientColors(
  BuildContext context,
  String preset,
) {
  final label = _kMetallicTokenLabels[preset];
  if (label == null) return null;
  final ds = OneUiScope.designSystemOf(context);
  if (ds == null) return null;

  String? stop(String suffix) => _resolveMaterialTokenHex(
        context,
        ds,
        '--Material-Metallic-$label-$suffix',
      );

  final shadow = stop('Shadow');
  final base = stop('Base');
  final baseLight = stop('BaseLight');
  final highlight = stop('Highlight');
  if (shadow == null ||
      base == null ||
      baseLight == null ||
      highlight == null) {
    return null;
  }
  return LogoMetallicGradientColors(
    shadow: shadow,
    base: base,
    baseLight: baseLight,
    highlight: highlight,
  );
}

String getMetallicTokenLabel(String preset) =>
    _kMetallicTokenLabels[preset] ?? preset;

/// Validates preset and normalises to canonical wire value.
String? normalizeLogoMaterialPreset(String? raw) {
  if (raw == null || raw.isEmpty) return null;
  if (kOneUiLogoVisibleMetallicPresets.contains(raw)) return raw;
  return null;
}

int logoMaterialColorFingerprint(BuildContext context, String? material) {
  if (material == null) return 0;
  final colors = resolveLogoMetallicGradientColors(context, material);
  if (colors == null) return material.hashCode;
  return Object.hash(
    colors.shadow,
    colors.base,
    colors.baseLight,
    colors.highlight,
  );
}
