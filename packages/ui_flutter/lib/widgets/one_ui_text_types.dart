/// Types and state — `Text.shared.ts` / RN `interface.ts`.
library;

import '../engine/one_ui_text_script.dart';

/// Typography role (`variant` on web/RN).
enum OneUiTextVariant { body, label, title, headline, display, code }

/// Deprecated on web — prefer [OneUiTextLang] / [OneUiTextScript].
enum OneUiTextLanguage { latin, others }

enum OneUiTextScriptMode { ui, reading }

/// Colour prominence — `none` resolves to `high` in [resolveOneUiTextState].
enum OneUiTextAttention { none, high, medium, low, tintedA11y }

enum OneUiTextWeight { high, medium, low }

enum OneUiTextAlign { left, center, right }

const List<OneUiTextVariant> kOneUiTextVariants = OneUiTextVariant.values;

const List<OneUiTextAttention> kOneUiTextAttentions = OneUiTextAttention.values;

const List<OneUiTextWeight> kOneUiTextWeights = OneUiTextWeight.values;

const List<String> kOneUiTextAppearances = [
  'auto',
  'primary',
  'neutral',
  'secondary',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

const List<String> kOneUiTextSizeOrder = [
  '3XS',
  '2XS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
];

const List<String> kOneUiTextBodySizes = [
  '2XS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
];

const List<String> kOneUiTextLabelSizes = [
  '3XS',
  '2XS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
];

const List<String> kOneUiTextDisplaySizes = ['L', 'M', 'S'];

const List<String> kOneUiTextCodeSizes = ['M', 'S', 'XS'];

const List<OneUiTextLanguage> kOneUiTextLanguages = OneUiTextLanguage.values;

const List<OneUiTextScriptMode> kOneUiTextScriptModes =
    OneUiTextScriptMode.values;

/// Sizes valid for the active [OneUiTextVariant] (Storybook controls).
List<String> oneUiTextSizesForVariant(OneUiTextVariant variant) =>
    switch (variant) {
      OneUiTextVariant.body => kOneUiTextBodySizes,
      OneUiTextVariant.label => kOneUiTextLabelSizes,
      OneUiTextVariant.title ||
      OneUiTextVariant.headline ||
      OneUiTextVariant.display =>
        kOneUiTextDisplaySizes,
      OneUiTextVariant.code => kOneUiTextCodeSizes,
    };

int _indexOfStep(String value) {
  final i = kOneUiTextSizeOrder.indexOf(value);
  return i < 0 ? -1 : i;
}

String _nearestInSubset(int requestedIdx, List<String> subset) {
  var best = subset.first;
  var bestDist = 1 << 30;
  for (final v in subset) {
    final idx = _indexOfStep(v);
    if (idx < 0) continue;
    final d = (idx - requestedIdx).abs();
    if (d < bestDist) {
      bestDist = d;
      best = v;
    }
  }
  return best;
}

/// Runtime clamp — mirrors `resolveTextSize` on web/RN.
String resolveOneUiTextSize(OneUiTextVariant variant, String? requested) {
  final raw = requested ?? 'M';
  switch (variant) {
    case OneUiTextVariant.display:
    case OneUiTextVariant.headline:
    case OneUiTextVariant.title:
      if (kOneUiTextDisplaySizes.contains(raw)) return raw;
      final idx = _indexOfStep(raw);
      final sIdx = _indexOfStep('S');
      final lIdx = _indexOfStep('L');
      if (idx < 0) return 'M';
      if (idx < sIdx) return 'S';
      if (idx > lIdx) return 'L';
      return 'M';
    case OneUiTextVariant.body:
      if (kOneUiTextBodySizes.contains(raw)) return raw;
      if (raw == '3XS') return '2XS';
      final idx = _indexOfStep(raw);
      if (idx < 0) return 'M';
      return _nearestInSubset(idx, kOneUiTextBodySizes);
    case OneUiTextVariant.label:
      if (kOneUiTextLabelSizes.contains(raw)) return raw;
      final idx = _indexOfStep(raw);
      if (idx < 0) return 'M';
      return _nearestInSubset(idx, kOneUiTextLabelSizes);
    case OneUiTextVariant.code:
      if (kOneUiTextCodeSizes.contains(raw)) return raw;
      final idx = _indexOfStep(raw);
      if (idx < 0) return 'M';
      if (idx <= _indexOfStep('XS')) return 'XS';
      return 'M';
  }
}

class OneUiTextResolvedState {
  const OneUiTextResolvedState({
    required this.resolvedVariant,
    required this.resolvedSize,
    required this.resolvedWeight,
    required this.resolvedAttention,
    required this.resolvedAppearance,
    required this.resolvedLanguage,
    required this.resolvedScript,
    required this.resolvedScriptMode,
    required this.dataVariant,
    required this.dataSize,
    required this.dataWeight,
    required this.dataAttention,
    required this.dataAppearance,
    required this.dataLanguage,
    this.dataScript,
    this.dataScriptMode,
    this.dataItalic,
    this.dataUnderline,
    this.dataStrikethrough,
    this.dataAlign,
  });

  final OneUiTextVariant resolvedVariant;
  final String resolvedSize;
  final OneUiTextWeight resolvedWeight;
  final OneUiTextAttention resolvedAttention;
  final String resolvedAppearance;
  final OneUiTextLanguage resolvedLanguage;
  final String? resolvedScript;
  final OneUiTextScriptMode resolvedScriptMode;
  final String dataVariant;
  final String dataSize;
  final String dataWeight;
  final String dataAttention;
  final String dataAppearance;
  final String dataLanguage;
  final String? dataScript;
  final String? dataScriptMode;
  final String? dataItalic;
  final String? dataUnderline;
  final String? dataStrikethrough;
  final String? dataAlign;
}

OneUiTextResolvedState resolveOneUiTextState({
  OneUiTextVariant variant = OneUiTextVariant.body,
  String? size,
  OneUiTextWeight weight = OneUiTextWeight.high,
  OneUiTextAttention attention = OneUiTextAttention.none,
  String appearance = 'auto',
  OneUiTextLanguage language = OneUiTextLanguage.latin,
  String? lang,
  String? script,
  OneUiTextScriptMode scriptMode = OneUiTextScriptMode.ui,
  bool italic = false,
  bool underline = false,
  bool strikethrough = false,
  OneUiTextAlign? textAlign,
}) {
  final resolvedSize = resolveOneUiTextSize(variant, size);
  final resolvedAppearance =
      appearance == 'auto' || appearance.isEmpty ? 'neutral' : appearance;
  final resolvedWeight = resolveOneUiTextWeight(variant, weight);
  final resolvedAttention = resolveOneUiTextAttention(variant, attention);

  final explicitScript = script?.trim();
  final inferredScript = explicitScript != null && explicitScript.isNotEmpty
      ? explicitScript
      : oneUiScriptIdFromLang(lang);

  return OneUiTextResolvedState(
    resolvedVariant: variant,
    resolvedSize: resolvedSize,
    resolvedWeight: resolvedWeight,
    resolvedAttention: resolvedAttention,
    resolvedAppearance: resolvedAppearance,
    resolvedLanguage: language,
    resolvedScript: inferredScript,
    resolvedScriptMode: scriptMode,
    dataVariant: variant.name,
    dataSize: resolvedSize,
    dataWeight: resolvedWeight.name,
    dataAttention: resolvedAttention.name,
    dataAppearance: resolvedAppearance,
    dataLanguage: language.name,
    dataScript: inferredScript,
    dataScriptMode:
        inferredScript != null && scriptMode != OneUiTextScriptMode.ui
            ? scriptMode.name
            : null,
    dataItalic: italic ? 'true' : null,
    dataUnderline: underline ? 'true' : null,
    dataStrikethrough: strikethrough ? 'true' : null,
    dataAlign: textAlign?.name,
  );
}

String oneUiTextWeightEmphasis(OneUiTextWeight weight) => weight.name;

String oneUiTextTypographyRole(OneUiTextVariant variant) => switch (variant) {
      OneUiTextVariant.display => 'display',
      OneUiTextVariant.headline => 'headline',
      OneUiTextVariant.title => 'title',
      OneUiTextVariant.body => 'body',
      OneUiTextVariant.label => 'label',
      OneUiTextVariant.code => 'code',
    };

bool oneUiTextUsesEmphasisWeights(OneUiTextVariant variant) =>
    variant == OneUiTextVariant.body ||
    variant == OneUiTextVariant.label ||
    variant == OneUiTextVariant.code;

/// Figma: display / headline / title use fixed per-size weights (medium only).
bool oneUiTextUsesFixedRoleWeight(OneUiTextVariant variant) =>
    !oneUiTextUsesEmphasisWeights(variant);

/// Figma weight scoping — code + fixed roles ignore the `weight` prop.
OneUiTextWeight resolveOneUiTextWeight(
  OneUiTextVariant variant,
  OneUiTextWeight weight,
) {
  if (variant == OneUiTextVariant.code) return OneUiTextWeight.medium;
  if (oneUiTextUsesFixedRoleWeight(variant)) return OneUiTextWeight.medium;
  return weight;
}

/// Figma attention scoping — display / headline / title are high-only.
OneUiTextAttention resolveOneUiTextAttention(
  OneUiTextVariant variant,
  OneUiTextAttention attention,
) {
  final base = attention == OneUiTextAttention.none
      ? OneUiTextAttention.high
      : attention;
  if (oneUiTextUsesFixedRoleWeight(variant)) {
    return OneUiTextAttention.high;
  }
  return base;
}

/// Figma underline metrics — thickness & offset vary by variant × weight.
/// Percentages are relative to [fontSize] (display/headline/title/body/label).
/// Code uses fixed px steps (Figma code underline band).
({double thicknessPx, double offsetPx}) resolveOneUiTextUnderlineMetrics({
  required OneUiTextVariant variant,
  required OneUiTextWeight weight,
  required double fontSize,
}) {
  if (variant == OneUiTextVariant.code) {
    return switch (weight) {
      OneUiTextWeight.low => (thicknessPx: 1, offsetPx: 2),
      OneUiTextWeight.medium => (thicknessPx: 2, offsetPx: 2),
      OneUiTextWeight.high => (thicknessPx: 3, offsetPx: 2),
    };
  }
  if (oneUiTextUsesFixedRoleWeight(variant)) {
    return (thicknessPx: fontSize * 0.15, offsetPx: fontSize * 0.25);
  }
  final thicknessPercent = switch (weight) {
    OneUiTextWeight.low => 0.10,
    OneUiTextWeight.medium => 0.12,
    OneUiTextWeight.high => 0.15,
  };
  return (
    thicknessPx: fontSize * thicknessPercent,
    offsetPx: fontSize * 0.25,
  );
}
