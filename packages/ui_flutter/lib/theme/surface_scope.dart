import 'package:flutter/widgets.dart';

import '../engine/native_theme_snapshot.dart';
import '../engine/surface_engine.dart';
import '../tokens/appearance_roles.dart';
import '../utils/one_ui_hex_color.dart';
import 'one_ui_root_surface_scope.dart';

export '../tokens/appearance_roles.dart' show normalizeAppearanceRoleKey;

/// Root + nested surface context — same data flow as RN `SurfaceContext.tsx` /
/// `OneUINativeThemeProvider` + `<Surface>`.
@immutable
class SurfaceContextValue {
  const SurfaceContextValue({
    required this.parentStep,
    required this.darkMode,
    required this.themeConfig,
    required this.resolvedRoles,
    this.surfaceDepth = 0,
    this.parentMode,
    this.parentAppearance = 'primary',
  });

  /// Step children resolve against (parent container fill).
  final int parentStep;

  final bool darkMode;
  final ThemeConfig themeConfig;

  /// Per-role flattened hex tokens at [parentStep] (RN `resolvedRoles`).
  final Map<String, FlatRoleTokens> resolvedRoles;

  /// 0 at page root; incremented by each [OneUiSurface] (web `SurfaceStepContext` depth).
  final int surfaceDepth;

  /// Nearest ancestor surface mode — for cross-role bold-on-bold reset.
  final String? parentMode;

  /// Effective appearance at this boundary (`auto` resolved — web `SurfaceStepContext`).
  final String parentAppearance;

  SurfaceContextValue copyWith({
    int? parentStep,
    bool? darkMode,
    ThemeConfig? themeConfig,
    Map<String, FlatRoleTokens>? resolvedRoles,
    int? surfaceDepth,
    String? parentMode,
    String? parentAppearance,
  }) {
    return SurfaceContextValue(
      parentStep: parentStep ?? this.parentStep,
      darkMode: darkMode ?? this.darkMode,
      themeConfig: themeConfig ?? this.themeConfig,
      resolvedRoles: resolvedRoles ?? this.resolvedRoles,
      surfaceDepth: surfaceDepth ?? this.surfaceDepth,
      parentMode: parentMode ?? this.parentMode,
      parentAppearance: parentAppearance ?? this.parentAppearance,
    );
  }
}

/// Builds [SurfaceContextValue] for the app root (page surface).
///
/// When [rootRolesJson] is present (Convex `getNativeThemeSnapshot.rootRoles`),
/// uses the server-resolved hex maps — same as RN `OneUINativeThemeProvider`.
/// Otherwise recomputes via the Dart `surface_engine` port.
SurfaceContextValue buildRootSurfaceContext({
  required ThemeConfig themeConfig,
  required int rootParentStep,
  required bool darkMode,
  Map<String, dynamic>? rootRolesJson,
}) {
  return SurfaceContextValue(
    parentStep: rootParentStep,
    darkMode: darkMode,
    themeConfig: themeConfig,
    resolvedRoles: resolveRootSurfaceRoles(
      themeConfig: themeConfig,
      rootParentStep: rootParentStep,
      darkMode: darkMode,
      rootRolesJson: rootRolesJson,
    ),
  );
}

bool _rootRolesChanged(
  Map<String, FlatRoleTokens> a,
  Map<String, FlatRoleTokens> b,
) {
  if (identical(a, b)) return false;
  if (a.length != b.length) return true;
  for (final entry in a.entries) {
    final other = b[entry.key];
    if (other == null) return true;
    if (entry.value.surfaces[kSurfaceBold] != other.surfaces[kSurfaceBold]) {
      return true;
    }
    if (entry.value.surfaces[kSurfaceSubtle] !=
        other.surfaces[kSurfaceSubtle]) {
      return true;
    }
    if (entry.value.surfaces[kSurfaceMinimal] !=
        other.surfaces[kSurfaceMinimal]) {
      return true;
    }
  }
  return false;
}

class OneUiSurfaceScope extends InheritedWidget {
  const OneUiSurfaceScope({
    required this.value,
    required super.child,
    super.key,
  });

  final SurfaceContextValue value;

