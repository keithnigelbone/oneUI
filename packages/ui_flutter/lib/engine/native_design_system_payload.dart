import '../tokens/dimension_scale.dart';
import '../tokens/platform_foundation_config.dart';

import 'motion_css_static.dart';
import 'native_typography_snapshot.dart';

/// Structured slice of `nativeTheme:getNativeThemeSnapshot` (`designSystem` block, schema ≥ 2).

/// One `[data-7-Platform][data-6-Density]` dimension context from TS `buildStructuredDimensionContexts`.
class NativeDimensionContext {
  const NativeDimensionContext({
    required this.platformId,
    required this.densityId,
    required this.dimensions,
    required this.gridMargin,
    required this.gridGutter,
  });

  final String platformId;
  final String densityId;

  /// Keys are CSS vars, e.g. `--Dimension-f0`, values e.g. `16px`.
  final Map<String, String> dimensions;
  final String gridMargin;
  final String gridGutter;

  static NativeDimensionContext? tryParse(Object? raw) {
    if (raw is! Map) return null;
    final m = Map<String, dynamic>.from(raw);
    final platformId = m['platformId'] as String?;
    final densityId = m['densityId'] as String?;
    final dimRaw = m['dimensions'];
    if (platformId == null || densityId == null || dimRaw is! Map) return null;
    final dimensions = <String, String>{};
    for (final e in dimRaw.entries) {
      dimensions['${e.key}'] = '${e.value}';
    }
    final gm = m['gridMargin'] as String?;
    final gg = m['gridGutter'] as String?;
    if (gm == null || gg == null) return null;
    return NativeDimensionContext(
      platformId: platformId,
      densityId: densityId,
      dimensions: dimensions,
      gridMargin: gm,
      gridGutter: gg,
    );
  }
}

/// Same t-shirt → f-step mapping as TS `augmentDimensionsWithSpacingAndShapeAliases`
/// (`packages/shared/src/utils/dimensionCSS.ts`).
const Map<String, String> _shapeTshirtToFStep = {
  '6XS': 'f-7',
  '5XS': 'f-6',
  '4XS': 'f-5',
  '3XS': 'f-4',
  '2XS': 'f-3',
  'XS': 'f-2',
  'S': 'f-1',
  'M': 'f0',
  'L': 'f1',
  'XL': 'f2',
  '2XL': 'f3',
  '3XL': 'f4',
  '4XL': 'f5',
  '5XL': 'f6',
  '6XL': 'f7',
};

/// Length primitives that do **not** depend on platform × density slices (match fixed CSS tokens).
/// Used from [NativeDesignSystemPayload.resolveCSSValue] even when toolbar platform/density are unset,
/// so `var(--Shape-Pill)` resolves like web `Shape-Pill` / `9999px` stadium corners.
String? lengthPrimitiveSansPlatformDims(String name) {
  switch (name) {
    case '--Shape-Pill':
      return '9999px';
    case '--Shape-0':
    case '--Shape-None':
      return '0px';
  }
  const strokeStatics = <String, double>{
    '--Stroke-None': 0,
    '--Stroke-S': 0.5,
    '--Stroke-M': 1,
    '--Stroke-L': 1.5,
    '--Stroke-XL': 2,
  };
  final sp = strokeStatics[name];
  if (sp != null) {
    if (sp == 0) return '0px';
    if (sp == sp.roundToDouble()) return '${sp.round()}px';
    return '${sp}px';
  }
  if (name == '--Touch-Target-Min') {
    return '44px';
  }
  if (name == '--Focus-Outline-Width') {
    return '2px';
  }
  return null;
}

/// When Convex omits `dimensionContexts` (no Platforms foundation), resolve primitive
/// spacing / shape / dimension vars using Dart static tables — parity with
/// [resolveSpacingPx] / [getDimensionValue] in foundations pages.
String? _staticPrimitiveLengthPxString({
  required String name,
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
}) {
  final fixed = lengthPrimitiveSansPlatformDims(name);
  if (fixed != null) return fixed;

  if (name.startsWith('--Spacing-')) {
    final tail = name.substring('--Spacing-'.length);
    if (tail.isEmpty) return null;
    final px = getSpacingTokenPx(
      spacingName: tail,
      platform: platformId,
      density: density,
      platformsConfig: platformsConfig,
    );
    return '${px}px';
  }
  if (name.startsWith('--Shape-')) {
    final shape = name.substring('--Shape-'.length);
    final step = _shapeTshirtToFStep[shape] ??
        fStepAliasForPrimitivesNumericShape(shape);
    if (step != null) {
      final px = getDimensionValue(
        platform: platformId,
        density: density,
        step: step,
        platformsConfig: platformsConfig,
      );
      return '${px}px';
    }
  }
  if (name.startsWith('--Dimension-')) {
    final step = name.substring('--Dimension-'.length);
    if (step.isEmpty) return null;
    final px = getDimensionValue(
      platform: platformId,
      density: density,
      step: step,
      platformsConfig: platformsConfig,
    );
    return '${px}px';
  }
  return null;
}

