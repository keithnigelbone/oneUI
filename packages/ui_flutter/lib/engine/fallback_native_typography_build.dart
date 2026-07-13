import 'package:ui_flutter/engine/native_design_system_payload.dart';
import 'package:ui_flutter/engine/native_typography_snapshot.dart';
import 'package:ui_flutter/engine/static_weight_families.dart';
import 'package:ui_flutter/tokens/platform_foundation_config.dart';
import 'package:ui_flutter/tokens/typography_scale.dart';

/// Builds a full six-role `NativeTypographySnapshot` from foundation tables +
/// brand `typography.config` — used when Convex snapshot is label-only or missing roles.
NativeTypographySnapshot? buildFallbackNativeTypographySnapshot({
  required String platformId,
  required String density,
  Map<String, dynamic>? typographyConfig,
  List<Map<String, dynamic>>? customFonts,
  NativeDesignSystemPayload? designSystem,
  PlatformsFoundationConfig? platformsFoundationConfig,
}) {
  final slots = resolveFontSlots(typographyConfig, customFonts);
  final entries = getTypographyEntriesForBrand(typographyConfig);
  final byRole = <String, Map<String, dynamic>>{};
  final cfg = typographyConfig != null
      ? unwrapNativeTypographyConfig(typographyConfig)
      : null;
  final letterSpacingByRole = cfg?['letterSpacing'];

  for (final role in typographyRoles) {
    final roleEntries = entries.where((e) => e.role == role);
    final sizesJson = <String, dynamic>{};
    for (final e in roleEntries) {
      final px = resolveTypographyEntryPx(
        entry: e,
        platform: platformId,
        density: density,
        emphasis: 'medium',
        platformsConfig: platformsFoundationConfig,
        typographyConfig: typographyConfig,
        designSystem: designSystem,
      );
      final family = fontFamilyForTypographyRole(role, slots, typographyConfig);
      final sizeJson = <String, dynamic>{
        'fontSize': px.fontSize,
        'lineHeight': px.lineHeight,
        'fontWeight': px.fontWeight,
        'fontFamily': family,
      };
      if (letterSpacingByRole is Map) {
        final em = letterSpacingByRole[role];
        if (em is num && em != 0) {
          sizeJson['letterSpacing'] = em * px.fontSize;
        }
      }
      sizesJson[e.size] = sizeJson;
    }
    if (sizesJson.isEmpty) continue;

    if (role == 'display' || role == 'headline' || role == 'title') {
      byRole[role] = <String, dynamic>{'sizes': sizesJson};
    } else {
      byRole[role] = <String, dynamic>{
        'sizes': sizesJson,
        'weights': Map<String, int>.from(emphasisFontWeights[role]!),
      };
    }
  }

  if (!byRole.containsKey('label') && !byRole.containsKey('body')) {
    return null;
  }

  final staticFamilies =
      staticWeightFamiliesFromTypographyConfig(typographyConfig);

  return NativeTypographySnapshot.tryParse(<String, dynamic>{
    ...byRole,
    'fontFamilies': <String, String>{
      'primary': slots.bodyText,
      'secondary': slots.displayHeading,
      'script': slots.script,
      'code': slots.code,
    },
    if (staticFamilies != null)
      'staticWeightFamilies': _serializeStaticWeightFamilies(staticFamilies),
  });
}

Map<String, dynamic> _serializeStaticWeightFamilies(
  StaticWeightFamiliesBySlot families,
) {
  return {
    for (final slot in families.entries)
      slot.key: {
        for (final weight in slot.value.entries) '${weight.key}': weight.value,
      },
  };
}