  static SurfaceContextValue of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<OneUiSurfaceScope>();
    assert(scope != null,
        'OneUiSurfaceScope not found — wrap MaterialApp body with OneUiSurfaceScope');
    return scope!.value;
  }

  /// When absent (e.g. strict Convex-only components), returns null instead of asserting.
  static SurfaceContextValue? maybeOf(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<OneUiSurfaceScope>();
    return scope?.value;
  }

  /// Roles configured on this brand (`themeConfig.appearances` keys).
  static Set<String> configuredRoleKeys(BuildContext context) {
    return of(context)
        .themeConfig
        .appearances
        .keys
        .map(normalizeAppearanceRoleKey)
        .toSet();
  }

  /// Whether this brand's `themeConfig` defines the role (Convex `configuredRoles` parity).
  static bool isAppearanceConfigured(BuildContext context, String appearance) {
    final v = maybeOf(context);
    if (v == null) return false;
    final key = normalizeAppearanceRoleKey(appearance);
    return v.themeConfig.appearances.containsKey(key);
  }

  /// Resolves `appearance="auto"` to the parent's effective role (web/RN Surface).
  static String effectiveSurfaceAppearance(
    SurfaceContextValue parent,
    String appearance,
  ) {
    final raw = normalizeAppearanceRoleKey(appearance);
    if (raw == 'auto' || raw.isEmpty) {
      return normalizeAppearanceRoleKey(parent.parentAppearance);
    }
    return raw;
  }

  /// Leaf components (Slider, TouchSlider, Chip): web `useSurfaceAppearance() ?? 'secondary'`.
  ///
  /// At page root (`surfaceDepth == 0`) there is no enclosing `<Surface>`, so `auto`
  /// falls back to [fallback]. Inside a nested [OneUiSurface], inherits
  /// [effectiveSurfaceAppearance].
  static String resolveComponentAutoAppearance(
    SurfaceContextValue? surface, {
    String fallback = 'secondary',
  }) {
    if (surface != null && surface.surfaceDepth > 0) {
      return effectiveSurfaceAppearance(surface, 'auto');
    }
    return fallback;
  }

  /// Showcase / docs: nine canonical roles, or only roles present on the active brand.
  static List<String> appearanceRolesForBrand(BuildContext context) {
    final configured = configuredRoleKeys(context);
    if (configured.isEmpty) {
      return List<String>.from(appearanceRoles);
    }
    return appearanceRoles.where(configured.contains).toList(growable: false);
  }

  /// Read role tokens — RN `useSurfaceTokens(appearance)` (default `neutral` in RN).
  static FlatRoleTokens tokensOf(BuildContext context,
      [String appearance = 'primary']) {
    return tokensForAppearance(context, appearance);
  }

  /// Component paint path — mirrors RN `useSurfaceTokens` fallback chain:
  /// `appearance` → `primary` → `neutral`, with on-demand recompute when the role
  /// exists in `themeConfig` but is missing from `resolvedRoles` (snapshot drift).
  static FlatRoleTokens tokensForAppearance(
    BuildContext context,
    String appearance,
  ) {
    final v = of(context);
    final key = normalizeAppearanceRoleKey(appearance);
    final cached = v.resolvedRoles[key];
    if (cached != null) return cached;

    if (v.themeConfig.appearances.containsKey(key)) {
      final computed = resolveNativeContextRoles(
        v.themeConfig,
        v.parentStep,
        v.darkMode,
      );
      final fresh = computed[key];
      if (fresh != null) return fresh;
    }

    return v.resolvedRoles['primary'] ??
        v.resolvedRoles[normalizeAppearanceRoleKey('neutral')]!;
  }

  /// Strict lookup — null when the role is absent from `resolvedRoles` (appearance grids).
  static FlatRoleTokens? tokensMaybe(BuildContext context, String appearance) {
    final v = maybeOf(context);
    if (v == null) return null;
    final key = normalizeAppearanceRoleKey(appearance);
    return v.resolvedRoles[key];
  }

  /// Soft bar tint from primary (or neutral) **subtle** surface at root — Density / static demos.
  static Color primarySubtleBarColor(BuildContext context) {
    final v = of(context);
    final role = v.resolvedRoles['primary'] ?? v.resolvedRoles['neutral']!;
    return oneUiHexColor(role.surfaces[kSurfaceSubtle]!);
  }

  /// Strong accent from primary (or neutral) **bold** surface at root — Strokes / emphasis demos.
  static Color primaryBoldBarColor(BuildContext context) {
    final v = of(context);
    final role = v.resolvedRoles['primary'] ?? v.resolvedRoles['neutral']!;
    return oneUiHexColor(role.surfaces[kSurfaceBold]!);
  }

  @override
  bool updateShouldNotify(OneUiSurfaceScope oldWidget) {
    return value.parentStep != oldWidget.value.parentStep ||
        value.darkMode != oldWidget.value.darkMode ||
        value.themeConfig != oldWidget.value.themeConfig ||
        _rootRolesChanged(value.resolvedRoles, oldWidget.value.resolvedRoles);
  }
}

/// Wraps the subtree that should receive surface context (typically inside [MaterialApp], under [Theme]).
class OneUiSurfaceBootstrap extends StatelessWidget {
  const OneUiSurfaceBootstrap({
    required this.themeConfig,
    required this.darkMode,
    required this.child,
    this.rootParentStep,
    this.rootRoles,
    super.key,
  });

  final ThemeConfig themeConfig;
  final bool darkMode;

  /// When set (e.g. from [NativeThemeSnapshot]), must match the server `buildNativeTheme` anchor.
  /// If null, uses TS defaults: 2500 light / 100 dark.
  final int? rootParentStep;

  /// Convex `rootRoles` — pre-resolved hex per role at page root (RN parity).
  final Map<String, dynamic>? rootRoles;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final rootStep = rootParentStep ?? (darkMode ? 100 : 2500);
    final rootValue = buildRootSurfaceContext(
      themeConfig: themeConfig,
      rootParentStep: rootStep,
      darkMode: darkMode,
      rootRolesJson: rootRoles,
    );
    return OneUiRootSurfaceScope(
      rootValue: rootValue,
      child: OneUiSurfaceScope(
        value: rootValue,
        child: child,
      ),
    );
  }
}