/// Native design payload: component `--*` map + dimension contexts (TS `@oneui/shared` + `componentTokenMapCore`).
class NativeDesignSystemPayload {
  NativeDesignSystemPayload({
    required this.componentCustomProperties,
    required this.dimensionContexts,
    required this.activeDimensionKey,
    NativeDimensionContext? activeDimensionContext,
  }) : activeDimensionContext = activeDimensionContext ??
            _resolveActiveContext(
              dimensionContexts,
              activeDimensionKey,
            );

  final Map<String, String> componentCustomProperties;
  final List<NativeDimensionContext> dimensionContexts;
  final String activeDimensionKey;
  final NativeDimensionContext? activeDimensionContext;

  static NativeDimensionContext? _resolveActiveContext(
    List<NativeDimensionContext> contexts,
    String activeKey,
  ) {
    if (contexts.isEmpty || activeKey.isEmpty) return null;
    final parts = activeKey.split(':');
    if (parts.length != 2) return null;
    final plat = parts[0];
    final den = parts[1];
    for (final c in contexts) {
      if (c.platformId == plat && c.densityId == den) return c;
    }
    return null;
  }

  /// Slice for a V2 platform id + density (`S-360`, `default`, …) from [dimensionContexts].
  NativeDimensionContext? dimensionContextFor(
      String platformId, String densityId) {
    for (final c in dimensionContexts) {
      if (c.platformId == platformId && c.densityId == densityId) {
        return c;
      }
    }
    return null;
  }

  static NativeDesignSystemPayload? tryParse(Object? raw) {
    if (raw is! Map) return null;
    final m = Map<String, dynamic>.from(raw);
    // Default `{}` when the key is absent — older payloads or partial Convex JSON
    // should still parse so callers get actionable "missing --Button-*" gaps instead
    // of a null `designSystem` on [NativeThemeSnapshot].
    final propsRaw = m['componentCustomProperties'];
    final componentCustomProperties = <String, String>{};
    if (propsRaw is Map) {
      for (final e in propsRaw.entries) {
        componentCustomProperties['${e.key}'] = '${e.value}';
      }
    }
    final dimensionContexts = <NativeDimensionContext>[];
    final dimListRaw = m['dimensionContexts'];
    if (dimListRaw is List) {
      for (final item in dimListRaw) {
        final ctx = NativeDimensionContext.tryParse(item);
        if (ctx != null) dimensionContexts.add(ctx);
      }
    }
    final activeKey = m['activeDimensionKey'] as String? ?? '';
    final activeFromJson =
        NativeDimensionContext.tryParse(m['activeDimensionContext']);
    return NativeDesignSystemPayload(
      componentCustomProperties: componentCustomProperties,
      dimensionContexts: dimensionContexts,
      activeDimensionKey: activeKey,
      activeDimensionContext: activeFromJson,
    );
  }

  /// Normalize to `--Foo` for map lookups.
  String _normalizeVarName(String name) {
    final t = name.trim();
    if (t.startsWith('--')) return t;
    return '--$t';
  }

  /// Dimension slice for toolbar platform + density (preferred over snapshot-only active context).
  NativeDimensionContext? sliceFor({String? platformId, String? density}) {
    if (platformId != null && density != null) {
      final ctx = dimensionContextFor(platformId, density);
      if (ctx != null) return ctx;
    }
    return activeDimensionContext;
  }

  /// Look up raw token value (no var() expansion).
  String? rawTokenValue(
    String key, {
    String? platformId,
    String? density,
  }) {
    final k = _normalizeVarName(key);
    final ctx = sliceFor(platformId: platformId, density: density);
    return ctx?.dimensions[k] ?? componentCustomProperties[k];
  }

