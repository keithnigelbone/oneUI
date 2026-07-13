import 'package:flutter/material.dart';

import '../foundations/typography_preview_utils.dart';
import '../theme/one_ui_scope.dart';
import '../tokens/typography_scale.dart';
import '../tokens/jio_type_font.dart';
import '../utils/storybook_google_fonts.dart';
import '../widgets/one_ui_text_types.dart';
import 'fallback_native_typography_build.dart';
import 'native_typography_snapshot.dart';
import 'static_weight_families.dart';
import 'typography_role_features.dart';

/// Brand typography from Convex `nativeTheme.typography` snapshot.
TextStyle? resolveOneUiTextTypographyStyle(
  BuildContext context, {
  required OneUiTextVariant variant,
  required String size,
  required OneUiTextWeight weight,
  OneUiTextLanguage language = OneUiTextLanguage.latin,
  String? resolvedScript,
  OneUiTextScriptMode scriptMode = OneUiTextScriptMode.ui,
}) {
  final scope = OneUiScope.maybeOf(context);
  if (scope == null) return null;

  final role = oneUiTextTypographyRole(variant);
  TextStyle? base;
  final snapshot = _effectiveTypographySnapshot(context, scope);
  if (snapshot != null) {
    if (oneUiTextUsesEmphasisWeights(variant)) {
      base = snapshot.emphasisStyle(
        role,
        size,
        emphasis: oneUiTextWeightEmphasis(weight),
      );
    } else {
      base = snapshot.fixedRoleStyle(role, size);
    }
  }

  base ??= _typographyFromFoundationTables(
    context,
    scope: scope,
    role: role,
    size: size,
    weight: weight,
    variant: variant,
  );

  if (base == null) return null;

  var preserveResolvedFontFamily = false;
  if (variant != OneUiTextVariant.code &&
      resolvedScript != null &&
      resolvedScript.isNotEmpty) {
    final overlay = snapshot?.scriptVariantOverlay(
      scriptId: resolvedScript,
      scriptMode: scriptMode.name,
      role: role,
      size: size,
    );
    if (overlay != null) {
      preserveResolvedFontFamily = true;
      base = base.copyWith(
        fontFamily: overlay.fontFamily ?? base.fontFamily,
        height: overlay.height ?? base.height,
      );
    }
  } else if (variant != OneUiTextVariant.code &&
      language == OneUiTextLanguage.others) {
    final scriptFamily = snapshot?.fontFamilyScript;
    if (scriptFamily != null && scriptFamily.isNotEmpty) {
      preserveResolvedFontFamily = true;
      base = base.copyWith(fontFamily: scriptFamily);
    }
  }

  base = _applyTypographyRoleFeatures(scope: scope, role: role, base: base);

  final staticApplied = _applyStaticWeightFamily(
    snapshot: snapshot,
    scope: scope,
    role: role,
    base: base,
    skipStaticWeight: preserveResolvedFontFamily,
  );

  return applyJioVariableFontFallback(
    _applyLoadedBrandFont(
      context,
      scope: scope,
      role: role,
      base: staticApplied.style,
      weightViaFontFamily: staticApplied.weightViaFontFamily,
      staticFamilyName: staticApplied.staticFamilyName,
      preserveFontFamily: preserveResolvedFontFamily,
    ),
  );
}

NativeTypographySnapshot? _effectiveTypographySnapshot(
  BuildContext context,
  OneUiScope scope,
) {
  final snap = scope.nativeTypography;
  if (snap != null &&
      _snapshotHasRole(snap, 'display') &&
      _snapshotHasRole(snap, 'body')) {
    return snap;
  }
  return buildFallbackNativeTypographySnapshot(
        platformId: scope.platformId,
        density: scope.density,
        typographyConfig: scope.typographyConfig,
        customFonts: scope.customFonts,
        designSystem: scope.designSystem,
        platformsFoundationConfig: scope.platformsFoundationConfig,
      ) ??
      snap;
}

bool _snapshotHasRole(NativeTypographySnapshot snap, String role) {
  return snap.fixedRoleStyle(role, 'M') != null ||
      snap.emphasisStyle(role, 'M') != null;
}

