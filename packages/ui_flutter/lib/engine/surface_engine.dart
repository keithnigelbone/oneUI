// ignore_for_file: public_member_api_docs
//
// Dart port of `packages/shared/src/engine/surfaceNew.ts` — same algorithm,
// inputs, and outputs as `resolveTokenSet` / `resolveMultiRoleTokenSets` /
// `resolveSurface` used by web CSS gen and React Native `SurfaceContext`.

import 'color_math.dart';

/// 25-step scale (100–2500).
const List<int> kSurfaceSteps = [
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
  1000,
  1100,
  1200,
  1300,
  1400,
  1500,
  1600,
  1700,
  1800,
  1900,
  2000,
  2100,
  2200,
  2300,
  2400,
  2500,
];

const int kBoldMinDistance = 7;
const int kBoldFallbackOffset = 700;
const int kBoldFallbackMinStep = 500;
const int kStateHoverOffset = 1;
const int kStatePressedOffset = 2;
const int kBoldStateHoverOffset = 3;
const int kBoldStatePressedOffset = 5;

/// 1 = toward lighter (2500), -1 = toward darker (100).
typedef ContrastDir = int;

typedef SurfaceToken = String;
typedef ContentToken = String;
typedef StateToken = String;

const String kSurfaceDefault = 'default';
const String kSurfaceGhost = 'ghost';
const String kSurfaceMinimal = 'minimal';
const String kSurfaceSubtle = 'subtle';
const String kSurfaceModerate = 'moderate';
const String kSurfaceBold = 'bold';
const String kSurfaceElevated = 'elevated';

class ScaleDefinition {
  const ScaleDefinition({
    required this.name,
    required this.baseStep,
    required this.darkerBaseStep,
    required this.palette,
    this.anchorBoldToBaseStep = false,
  });

  final String name;
  final int baseStep;
  final int darkerBaseStep;
  final ColorPalette palette;
  final bool anchorBoldToBaseStep;
}

class ThemeConfig {
  const ThemeConfig({required this.appearances});

  final Map<String, ScaleDefinition> appearances;
}

class ResolvedSurface {
  const ResolvedSurface({required this.step, required this.hex});

  final int step;
  final String hex;
}

class ResolvedContent {
  const ResolvedContent({
    required this.step,
    required this.hex,
    required this.blendedHex,
    required this.opacity,
  });

  final int step;
  final String hex;
  final String blendedHex;
  final double opacity;
}

class ResolvedTokenSet {
  const ResolvedTokenSet({
    required this.parentStep,
    required this.parentHex,
    required this.contrastDir,
    required this.surfaces,
    required this.content,
    required this.onBoldContent,
    required this.onSubtleContent,
    required this.states,
  });

  final int parentStep;
  final String parentHex;
  final ContrastDir contrastDir;
  final Map<SurfaceToken, ResolvedSurface> surfaces;
  final Map<ContentToken, ResolvedContent> content;
  final Map<ContentToken, ResolvedContent> onBoldContent;
  final Map<ContentToken, ResolvedContent> onSubtleContent;
  final Map<StateToken, ResolvedSurface> states;
}

/// Flattened role tokens — hex strings ready for `Color` parsing (RN `NativeRoleTokens`).
class FlatRoleTokens {
  const FlatRoleTokens({
    required this.surfaces,
    required this.content,
    required this.onBoldContent,
    required this.onSubtleContent,
    required this.states,
    this.stateLayers = const {},
  });

  final Map<SurfaceToken, String> surfaces;
  final Map<ContentToken, String> content;
  final Map<ContentToken, String> onBoldContent;
  final Map<ContentToken, String> onSubtleContent;
  final Map<StateToken, String> states;

  /// Translucent interaction overlays (`rgba(...)`) — RN `NativeRoleTokens.stateLayers`.
  final Map<StateToken, String> stateLayers;
}

ContrastDir computeContrastDir(Rgb parentRgb, RgbPalette rgbPalette) {
  final dir = getDynamicContrastDirectionRgb(parentRgb, rgbPalette);
  return dir == 'light' ? 1 : -1;
}

int clampStep(int step) => step.clamp(100, 2500);