  /// Expand `var(--Name)`, optional `var(--Name, fallback)` with balanced parens in fallback.
  ///
  /// When [dimensionContexts] is empty (brand has no Platforms foundation), unresolved
  /// `var(--Spacing-*)` / `var(--Shape-*)` / `var(--Dimension-*)` fall back to static
  /// f-scale tables when [platformId], [density], and optional [platformsConfig] are set.
  String? resolveCSSValue(
    String? value, {
    int maxDepth = 16,
    String? platformId,
    String? density,
    PlatformsFoundationConfig? platformsConfig,
    NativeTypographySnapshot? nativeTypography,
  }) {
    if (value == null) return null;
    var v = value.trim();
    if (v.isEmpty) return v;

    for (var i = 0; i < maxDepth; i++) {
      final parsed = _parseVarCall(v);
      if (parsed == null) return v;

      final name = _normalizeVarName(parsed.$1);
      final fallback = parsed.$2?.trim();

      final ctx = sliceFor(platformId: platformId, density: density);

      // Brand stroke scale (`--Stroke-S|M|L`, dynamic `--Stroke-*XL`) must resolve
      // from Convex payloads before static primitives — web `@layer brand` overrides
      // `primitives.css` for divider `[data-size]` → `var(--Stroke-*)`.
      if (name.startsWith('--Stroke-')) {
        final dim = ctx?.dimensions[name];
        if (dim != null) {
          v = dim.trim();
          continue;
        }
        final comp = componentCustomProperties[name];
        if (comp != null) {
          v = comp.trim();
          continue;
        }
      }

      // Architectural constants (--Shape-Pill, static strokes, …) must not be
      // shadowed by a corrupt/mis-synchronized entry in dimensionContexts payloads.
      final primitiveFirst = lengthPrimitiveSansPlatformDims(name);
      if (primitiveFirst != null) {
        v = primitiveFirst.trim();
        continue;
      }

      final dim = ctx?.dimensions[name];
      if (dim != null) {
        v = dim.trim();
        continue;
      }
      final comp = componentCustomProperties[name];
      if (comp != null) {
        v = comp.trim();
        continue;
      }

      final typoConcrete =
          nativeTypography?.resolveV2LabelCssCustomProperty(name);
      if (typoConcrete != null && typoConcrete.isNotEmpty) {
        v = typoConcrete.trim();
        continue;
      }

      if (platformId != null && density != null) {
        final staticLen = _staticPrimitiveLengthPxString(
          name: name,
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
        );
        if (staticLen != null) {
          v = staticLen.trim();
          continue;
        }
      }

      final motionFb = convexMotionCSSValue(name);
      if (motionFb != null) {
        v = motionFb.trim();
        continue;
      }

      if (fallback != null && fallback.isNotEmpty) {
        v = fallback;
        continue;
      }
      return v;
    }
    return v;
  }

  /// Parses leading `var(...)` into (firstArg, optionalRest) where rest may contain commas/parens.
  static (String, String?)? _parseVarCall(String input) {
    final t = input.trim();
    if (!t.startsWith('var(') || !t.endsWith(')')) return null;
    final inner = t.substring(4, t.length - 1).trim();
    if (inner.isEmpty) return null;

    var i = 0;
    if (!inner.startsWith('--')) return null;
    while (i < inner.length && inner[i] != ',' && inner[i] != ')') {
      if (inner[i] == '(') return null;
      i++;
    }
    if (i >= inner.length) return (inner, null);

    if (inner[i] != ',') return null;
    final name = inner.substring(0, i).trim();
    final rest = inner.substring(i + 1).trim();
    return (name, rest.isEmpty ? null : rest);
  }

  /// Hex colour from component map, e.g. `#ff00aa` or `rgb(…)` — returns null if not hex.
  String? resolveHexColor(String? value,
      {NativeTypographySnapshot? nativeTypography}) {
    final r = resolveCSSValue(value, nativeTypography: nativeTypography);
    if (r == null) return null;
    final t = r.trim();
    if (t.startsWith('#') && (t.length == 7 || t.length == 9)) return t;
    return null;
  }

  /// Parses a pixel length from a resolved CSS length, or common keywords.
  double? parsePx(
    String? css, {
    double shapePillFallback = 9999,
    String? platformId,
    String? density,
    PlatformsFoundationConfig? platformsConfig,
    NativeTypographySnapshot? nativeTypography,
  }) {
    final resolved = resolveCSSValue(
      css,
      platformId: platformId,
      density: density,
      platformsConfig: platformsConfig,
      nativeTypography: nativeTypography,
    )?.trim();
    return parsePxResolved(resolved, shapePillFallback: shapePillFallback);
  }

  /// Parses [resolved] after all `var()` expansion — [shapePillFallback] only applies
  /// when the string still mentions shape-pill (Convex should emit `9999px` via `--Shape-Pill`).
  double? parsePxResolved(
    String? resolved, {
    double shapePillFallback = 9999,
    double? relativeToPx,
  }) {
    if (resolved == null || resolved.isEmpty) return null;
    if (resolved.endsWith('%') && relativeToPx != null) {
      final pct =
          double.tryParse(resolved.substring(0, resolved.length - 1).trim());
      if (pct != null) return relativeToPx * pct / 100.0;
    }
    if (resolved.endsWith('px')) {
      return double.tryParse(resolved.substring(0, resolved.length - 2).trim());
    }
    if (resolved == '0') return 0;
    final lower = resolved.toLowerCase();
    if (lower.contains('shape-pill')) return shapePillFallback;
    return double.tryParse(resolved);
  }