TextStyle? _typographyFromFoundationTables(
  BuildContext context, {
  required OneUiScope scope,
  required String role,
  required String size,
  required OneUiTextWeight weight,
  required OneUiTextVariant variant,
}) {
  TypographyEntry? entry;
  for (final e in getTypographyEntriesForBrand(scope.typographyConfig)) {
    if (e.role == role && e.size == size) {
      entry = e;
      break;
    }
  }
  if (entry == null) return null;

  final emphasis = oneUiTextUsesEmphasisWeights(variant)
      ? oneUiTextWeightEmphasis(weight)
      : 'medium';
  final px = resolveTypographyEntryPx(
    entry: entry,
    platform: scope.platformId,
    density: scope.density,
    emphasis: emphasis,
    platformsConfig: scope.platformsFoundationConfig,
    typographyConfig: scope.typographyConfig,
    designSystem: scope.designSystem,
  );
  final slots = resolveFontSlots(scope.typographyConfig, scope.customFonts);
  final family =
      fontFamilyForTypographyRole(role, slots, scope.typographyConfig);
  final fs = px.fontSize;
  return TextStyle(
    fontFamily: family,
    fontSize: fs,
    height: fs > 0 ? px.lineHeight / fs : 1.0,
    fontWeight: foundationFontWeight(px.fontWeight),
  );
}

TextStyle _applyTypographyRoleFeatures({
  required OneUiScope scope,
  required String role,
  required TextStyle base,
}) {
  final fs = base.fontSize;
  if (fs == null || fs <= 0) return base;

  final letterSpacing = resolveTypographyLetterSpacingPx(
    typographyConfig: scope.typographyConfig,
    role: role,
    fontSize: fs,
    snapshotLetterSpacing: base.letterSpacing,
  );
  final variations = resolveTypographyFontVariations(
    typographyConfig: scope.typographyConfig,
    role: role,
  );
  final features = resolveTypographyFontFeatures(
    typographyConfig: scope.typographyConfig,
    role: role,
  );

  return base.copyWith(
    letterSpacing: letterSpacing,
    fontVariations: variations ?? base.fontVariations,
    fontFeatures: features ?? base.fontFeatures,
  );
}

class _StaticWeightResult {
  const _StaticWeightResult({
    required this.style,
    required this.weightViaFontFamily,
    this.staticFamilyName,
  });

  final TextStyle style;
  final bool weightViaFontFamily;
  final String? staticFamilyName;
}

_StaticWeightResult _applyStaticWeightFamily({
  required NativeTypographySnapshot? snapshot,
  required OneUiScope scope,
  required String role,
  required TextStyle base,
  required bool skipStaticWeight,
}) {
  if (skipStaticWeight) {
    return _StaticWeightResult(style: base, weightViaFontFamily: false);
  }

  final staticFamilies = snapshot?.staticWeightFamilies ??
      staticWeightFamiliesFromTypographyConfig(scope.typographyConfig);
  if (staticFamilies == null) {
    return _StaticWeightResult(style: base, weightViaFontFamily: false);
  }

  final weight = base.fontWeight?.value ?? 400;
  final staticFamily = resolveStaticWeightFamilyForRole(
    staticFamilies,
    role,
    weight,
  );
  if (staticFamily == null) {
    return _StaticWeightResult(style: base, weightViaFontFamily: false);
  }

  return _StaticWeightResult(
    style: TextStyle(
      inherit: base.inherit,
      fontFamily: staticFamily,
      fontFamilyFallback: base.fontFamilyFallback,
      fontSize: base.fontSize,
      height: base.height,
      letterSpacing: base.letterSpacing,
      fontVariations: base.fontVariations,
      fontFeatures: base.fontFeatures,
      color: base.color,
      backgroundColor: base.backgroundColor,
      fontStyle: base.fontStyle,
      decoration: base.decoration,
      decorationColor: base.decorationColor,
    ),
    weightViaFontFamily: true,
    staticFamilyName: staticFamily,
  );
}

