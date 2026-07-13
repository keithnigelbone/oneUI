part of 'typography_scale.dart';

/// Curated font id → display name — `FONT_COLLECTION` in `packages/shared/src/data/fonts.ts`.
const Map<String, String> kCuratedFontDisplayNames = {
  'inter': 'Inter',
  'roboto-flex': 'Roboto Flex',
  'jiotype-var': 'JioType Variable',
  'roboto': 'Roboto',
  'open-sans': 'Open Sans',
  'lato': 'Lato',
  'poppins': 'Poppins',
  'montserrat': 'Montserrat',
  'playfair-display': 'Playfair Display',
  'merriweather': 'Merriweather',
  'lora': 'Lora',
  'source-serif': 'Source Serif 4',
  'jetbrains-mono': 'JetBrains Mono',
  'fira-code': 'Fira Code',
  'source-code-pro': 'Source Code Pro',
  'noto-sans': 'Noto Sans',
  'noto-sans-devanagari': 'Noto Sans Devanagari',
  'noto-sans-tamil': 'Noto Sans Tamil',
  'noto-sans-telugu': 'Noto Sans Telugu',
  'noto-sans-bengali': 'Noto Sans Bengali',
  'noto-sans-gujarati': 'Noto Sans Gujarati',
  'noto-sans-kannada': 'Noto Sans Kannada',
  'noto-sans-malayalam': 'Noto Sans Malayalam',
  'noto-sans-arabic': 'Noto Sans Arabic',
  'noto-sans-hebrew': 'Noto Sans Hebrew',
  'noto-sans-thai': 'Noto Sans Thai',
};

const Map<String, String> kDefaultFontSlotNames = {
  'text': 'JioType Variable',
  'heading': 'Noto Sans',
  'script': 'Noto Sans',
  'code': 'JetBrains Mono',
};

/// When there is no typography foundation, Storybook still resolves **slots**
/// (text vs heading vs code) to different Google Fonts so the Font slots page
/// shows four distinct families. **Per-role samples** (`All roles`) follow web
/// `generateTypographyCSSV2`: all roles use the text slot unless the brand sets
/// `roleFontSlots[role] == 'secondary'`.
const String kStorybookNoFoundationTextFontId = 'jiotype-var';
const String kStorybookNoFoundationHeadingFontId = 'playfair-display';
const String kStorybookNoFoundationCodeFontId = 'jetbrains-mono';
const String kStorybookNoFoundationScriptFontId = 'noto-sans';

/// Resolved curated font **IDs** for loading Google Fonts / uploaded families.
class ResolvedFontSlotIds {
  const ResolvedFontSlotIds({
    required this.textFontId,
    required this.headingFontId,
    required this.codeFontId,
    required this.scriptFontId,
  });

  final String textFontId;
  final String headingFontId;
  final String codeFontId;
  final String scriptFontId;
}

String? uploadedFamilyForFontId(
    String fontId, List<Map<String, dynamic>>? customFonts) {
  if (!fontId.startsWith('uploaded-')) return null;
  final convexId = fontId.substring('uploaded-'.length);
  for (final f in customFonts ?? const []) {
    if (f['_id']?.toString() == convexId) {
      return f['familyName'] as String? ?? f['name'] as String?;
    }
  }
  return null;
}

String _nonEmptyFontId(String? raw, String fallback) {
  if (raw == null) return fallback;
  final t = raw.trim();
  return t.isEmpty ? fallback : t;
}

ResolvedFontSlotIds resolveFontSlotIds(
  Map<String, dynamic>? typographyConfig,
  List<Map<String, dynamic>>? _customFonts,
) {
  if (typographyConfig == null) {
    return const ResolvedFontSlotIds(
      textFontId: kStorybookNoFoundationTextFontId,
      headingFontId: kStorybookNoFoundationHeadingFontId,
      codeFontId: kStorybookNoFoundationCodeFontId,
      scriptFontId: kStorybookNoFoundationScriptFontId,
    );
  }
  final sel = _fontSelectionMap(typographyConfig);
  final textId = _nonEmptyFontId(_resolveTextFontId(sel), 'jiotype-var');
  final headingId = _nonEmptyFontId(_resolveHeadingFontId(sel), 'noto-sans');
  final codeId =
      _nonEmptyFontId(sel?['codeFontId'] as String?, 'jetbrains-mono');
  final fallbackIds = sel?['fallbackFontIds'];
  final String scriptId;
  if (fallbackIds is List && fallbackIds.isNotEmpty) {
    final first = fallbackIds.first;
    if (first is String && first.trim().isNotEmpty) {
      scriptId = first.trim();
    } else {
      scriptId = textId;
    }
  } else {
    scriptId = textId;
  }
  return ResolvedFontSlotIds(
    textFontId: textId,
    headingFontId: headingId,
    codeFontId: codeId,
    scriptFontId: scriptId,
  );
}