int resolveSurface(
  SurfaceToken token,
  int parentStep,
  ScaleDefinition scale,
  ContrastDir dir, {
  bool darkMode = false,
}) {
  switch (token) {
    case kSurfaceDefault:
      return darkMode ? 100 : 2500;
    case kSurfaceGhost:
      return parentStep;
    case kSurfaceElevated:
      return mathMin(parentStep + 100, 2500);
    case kSurfaceMinimal:
      return clampStep(parentStep + dir * 100);
    case kSurfaceSubtle:
      return clampStep(parentStep + dir * 200);
    case kSurfaceModerate:
      return clampStep(parentStep + dir * 300);
    case kSurfaceBold:
      final candidate =
          parentStep >= 1300 ? scale.baseStep : scale.darkerBaseStep;
      if ((parentStep - candidate).abs() / 100 >= kBoldMinDistance) {
        return candidate;
      }
      var result = parentStep - kBoldFallbackOffset;
      if (result < kBoldFallbackMinStep) {
        result = parentStep + kBoldFallbackOffset;
      }
      return clampStep(result);
    default:
      return parentStep;
  }
}

int mathMin(int a, int b) => a < b ? a : b;

int resolveState(
  StateToken token,
  int parentStep,
  int boldStep,
  int subtleStep,
  ContrastDir dir,
) {
  switch (token) {
    case 'hover':
      return clampStep(parentStep + dir * kStateHoverOffset * 100);
    case 'pressed':
      return clampStep(parentStep + dir * kStatePressedOffset * 100);
    case 'boldHover':
      return clampStep(boldStep + dir * kBoldStateHoverOffset * 100);
    case 'boldPressed':
      return clampStep(boldStep + dir * kBoldStatePressedOffset * 100);
    case 'subtleHover':
      return clampStep(subtleStep + dir * kStateHoverOffset * 100);
    case 'subtlePressed':
      return clampStep(subtleStep + dir * kStatePressedOffset * 100);
    default:
      return parentStep;
  }
}

int walkForContrast(
  int startStep,
  Rgb parentRgb,
  RgbPalette rgbPalette,
  ContrastDir dir,
  double threshold,
) {
  var step = startStep;
  while (step >= 100 && step <= 2500) {
    final stepRgb = rgbPalette[step];
    if (stepRgb != null &&
        getContrastRatioRgb(stepRgb, parentRgb) >= threshold) {
      return step;
    }
    step += dir * 100;
  }
  return startStep;
}

({int step, double opacity}) resolveContent(
  ContentToken token,
  int parentStep,
  Rgb parentRgb,
  ScaleDefinition scale,
  RgbPalette rgbPalette,
  ContrastDir dir,
) {
  final contrastingStep = dir == 1 ? 2500 : 100;
  final neutralTextRgb = dir == 1 ? rgbWhite : rgbBlack;

  switch (token) {
    case 'high':
      return (step: contrastingStep, opacity: 1);
    case 'low':
      final opacity = solveOpacity(neutralTextRgb, parentRgb, 4.5);
      return (step: contrastingStep, opacity: opacity);
    case 'medium':
      final lowOpacity = solveOpacity(neutralTextRgb, parentRgb, 4.5);
      return (step: contrastingStep, opacity: (lowOpacity + 1) / 2);
    case 'tinted':
      final candidate =
          parentStep >= 1300 ? scale.baseStep : scale.darkerBaseStep;
      final step = walkForContrast(candidate, parentRgb, rgbPalette, dir, 3.0);
      return (step: step, opacity: 1);
    case 'tintedA11y':
      final candidate =
          parentStep >= 1300 ? scale.baseStep : scale.darkerBaseStep;
      var resolved =
          walkForContrast(candidate, parentRgb, rgbPalette, dir, 4.5);
      if (dir == 1 && (resolved - scale.baseStep).abs() > 500) {
        resolved = 2500;
      }
      return (step: resolved, opacity: 1);
    case 'strokeMedium':
      final step = dir == -1
          ? mathMax(300, parentStep - 1800)
          : mathMin(2000, parentStep + 1400);
      return (step: step, opacity: dir == -1 ? 0.24 : 0.32);
    case 'strokeLow':
      final step = dir == -1
          ? mathMax(300, parentStep - 1800)
          : mathMin(2000, parentStep + 1400);
      return (step: step, opacity: dir == -1 ? 0.12 : 0.16);
    default:
      return (step: contrastingStep, opacity: 1);
  }
}