  /// True when [value] is not a dangling `var(--*)` reference.
  static bool isConcreteCssValue(String? value) {
    if (value == null) return false;
    return !value.trim().startsWith('var(');
  }

  /// First `--*` argument of a leading `var(--Token, …)` (manifest alignment checks).
  static String? peelLeadingVar(String? raw) {
    if (raw == null) return null;
    final t = raw.trim();
    final m = RegExp(r'^var\((--[A-Za-z0-9-]+)').firstMatch(t);
    return m?.group(1);
  }

  /// First non-empty `--Component-*` entry in [keys].
  String? rawComponentCascade(Iterable<String> keys) {
    for (final k in keys) {
      final nk = _normalizeVarName(k);
      final v = componentCustomProperties[nk];
      if (v != null && v.trim().isNotEmpty) {
        return v;
      }
    }
    return null;
  }

  /// Resolve pixel length using manifest-style key cascade (size → base).
  double? resolveComponentLengthPxCascade(
    Iterable<String> keys, {
    List<String>? gaps,
    String? platformId,
    String? density,
    PlatformsFoundationConfig? platformsConfig,
    NativeTypographySnapshot? nativeTypography,
    double? relativeToPx,
  }) {
    var raw = rawComponentCascade(keys);
    if (raw == null) {
      // Entries absent from flat map — mimic `resolveCSSValue(var(--Token))`:
      // platform-independent lengths (Shape-Pill, strokes, …) resolve without toolbar ids.
      for (final k in keys) {
        final nk = _normalizeVarName(k);
        final resolved = resolveCSSValue(
          'var($nk)',
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
          nativeTypography: nativeTypography,
        );
        if (resolved != null && isConcreteCssValue(resolved)) {
          final px = parsePxResolved(resolved);
          if (px != null) return px;
        }
      }

      // Web Button.module.css: `--_btn-radius: var(--Button-borderRadius, var(--Shape-Pill));`
      final wantsPillRadiusFallback = keys.any((k) {
        final nk = _normalizeVarName(k);
        return nk == '--Button-borderRadius' ||
            nk == '--SingleTextButton-borderRadius' ||
            nk == '--IconButton-borderRadius';
      });
      if (wantsPillRadiusFallback) {
        final pillResolved = resolveCSSValue(
          'var(--Shape-Pill)',
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
          nativeTypography: nativeTypography,
        );
        if (pillResolved != null && isConcreteCssValue(pillResolved)) {
          final px = parsePxResolved(pillResolved);
          if (px != null) return px;
        }
        return 9999;
      }

      gaps?.add('missing component length cascade: ${keys.join(' → ')}');
      return null;
    }
    final resolved = resolveCSSValue(
      raw,
      platformId: platformId,
      density: density,
      platformsConfig: platformsConfig,
      nativeTypography: nativeTypography,
    );
    if (resolved == null || !isConcreteCssValue(resolved)) {
      final wantsPillRadiusFallback = keys.any((k) {
        final nk = _normalizeVarName(k);
        return nk == '--Button-borderRadius' ||
            nk == '--SingleTextButton-borderRadius' ||
            nk == '--IconButton-borderRadius';
      });
      if (wantsPillRadiusFallback) {
        final pillResolved = resolveCSSValue(
          'var(--Shape-Pill)',
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
          nativeTypography: nativeTypography,
        );
        if (pillResolved != null && isConcreteCssValue(pillResolved)) {
          final px = parsePxResolved(pillResolved);
          if (px != null) return px;
        }
        gaps?.add(
            'unresolved pill border radius raw=$raw — using stadium fallback 9999px');
        return 9999;
      }
      gaps?.add('unresolved length raw=$raw → $resolved');
      return null;
    }
    final px = parsePxResolved(resolved, relativeToPx: relativeToPx);
    if (px == null) {
      gaps?.add('not a px length: $resolved');
    }
    return px;
  }

  /// `--Dimension-f0` / `--Dimension-f-8` style step from the active context.
  double? dimensionStepPx(
    String step, {
    String? platformId,
    String? density,
  }) {
    final ctx = sliceFor(platformId: platformId, density: density);
    var s = step.trim();
    if (s.startsWith('--Dimension-')) {
      return parsePx(ctx?.dimensions[s]);
    }
    if (s.startsWith('Dimension-')) {
      return parsePx(ctx?.dimensions['--$s']);
    }
    return parsePx(ctx?.dimensions['--Dimension-$s']);
  }

  /// Component token length in px after resolving `var(--*)` (e.g. `--Button-borderRadius` → `var(--Shape-Pill)`).
  double? componentLengthPx(String tokenName) {
    final k = _normalizeVarName(tokenName);
    return parsePx(resolveCSSValue(componentCustomProperties[k]));
  }
}