/// Web default: every role uses the **text** (primary) slot; only
/// `typography.config.roleFontSlots[role] == 'secondary'` switches
/// `--{Role}-FontFamily` to the heading stack (`generateTypographyCSSV2`).
bool roleUsesHeadingFontSlot(
    String role, Map<String, dynamic>? typographyConfig) {
  if (role == 'code') return false;
  final raw = typographyConfig?['roleFontSlots'];
  if (raw is! Map) return false;
  final slot = raw[role];
  return slot == 'secondary';
}

/// Same cascade as `--{Role}-FontFamily` on web; returns curated **font id**.
String curatedFontIdForTypographyRole(
  String role,
  ResolvedFontSlotIds ids,
  Map<String, dynamic>? typographyConfig,
) {
  if (role == 'code') return ids.codeFontId;
  if (roleUsesHeadingFontSlot(role, typographyConfig)) {
    return ids.headingFontId;
  }
  return ids.textFontId;
}

/// Resolved families for `--Typography-Font-{Text,Heading,Script,Code}`.
class ResolvedFontSlots {
  const ResolvedFontSlots({
    required this.bodyText,
    required this.displayHeading,
    required this.script,
    required this.code,
  });

  final String bodyText;
  final String displayHeading;
  final String script;
  final String code;
}

String _titleCaseFontId(String id) {
  if (id.isEmpty) return id;
  return id.split('-').map((w) {
    if (w.isEmpty) return w;
    return w[0].toUpperCase() + w.substring(1);
  }).join(' ');
}

/// Parity with `resolveBrandFontName` (`packages/shared/src/data/fonts.ts`).
String resolveBrandFontDisplayName(
  String? fontId,
  List<Map<String, dynamic>>? customFonts,
) {
  if (fontId == null || fontId.isEmpty) {
    return kDefaultFontSlotNames['text']!;
  }
  if (fontId.startsWith('uploaded-')) {
    final convexId = fontId.substring('uploaded-'.length);
    for (final f in customFonts ?? const []) {
      final id = f['_id']?.toString();
      if (id == convexId) {
        final fn = f['familyName'] as String?;
        final n = f['name'] as String?;
        return fn ?? n ?? 'Uploaded font';
      }
    }
    return 'Uploaded font';
  }
  final curated = kCuratedFontDisplayNames[fontId];
  if (curated != null) return curated;
  if (fontId.contains(' ') || RegExp(r'[A-Z]').hasMatch(fontId)) {
    return fontId;
  }
  return _titleCaseFontId(fontId);
}

Map<String, dynamic>? _fontSelectionMap(Map<String, dynamic>? config) {
  final sel = config?['fontSelection'];
  return sel is Map<String, dynamic> ? sel : null;
}

String? _resolveTextFontId(Map<String, dynamic>? sel) {
  if (sel == null) return null;
  return sel['textFontId'] as String? ??
      sel['bodyFontId'] as String? ??
      sel['primaryFontId'] as String?;
}

String? _resolveHeadingFontId(Map<String, dynamic>? sel) {
  if (sel == null) return null;
  return sel['headingFontId'] as String? ??
      sel['displayFontId'] as String? ??
      sel['secondaryFontId'] as String?;
}

/// Mirrors `buildNativeTypography` / web font slot CSS.
ResolvedFontSlots resolveFontSlots(
  Map<String, dynamic>? typographyConfig,
  List<Map<String, dynamic>>? customFonts,
) {
  if (typographyConfig == null) {
    return ResolvedFontSlots(
      bodyText: kCuratedFontDisplayNames[kStorybookNoFoundationTextFontId]!,
      displayHeading:
          kCuratedFontDisplayNames[kStorybookNoFoundationHeadingFontId]!,
      script: kCuratedFontDisplayNames[kStorybookNoFoundationScriptFontId]!,
      code: kCuratedFontDisplayNames[kStorybookNoFoundationCodeFontId]!,
    );
  }
  final sel = _fontSelectionMap(typographyConfig);
  final textRaw = _resolveTextFontId(sel);
  final text = textRaw == null || textRaw.isEmpty
      ? kDefaultFontSlotNames['text']!
      : resolveBrandFontDisplayName(textRaw, customFonts);
  final headingRaw = _resolveHeadingFontId(sel);
  final heading = headingRaw == null || headingRaw.isEmpty
      ? kDefaultFontSlotNames['heading']!
      : resolveBrandFontDisplayName(headingRaw, customFonts);
  final codeId = sel?['codeFontId'] as String?;
  final code = codeId == null || codeId.isEmpty
      ? kDefaultFontSlotNames['code']!
      : resolveBrandFontDisplayName(codeId, customFonts);
  final fallbackIds = sel?['fallbackFontIds'];
  final String script;
  if (fallbackIds is List && fallbackIds.isNotEmpty) {
    final first = fallbackIds.first;
    if (first is String && first.isNotEmpty) {
      script = resolveBrandFontDisplayName(first, customFonts);
    } else {
      script = text;
    }
  } else {
    script = text;
  }
  return ResolvedFontSlots(
    bodyText: text,
    displayHeading: heading,
    script: script,
    code: code,
  );
}