int mathMax(int a, int b) => a > b ? a : b;

const Set<String> _neutralTextTokens = {'high', 'medium', 'low'};

ResolvedContent resolveContentFull(
  ContentToken token,
  int parentStep,
  Rgb parentRgb,
  ScaleDefinition scale,
  RgbPalette rgbPalette,
  ColorPalette palette,
  ContrastDir dir, {
  bool allowScalePalette = false,
}) {
  final resolved =
      resolveContent(token, parentStep, parentRgb, scale, rgbPalette, dir);
  final step = resolved.step;
  final opacity = resolved.opacity;

  late final String hex;
  late final Rgb stepRgb;
  if (_neutralTextTokens.contains(token) && !allowScalePalette) {
    hex = dir == 1 ? '#ffffff' : '#000000';
    stepRgb = dir == 1 ? rgbWhite : rgbBlack;
  } else {
    hex = palette[step] ?? '#808080';
    stepRgb = rgbPalette[step] ?? hexToRgbTuple(hex);
  }

  final String blendedHex;
  if (opacity >= 1) {
    blendedHex = hex;
  } else {
    blendedHex = blendWithAlphaRgb(stepRgb, parentRgb, opacity).hex;
  }

  return ResolvedContent(
      step: step, hex: hex, blendedHex: blendedHex, opacity: opacity);
}

const List<SurfaceToken> _surfaceTokens = [
  kSurfaceDefault,
  kSurfaceGhost,
  kSurfaceMinimal,
  kSurfaceSubtle,
  kSurfaceModerate,
  kSurfaceBold,
  kSurfaceElevated,
];

const List<ContentToken> _contentTokens = [
  'high',
  'medium',
  'low',
  'tinted',
  'tintedA11y',
  'strokeMedium',
  'strokeLow',
];

const List<StateToken> _stateTokens = [
  'hover',
  'pressed',
  'boldHover',
  'boldPressed',
  'subtleHover',
  'subtlePressed',
];

int computeDarkerBaseStep(int baseStep) {
  late final int offset;
  if (baseStep >= 1900) {
    offset = 0;
  } else if (baseStep >= 1300) {
    offset = 100;
  } else if (baseStep >= 700) {
    offset = 200;
  } else {
    offset = 300;
  }
  return (baseStep + offset).clamp(100, 2500);
}

ScaleDefinition buildScaleDefinition(
  String name,
  ColorPalette palette,
  int baseStep, {
  int? darkerBaseStep,
  bool anchorBoldToBaseStep = false,
}) {
  return ScaleDefinition(
    name: name,
    baseStep: baseStep,
    darkerBaseStep: darkerBaseStep ?? computeDarkerBaseStep(baseStep),
    palette: palette,
    anchorBoldToBaseStep: anchorBoldToBaseStep,
  );
}