TextStyle _applyLoadedBrandFont(
  BuildContext context, {
  required OneUiScope? scope,
  required String role,
  required TextStyle base,
  bool weightViaFontFamily = false,
  String? staticFamilyName,
  bool preserveFontFamily = false,
}) {
  if (scope == null) return base;
  if (preserveFontFamily) return base;
  final fs = base.fontSize;
  if (fs == null || fs <= 0) return base;
  final lh = (base.height ?? 1.2) * fs;

  if (weightViaFontFamily && staticFamilyName != null) {
    if (isJioTypeFamilyName(staticFamilyName)) {
      return TextStyle(
        fontFamily: kJioTypeVariableFontFamily,
        fontSize: fs,
        height: base.height,
        letterSpacing: base.letterSpacing,
        fontVariations: base.fontVariations,
        fontFeatures: base.fontFeatures,
        color: base.color,
        fontStyle: base.fontStyle,
        decoration: base.decoration,
        decorationColor: base.decorationColor,
        fontWeight: jioStaticFamilyToWeight(staticFamilyName,
            fallback: base.fontWeight),
      );
    }
    return TextStyle(
      fontFamily: staticFamilyName,
      fontSize: fs,
      height: base.height,
      letterSpacing: base.letterSpacing,
      fontVariations: base.fontVariations,
      fontFeatures: base.fontFeatures,
      color: base.color,
      fontStyle: base.fontStyle,
      decoration: base.decoration,
      decorationColor: base.decorationColor,
    );
  }

  final slotIds = resolveFontSlotIds(scope.typographyConfig, scope.customFonts);
  final fontId = curatedFontIdForTypographyRole(
    role,
    slotIds,
    scope.typographyConfig,
  );
  final uploaded = uploadedFamilyForFontId(fontId, scope.customFonts);
  final loaded = storybookLoadedTextStyle(
    fontId: fontId,
    uploadedFamilyName: uploaded,
    fontSize: fs,
    lineHeightPx: lh,
    fontWeight: base.fontWeight ?? FontWeight.w400,
    color: base.color,
    letterSpacing: base.letterSpacing,
    fontVariations: base.fontVariations,
    fontFeatures: base.fontFeatures,
    omitFontWeight: weightViaFontFamily,
  );
  return loaded.copyWith(
    fontStyle: base.fontStyle,
    decoration: base.decoration,
    decorationColor: base.decorationColor,
  );
}

/// JioType has no italic masters — Figma marks italic N/A for Jio.
bool oneUiTextSupportsItalic(BuildContext context, OneUiTextVariant variant) {
  final snap = OneUiScope.nativeTypographyOf(context);
  if (variant == OneUiTextVariant.code) {
    final codeFamily = snap?.fontFamilyCode?.toLowerCase() ?? '';
    if (codeFamily.contains('jetbrains')) return true;
  }
  final primary = snap?.fontFamilyPrimaryOrBundled.toLowerCase() ?? '';
  if (primary.contains('jiotype')) return false;
  return true;
}

TextStyle resolveOneUiTextStyle(
  BuildContext context, {
  required OneUiTextVariant variant,
  required String size,
  required OneUiTextWeight weight,
  required Color color,
  OneUiTextLanguage language = OneUiTextLanguage.latin,
  String? resolvedScript,
  OneUiTextScriptMode scriptMode = OneUiTextScriptMode.ui,
  bool italic = false,
  bool underline = false,
  bool strikethrough = false,
  OneUiTextAlign? textAlign,
}) {
  final scope = OneUiScope.maybeOf(context);
  final resolvedWeight = resolveOneUiTextWeight(variant, weight);
  final base = resolveOneUiTextTypographyStyle(
        context,
        variant: variant,
        size: size,
        weight: resolvedWeight,
        language: language,
        resolvedScript: resolvedScript,
        scriptMode: scriptMode,
      ) ??
      TextStyle(
        fontFamily: scope?.nativeTypography?.fontFamilyPrimaryOrBundled ??
            OneUiScope.nativeTypographyOf(context)?.fontFamilyPrimaryOrBundled,
        fontSize: 14,
        height: 1.4,
        fontWeight: FontWeight.w400,
      );

  TextDecoration? decoration;
  if (underline && strikethrough) {
    decoration = TextDecoration.combine([
      TextDecoration.underline,
      TextDecoration.lineThrough,
    ]);
  } else if (underline) {
    decoration = TextDecoration.underline;
  } else if (strikethrough) {
    decoration = TextDecoration.lineThrough;
  }

  final fontSize = base.fontSize ?? 14;
  double? decorationThickness;
  if (underline) {
    final metrics = resolveOneUiTextUnderlineMetrics(
      variant: variant,
      weight: resolvedWeight,
      fontSize: fontSize,
    );
    // Flutter multiplies the font's default underline stroke; ~1px base ≈ px target.
    decorationThickness = metrics.thicknessPx;
  }

  final applyItalic = italic && oneUiTextSupportsItalic(context, variant);

  return base.copyWith(
    color: color,
    fontStyle: applyItalic ? FontStyle.italic : FontStyle.normal,
    decoration: decoration,
    decorationColor: color,
    decorationThickness: decorationThickness,
  );
}

TextAlign? oneUiTextAlignToFlutter(OneUiTextAlign? align) {
  if (align == null) return null;
  return switch (align) {
    OneUiTextAlign.left => TextAlign.left,
    OneUiTextAlign.center => TextAlign.center,
    OneUiTextAlign.right => TextAlign.right,
  };
}