/// Display name for the family a role resolves to — mirrors web
/// `var(--{Role}-FontFamily, var(--Typography-Font-Text))`.
String fontFamilyForTypographyRole(
  String role,
  ResolvedFontSlots slots,
  Map<String, dynamic>? typographyConfig,
) {
  if (role == 'code') return slots.code;
  if (roleUsesHeadingFontSlot(role, typographyConfig)) {
    return slots.displayHeading;
  }
  return slots.bodyText;
}

String? _configFStepKey(String role) {
  return switch (role) {
    'display' => 'displayFSteps',
    'headline' => 'headlineFSteps',
    'title' => 'titleFSteps',
    'body' => 'bodyFSteps',
    'label' => 'labelFSteps',
    'code' => 'codeFSteps',
    _ => null,
  };
}

int _lineHeightOffsetForRole(String role, Map<String, dynamic>? config) {
  final o = config?['lineHeightOffsets'];
  if (o is Map<String, dynamic>) {
    final v = o[role];
    if (v is num) return v.toInt();
  }
  return defaultLineHeightOffsets[role]!;
}

Map<String, String> _mergedFStepsForRole(
    String role, Map<String, dynamic>? config) {
  final base = Map<String, String>.from(defaultFStepAssignments[role]!);
  final key = _configFStepKey(role);
  if (key != null && config != null) {
    final raw = config[key];
    if (raw is Map<String, dynamic>) {
      for (final e in raw.entries) {
        if (e.value is String) base[e.key] = e.value as String;
      }
    }
  }
  return base;
}

/// 27 rows with brand f-step + line-height overrides from foundations `typography.config`.
List<TypographyEntry> getTypographyEntriesForBrand(
    Map<String, dynamic>? typographyConfig) {
  final out = <TypographyEntry>[];
  for (final role in typographyRoles) {
    final sizes = typographySizes[role]!;
    final assignments = _mergedFStepsForRole(role, typographyConfig);
    final lhOffset = _lineHeightOffsetForRole(role, typographyConfig);
    for (final size in sizes) {
      final fStep = assignments[size]!;
      final lhStep = computeLineHeightFStep(fStep, lhOffset);
      out.add(TypographyEntry(
        role: role,
        size: size,
        tokenName: typographyTokenName(role, size),
        fontSizeStep: fStep,
        lineHeightStep: lhStep,
      ));
    }
  }
  return out;
}

int? _readWeightOverride(Map<String, dynamic>? config, String cssKey) {
  final wo = config?['weightOverrides'] as Map<String, dynamic>?;
  if (wo == null) return null;
  final v = wo[cssKey];
  if (v is num) return v.round();
  return null;
}

int _weightForFixedRole(
  String role,
  String size,
  Map<String, dynamic>? typographyConfig,
) {
  final token = typographyTokenName(role, size);
  final key = '--$token-FontWeight';
  final o = _readWeightOverride(typographyConfig, key);
  if (o != null) return o;
  return fixedFontWeights[role]![size]!;
}

String _emphasisWeightOverrideKey(String role, String emphasis) {
  final cap = '${emphasis[0].toUpperCase()}${emphasis.substring(1)}';
  final tn = typographyTokenName(role, 'FontWeight-$cap');
  return '--$tn';
}

int _weightForEmphasisRole(
  String role,
  String emphasis,
  Map<String, dynamic>? typographyConfig,
) {
  final key = _emphasisWeightOverrideKey(role, emphasis);
  final o = _readWeightOverride(typographyConfig, key);
  if (o != null) return o;
  return emphasisFontWeights[role]![emphasis]!;
}

/// Resolved px + weight (brand overrides + dimensions cascade).
///
/// When [designSystem] carries Convex `dimensionContexts`, f-step resolution matches
/// web injection / `resolveFStepPx` (then brand platforms interpolation, then static tables).
({double fontSize, double lineHeight, int fontWeight})
    resolveTypographyEntryPx({
  required TypographyEntry entry,
  required String platform,
  required String density,
  String emphasis = 'low',
  PlatformsFoundationConfig? platformsConfig,
  Map<String, dynamic>? typographyConfig,
  NativeDesignSystemPayload? designSystem,
}) {
  final fontSize = resolveFStepPx(
    designSystem: designSystem,
    platformsConfig: platformsConfig,
    platformId: platform,
    density: density,
    step: entry.fontSizeStep,
  );
  final lineHeight = resolveFStepPx(
    designSystem: designSystem,
    platformsConfig: platformsConfig,
    platformId: platform,
    density: density,
    step: entry.lineHeightStep,
  );
  final fw = switch (entry.role) {
    'display' ||
    'headline' ||
    'title' =>
      _weightForFixedRole(entry.role, entry.size, typographyConfig),
    _ => _weightForEmphasisRole(entry.role, emphasis, typographyConfig),
  };
  return (fontSize: fontSize, lineHeight: lineHeight, fontWeight: fw);
}