ResolvedTokenSet resolveTokenSet(
  ScaleDefinition scale,
  int parentStep, {
  bool darkMode = false,
}) {
  final palette = scale.palette;
  final rgbPalette = preParseRGBPalette(palette);
  final parentHex = palette[parentStep] ?? '#808080';
  final parentRgb = rgbPalette[parentStep] ?? hexToRgbTuple(parentHex);
  final dir = computeContrastDir(parentRgb, rgbPalette);

  final surfaces = <SurfaceToken, ResolvedSurface>{};
  for (final t in _surfaceTokens) {
    final step = scale.anchorBoldToBaseStep && t == kSurfaceBold
        ? scale.baseStep
        : resolveSurface(t, parentStep, scale, dir, darkMode: darkMode);
    surfaces[t] = ResolvedSurface(step: step, hex: palette[step] ?? '#808080');
  }

  final content = <ContentToken, ResolvedContent>{};
  for (final t in _contentTokens) {
    content[t] = resolveContentFull(
      t,
      parentStep,
      parentRgb,
      scale,
      rgbPalette,
      palette,
      dir,
    );
  }

  final boldStep = surfaces[kSurfaceBold]!.step;
  final subtleStep = surfaces[kSurfaceSubtle]!.step;
  final states = <StateToken, ResolvedSurface>{};
  for (final t in _stateTokens) {
    final st = resolveState(t, parentStep, boldStep, subtleStep, dir);
    states[t] = ResolvedSurface(step: st, hex: palette[st] ?? '#808080');
  }

  final boldHex = palette[boldStep] ?? '#808080';
  final boldRgb = rgbPalette[boldStep] ?? hexToRgbTuple(boldHex);
  final boldDir = computeContrastDir(boldRgb, rgbPalette);
  final onBoldContent = <ContentToken, ResolvedContent>{};
  for (final t in _contentTokens) {
    onBoldContent[t] = resolveContentFull(
      t,
      boldStep,
      boldRgb,
      scale,
      rgbPalette,
      palette,
      boldDir,
      allowScalePalette: true,
    );
  }

  final subtleHex = palette[subtleStep] ?? '#808080';
  final subtleRgb = rgbPalette[subtleStep] ?? hexToRgbTuple(subtleHex);
  final subtleDir = computeContrastDir(subtleRgb, rgbPalette);
  final onSubtleContent = <ContentToken, ResolvedContent>{};
  for (final t in _contentTokens) {
    onSubtleContent[t] = resolveContentFull(
      t,
      subtleStep,
      subtleRgb,
      scale,
      rgbPalette,
      palette,
      subtleDir,
      allowScalePalette: true,
    );
  }

  return ResolvedTokenSet(
    parentStep: parentStep,
    parentHex: parentHex,
    contrastDir: dir,
    surfaces: surfaces,
    content: content,
    onBoldContent: onBoldContent,
    onSubtleContent: onSubtleContent,
    states: states,
  );
}

/// Web [resolveContextTokenSet] — semantic tokens **inside** a container with
/// surface [surfaceToken] (generates `[data-surface="…"]` in CSS).
///
/// When [ScaleDefinition.anchorBoldToBaseStep] is true, the **container** bold
/// fill still pins to [ScaleDefinition.baseStep], but **inner** token sets strip
/// the anchor so nested `bold` surfaces contrast the container (avoids invisible
/// bold-on-bold). Matches `packages/shared/src/engine/surfaceNew.ts`.
ResolvedTokenSet resolveContextTokenSet(
  ScaleDefinition scale,
  String surfaceToken,
  int outerParentStep,
  bool darkMode,
) {
  final palette = scale.palette;
  final rgbPalette = preParseRGBPalette(palette);
  final outerParentHex = palette[outerParentStep] ?? '#808080';
  final outerParentRgb =
      rgbPalette[outerParentStep] ?? hexToRgbTuple(outerParentHex);
  final outerDir = computeContrastDir(outerParentRgb, rgbPalette);

  final containerStep =
      scale.anchorBoldToBaseStep && surfaceToken == kSurfaceBold
          ? scale.baseStep
          : resolveSurface(surfaceToken, outerParentStep, scale, outerDir,
              darkMode: darkMode);

  final contextScale = scale.anchorBoldToBaseStep
      ? ScaleDefinition(
          name: scale.name,
          baseStep: scale.baseStep,
          darkerBaseStep: scale.darkerBaseStep,
          palette: scale.palette,
          anchorBoldToBaseStep: false,
        )
      : scale;

  return resolveTokenSet(contextScale, containerStep, darkMode: darkMode);
}

/// Web `resolveSurfaceStep` — step written as `data-surface-step` on `<Surface>`.
int resolveSurfaceStep(
  ScaleDefinition scale,
  int parentStep,
  String mode,
  bool darkMode, {
  required bool isRoot,
}) {
  final effectiveScale = isRoot || !scale.anchorBoldToBaseStep
      ? scale
      : ScaleDefinition(
          name: scale.name,
          baseStep: scale.baseStep,
          darkerBaseStep: scale.darkerBaseStep,
          palette: scale.palette,
          anchorBoldToBaseStep: false,
        );

  if (effectiveScale.anchorBoldToBaseStep && mode == kSurfaceBold) {
    return effectiveScale.baseStep;
  }

  final rgbPalette = preParseRGBPalette(effectiveScale.palette);
  final parentHex = effectiveScale.palette[parentStep] ?? '#808080';
  final parentRgb = rgbPalette[parentStep] ?? hexToRgbTuple(parentHex);
  final dir = computeContrastDir(parentRgb, rgbPalette);
  return resolveSurface(mode, parentStep, effectiveScale, dir,
      darkMode: darkMode);
}

/// All roles at the surface container step — web `renderStepDecls` / `[data-surface-step]`.
///
/// Uses [surfaceAppearance]'s scale to resolve [surfaceToken] → one [containerStep],
/// then emits every role's content/surface tokens as if the parent were at that step
/// (not per-role `resolveContextTokenSet`, which diverges for multi-accent brands like Tira).
Map<String, FlatRoleTokens> resolveRolesInsideSurface(
  ThemeConfig themeConfig,
  String surfaceToken,
  int outerParentStep,
  bool darkMode, {
  String surfaceAppearance = 'primary',
  bool isRoot = false,
}) {
  final scale = themeConfig.appearances[surfaceAppearance] ??
      themeConfig.appearances['primary'] ??
      themeConfig.appearances['neutral']!;
  final containerStep = resolveSurfaceStep(
    scale,
    outerParentStep,
    surfaceToken,
    darkMode,
    isRoot: isRoot,
  );
  return resolveNativeContextRoles(themeConfig, containerStep, darkMode);
}

class MultiRoleTokenSets {
  MultiRoleTokenSets({
    required this.darkMode,
    required this.parentStep,
    required this.roles,
  });

  final bool darkMode;
  final int parentStep;
  final Map<String, ResolvedTokenSet> roles;
}

/// Strip [ScaleDefinition.anchorBoldToBaseStep] for step-keyed lookup — web
/// `renderStepDecls` uses `ctxScale` so `--Primary-Bold` at step N contrasts
/// the container at N (not pinned to brand baseStep).
ScaleDefinition contextScaleForStepLookup(ScaleDefinition scale) {
  if (!scale.anchorBoldToBaseStep) return scale;
  return ScaleDefinition(
    name: scale.name,
    baseStep: scale.baseStep,
    darkerBaseStep: scale.darkerBaseStep,
    palette: scale.palette,
    anchorBoldToBaseStep: false,
  );
}

MultiRoleTokenSets resolveMultiRoleTokenSets(
  ThemeConfig themeConfig,
  int parentStep, {
  bool darkMode = false,
}) {
  final roles = <String, ResolvedTokenSet>{};
  for (final e in themeConfig.appearances.entries) {
    roles[e.key] = resolveTokenSet(
      contextScaleForStepLookup(e.value),
      parentStep,
      darkMode: darkMode,
    );
  }
  return MultiRoleTokenSets(
      darkMode: darkMode, parentStep: parentStep, roles: roles);
}

FlatRoleTokens flattenRoleTokens(ResolvedTokenSet set) {
  return FlatRoleTokens(
    surfaces: {for (final e in set.surfaces.entries) e.key: e.value.hex},
    content: {for (final e in set.content.entries) e.key: e.value.blendedHex},
    onBoldContent: {
      for (final e in set.onBoldContent.entries) e.key: e.value.blendedHex
    },
    onSubtleContent: {
      for (final e in set.onSubtleContent.entries) e.key: e.value.blendedHex
    },
    states: {for (final e in set.states.entries) e.key: e.value.hex},
  );
}

/// RN `resolveNativeContextRoles`.
Map<String, FlatRoleTokens> resolveNativeContextRoles(
  ThemeConfig themeConfig,
  int parentStep,
  bool darkMode,
) {
  final multi =
      resolveMultiRoleTokenSets(themeConfig, parentStep, darkMode: darkMode);
  final out = <String, FlatRoleTokens>{};
  for (final e in multi.roles.entries) {
    out[e.key] = flattenRoleTokens(e.value);
  }
  return out;
}
